import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// MongoDB 연결
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
console.log('✅ MongoDB Connected');

const db = client.db();         // your db name is in the URI
const usersCollection = db.collection('users');


// ✅ 회원가입
app.post('/api/sign', async (req, res) => {
  const { userid, email, password } = req.body;
  if (!userid || !email || !password) {
    return res.status(400).json({ message: "모든 항목을 입력해주세요." });
  }

  try {
    // 아이디 중복 확인
    const existingUser = await usersCollection.findOne({ userid });
    if (existingUser) {
      return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 저장
    await usersCollection.insertOne({ userid, email, password: hashedPassword });
    res.json({ message: "회원가입 성공" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});


// ✅ 로그인
app.post('/api/login', async (req, res) => {
  const { useridOrEmail, password } = req.body;
  if (!useridOrEmail || !password) {
    return res.status(400).json({ success: false, code: 'fillAllFields' });
  }

  try {
    const query = useridOrEmail.includes('@')
      ? { email: useridOrEmail }
      : { userid: useridOrEmail };

    const user = await usersCollection.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, code: 'userNotFound' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, code: 'wrongPassword' });
    }

    const token = jwt.sign(
      { userid: user.userid, id: user._id },
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
    console.error(error);
    res.status(500).json({ success: false, code: 'serverError' });
  }
});


// ✅ 로그인 상태 확인
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


// ✅ 로그아웃
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ message: '로그아웃 성공' });
});


// ✅ 서버 실행
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
