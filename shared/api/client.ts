import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_PATH, AUTH_TOKEN_KEY } from '../auth/constants';
import { refreshAuthToken } from '../auth/tokenManager';

export function createApiClient(
    baseUrl?: string,
    extraOptions?: AxiosRequestConfig
): AxiosInstance {
    const client = axios.create({
        baseURL: baseUrl || `http://localhost:3001${API_BASE_PATH}`,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
        ...extraOptions
    });

    // 请求拦截器
    client.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // CSRF令牌
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (csrfToken) {
                    config.headers['X-CSRF-Token'] = csrfToken;
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 响应拦截器
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // 令牌刷新逻辑
            if (error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url.includes('/auth/refresh')) {

                originalRequest._retry = true;

                try {
                    const newToken = await refreshAuthToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    window.dispatchEvent(new CustomEvent('session-expired'));
                    return Promise.reject(error);
                }
            }

            return Promise.reject(error);
        }
    );

    return client;
}
