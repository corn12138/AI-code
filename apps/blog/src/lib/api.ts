import axios from 'axios';

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 请求拦截器 - 添加认证Token
api.interceptors.request.use(
    (config) => {
        // 仅在客户端添加认证token
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth-token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
