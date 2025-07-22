// src/services/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // ✔ API 서버 주소
  withCredentials: true,               // ✔ 쿠키 포함
});

export default axiosInstance;
