// backend/models/Course.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: Number,
  title: String,
  image: String,
  price: String,
  wish: Number,
  downloads: Number
});

export default mongoose.model('Course', courseSchema);
