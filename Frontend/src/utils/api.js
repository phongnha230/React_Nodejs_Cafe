import axios from 'axios';
import { config } from '../config/env';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
});

// Nếu bạn có token, có thể gắn interceptor ở đây
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;