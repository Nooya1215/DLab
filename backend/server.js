import cluster from 'cluster';
import os from 'os';
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';

dotenv.config();

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'test';

if (cluster.isPrimary) {
  // CPU 수 만큼 워커 생성
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 워커가 죽었을 때 재시작
  cluster.on('exit', (worker, code, signal) => {
    cluster.fork();
  });

} else {
  async function startServer() {
    try {
      const client = new MongoClient(MONGO_URI);
      await client.connect();

      const db = client.db(DB_NAME);
      const usersCollection = db.collection('users');

      const app = express();

      app.use(express.json());
      app.use(cookieParser());
      app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
      }));

      // 회원가입
      app.post('/api/sign', async (req, res) => {
        let { userid, email, password } = req.body;
        if (!userid || !email || !password) {
          return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
        }

        userid = userid.trim().toLowerCase();
        email = email.trim().toLowerCase();

        try {
          const existingUser = await usersCollection.findOne({
            $or: [{ userid }, { email }],
          });

          if (existingUser) {
            return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          await usersCollection.insertOne({
            userid,
            email,
            password: hashedPassword,
          });

          res.json({ message: '회원가입 성공' });
        } catch (error) {
          res.status(500).json({ message: '서버 오류' });
        }
      });

      // 로그인
      app.post('/api/login', async (req, res) => {
        const { useridOrEmail, password } = req.body;
        if (!useridOrEmail || !password) {
          return res.status(400).json({ success: false, code: 'fillAllFields' });
        }

        try {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(useridOrEmail);
          const query = isEmail
            ? { email: useridOrEmail.toLowerCase() }
            : { userid: useridOrEmail.toLowerCase() };

          const user = await usersCollection.findOne(query);
          if (!user) {
            return res.status(401).json({ success: false, code: 'userNotFound' });
          }

          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return res.status(401).json({ success: false, code: 'wrongPassword' });
          }

          const token = jwt.sign(
            { userid: user.userid, id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
          );

          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
          });

          res.json({ success: true, code: 'loginSuccess' });
        } catch (error) {
          res.status(500).json({ success: false, code: 'serverError' });
        }
      });

      // 로그인 상태 체크
      app.get('/api/auth/check', (req, res) => {
        const token = req.cookies.token;
        if (!token) {
          return res.status(401).json({ loggedIn: false, message: '토큰이 없습니다.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).json({ loggedIn: false, message: '유효하지 않은 토큰입니다.' });
          }
          res.json({ loggedIn: true, userid: decoded.userid, id: decoded.id });
        });
      });

      // 로그아웃
      app.post('/api/logout', (req, res) => {
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
        res.json({ message: '로그아웃 성공' });
      });

      app.listen(PORT);

    } catch (err) {
      process.exit(1);
    }
  }

  startServer();
}
