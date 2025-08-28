import axios from 'axios';
import { config } from 'shared/config';

const apiClient = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    withCredentials: true
});

// 添加请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 优先读取与blog/lowcode一致的键
        const accessToken = localStorage.getItem('accessToken');
        const legacyToken = localStorage.getItem('auth-token');
        const token = accessToken || legacyToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 添加响应拦截器
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // 处理 token 刷新逻辑
        }
        return Promise.reject(error);
    }
);

export default apiClient;
