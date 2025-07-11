// backend/routes/wishlist.js
import express from 'express';
import jwt from 'jsonwebtoken';
// 테스트용 주석입니다.
const router = express.Router();

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    req.user = user;
    next();
  });
}

export default function wishlistRoutes(db) {
  const collection = db.collection('wishlist');

  // 찜 추가
  router.post('/add', authenticateToken, async (req, res) => {
    const { courseId, title, image, price } = req.body;
    if (!courseId || !title || !image) {
      return res.status(400).json({ message: '필수 정보 누락' });
    }

    const userId = req.user.id;
    const exists = await collection.findOne({ userId, courseId });
    if (exists) {
      return res.status(200).json({ message: '이미 찜한 콘텐츠입니다.' });
    }

    await collection.insertOne({ userId, courseId, title, image, price });
    res.status(200).json({ message: '찜 추가 완료' });
  });

  // 찜 목록 조회
  router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const items = await collection.find({ userId }).toArray();
    res.status(200).json(items);
  });

  // 찜 해제
  router.post('/remove', authenticateToken, async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    await collection.deleteOne({ userId, courseId });
    res.status(200).json({ message: '찜 해제 완료' });
  });

  return router;
}
