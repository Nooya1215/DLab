// src/services/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // ⬅️ 로컬에서 실행 중인 Express 서버 주소로 수정
  withCredentials: true
});

export default axiosInstance;
