import express from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const router = express.Router();

export default function createWishlistRoutes(db) {
  const wishlistCollection = db.collection('wishlist');

  // 🔍 찜 목록 조회
  router.get('/', async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: '로그인 필요' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const wishlist = await wishlistCollection.find({ userId }).toArray();
      res.json(wishlist);
    } catch (err) {
      console.error('찜 목록 조회 실패:', err);
      res.status(500).json({ message: '찜 목록 조회 실패' });
    }
  });

  // ➕ 찜 추가
  router.post('/add', async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: '로그인 필요' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const { courseId, title, image, price } = req.body;

      const exists = await wishlistCollection.findOne({ userId, courseId });
      if (exists) {
        return res.status(409).json({ message: '이미 찜한 콘텐츠입니다.' });
      }

      await wishlistCollection.insertOne({
        userId,
        courseId,
        title,
        image,
        price,
        createdAt: new Date(),
      });

      res.json({ message: '찜 추가 완료' });
    } catch (err) {
      console.error('찜 추가 실패:', err);
      res.status(500).json({ message: '찜 추가 실패' });
    }
  });

  // ➖ 찜 해제
  router.post('/remove', async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: '로그인 필요' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const { courseId } = req.body;

      await wishlistCollection.deleteOne({ userId, courseId });

      res.json({ message: '찜 해제 완료' });
    } catch (err) {
      console.error('찜 해제 실패:', err);
      res.status(500).json({ message: '찜 해제 실패' });
    }
  });

  return router;
}
