// scripts/importCards.js
import dotenv from 'dotenv';
import fs from 'fs';
import { MongoClient } from 'mongodb';

dotenv.config();

// JSON 데이터 읽기
const data = JSON.parse(fs.readFileSync('./data/cards.json', 'utf-8'));

// MongoDB 연결
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'test';

async function importData() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('✅ MongoDB 연결됨');

    const db = client.db(DB_NAME);
    const courses = db.collection('courses'); // 컬렉션 이름은 소문자로 자동 변환됨

    // 기존 데이터 제거 (선택)
    await courses.deleteMany({});
    console.log('🧹 기존 Course 데이터 제거됨');

    // 새 데이터 삽입
    await courses.insertMany(data);
    console.log('✅ cards.json에서 데이터 삽입 완료');
  } catch (err) {
    console.error('❌ 오류:', err);
  } finally {
    await client.close();
    process.exit();
  }
}

importData();
