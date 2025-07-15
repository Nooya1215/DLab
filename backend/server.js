import cluster from 'cluster';
import os from 'os';
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import B2 from 'backblaze-b2';
import axios from 'axios';

// 👇 wishlist 라우터 import 추가
import wishlistRoutes from './routes/wishlist.js';

dotenv.config();

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'test';

// Backblaze B2 객체
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

async function authorizeB2() {
  await b2.authorize();
}

async function uploadToB2(localPath, b2FileName, mimeType) {
  const data = fs.readFileSync(localPath);
  const { data: uploadUrlData } = await b2.getUploadUrl({ bucketId: process.env.B2_BUCKET_ID });
  await b2.uploadFile({
    uploadUrl: uploadUrlData.uploadUrl,
    uploadAuthToken: uploadUrlData.authorizationToken,
    fileName: b2FileName,
    data,
    mime: mimeType,
  });
  return b2FileName;
}

async function downloadFromB2(fileName) {
  await b2.authorize();
  const { data } = await b2.downloadFileByName({
    bucketName: process.env.B2_BUCKET_NAME,
    fileName,
    responseType: 'arraybuffer',
  });
  return data;
}

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on('exit', () => cluster.fork());
} else {
  async function startServer() {
    try {
      await authorizeB2();

      const client = new MongoClient(MONGO_URI);
      await client.connect();
      const db = client.db(DB_NAME);
      const usersCollection = db.collection('users');
      const uploadsCollection = db.collection('uploads');

      const app = express();
      app.use(express.json());
      app.use(cookieParser());
      app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
      }));

      const uploadBase = path.join(process.cwd(), 'uploads');
      const musicFolder = path.join(uploadBase, 'music');
      const photoFolder = path.join(uploadBase, 'photo');
      const videoFolder = path.join(uploadBase, 'video');
      const videoThumbnailFolder = path.join(videoFolder, 'thumbnails');

      [musicFolder, photoFolder, videoFolder, videoThumbnailFolder].forEach(folder => {
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
      });

      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          if (file.mimetype.startsWith('audio/')) cb(null, musicFolder);
          else if (file.mimetype.startsWith('image/')) cb(null, photoFolder);
          else if (file.mimetype.startsWith('video/')) cb(null, videoFolder);
          else cb(new Error('허용되지 않는 파일 형식입니다.'));
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const basename = path.basename(file.originalname, ext);
          cb(null, `${basename}-${Date.now()}${ext}`);
        }
      });

      const upload = multer({
        storage,
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          if (
            file.mimetype.startsWith('audio/') ||
            file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/')
          ) cb(null, true);
          else cb(new Error('오디오, 이미지, 비디오 파일만 업로드 가능합니다.'));
        }
      });

      const cpUpload = upload.fields([
        { name: 'music', maxCount: 1 },
        { name: 'photo', maxCount: 10 },
        { name: 'video', maxCount: 1 },
      ]);

      // 회원가입
      app.post('/api/sign', async (req, res) => {
        let { userid, email, password } = req.body;
        if (!userid || !email || !password) {
          return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
        }
        userid = userid.trim().toLowerCase();
        email = email.trim().toLowerCase();

        const existingUser = await usersCollection.findOne({ $or: [{ userid }, { email }] });
        if (existingUser) {
          return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({ userid, email, password: hashedPassword, role: 'user' });
        res.json({ message: '회원가입 성공' });
      });

      // 로그인
      app.post('/api/login', async (req, res) => {
        const { useridOrEmail, password } = req.body;
        if (!useridOrEmail || !password) {
          return res.status(400).json({ success: false, code: 'fillAllFields', message: '아이디(이메일)와 비밀번호를 모두 입력해주세요.' });
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(useridOrEmail);
        const query = isEmail ? { email: useridOrEmail.toLowerCase() } : { userid: useridOrEmail.toLowerCase() };

        const user = await usersCollection.findOne(query);
        if (!user) {
          return res.status(401).json({ success: false, code: 'userNotFound', message: '사용자를 찾을 수 없습니다.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(401).json({ success: false, code: 'wrongPassword', message: '비밀번호가 틀렸습니다.' });
        }

        const token = jwt.sign({ userid: user.userid, id: user._id.toString(), role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000, path: '/' });

        res.json({ success: true, code: 'loginSuccess', userid: user.userid, role: user.role, isAdmin: user.role === 'admin' });
      });

      app.get('/api/auth/check', (req, res) => {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ loggedIn: false, message: '토큰이 없습니다.' });
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) return res.status(401).json({ loggedIn: false, message: '유효하지 않은 토큰입니다.' });
          res.json({ loggedIn: true, userid: decoded.userid, id: decoded.id, role: decoded.role || 'user' });
        });
      });

      app.post('/api/logout', (req, res) => {
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });
        res.json({ message: '로그아웃 성공' });
      });

      // ... 업로드 및 삭제 API 등 생략 (기존 코드 유지) ...

      app.get('/api/courses', async (req, res) => {
        try {
          const courses = await db.collection('courses').find().toArray();
          res.json(courses);
        } catch (err) {
          console.error('코스 불러오기 실패:', err);
          res.status(500).json({ message: '서버 오류' });
        }
      });

      app.get('/api/courses/:id', async (req, res) => {
        try {
          const id = Number(req.params.id);
          if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 ID입니다.' });

          const course = await db.collection('courses').findOne({ id });
          if (!course) return res.status(404).json({ message: 'Course not found' });

          res.json(course);
        } catch (err) {
          console.error('상세 조회 실패:', err);
          res.status(500).json({ message: '서버 오류' });
        }
      });

      // ✅ wishlist 라우터 연결
      app.use('/api/wishlist', wishlistRoutes(db));

      app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
    } catch (err) {
      console.error('서버 시작 실패:', err);
      process.exit(1);
    }
  }

  startServer();
}
