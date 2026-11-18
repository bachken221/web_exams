import axios from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor gắn Bearer Token vào mọi request gửi lên Backend
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor bắt lỗi 401 (Hết hạn phiên đăng nhập) để tự động đăng xuất & điều hướng về /login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        storage.clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

