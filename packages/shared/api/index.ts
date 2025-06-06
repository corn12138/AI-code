import axios from 'axios';

// 创建axios实例
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 跨域请求时发送凭证
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 如果是401错误并且不是刷新token的请求
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // 尝试刷新token
                const { data } = await api.post('/auth/refresh');

                // 更新localStorage和默认header
                localStorage.setItem('accessToken', data.accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

                // 更新失败请求的Authorization头
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

                // 重试原始请求
                return api(originalRequest);
            } catch (refreshError) {
                // 刷新token失败，清除认证信息
                localStorage.removeItem('accessToken');
                delete api.defaults.headers.common['Authorization'];

                // 如果是登录相关页面，不需要重定向
                if (!window.location.pathname.includes('/login')) {
                    // 重定向到登录页
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
