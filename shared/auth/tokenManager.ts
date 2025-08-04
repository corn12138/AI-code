import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from './src/constants';

// 防止并发刷新请求
let refreshPromise: Promise<string> | null = null;

// 令牌刷新函数
export async function refreshAuthToken(): Promise<string> {
    // 如果已有刷新请求进行中，返回该Promise
    if (refreshPromise) return refreshPromise;

    refreshPromise = new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                withCredentials: true
            });

            const { accessToken } = response.data;
            localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

            resolve(accessToken);
        } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            reject(error);
        } finally {
            refreshPromise = null;
        }
    });

    return refreshPromise;
}

// 检查令牌是否需要刷新(对于无法使用拦截器的场景)
export function setupTokenRefreshCheck(intervalMinutes = 5): () => void {
    const checkInterval = setInterval(async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        // 如果没有令牌，不需要刷新
        if (!token) return;

        try {
            // 解析JWT以检查过期时间
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000; // 转换为毫秒
            const currentTime = Date.now();

            // 如果令牌将在10分钟内过期，则刷新
            if (expiryTime - currentTime < 10 * 60 * 1000) {
                await refreshAuthToken();
                console.log('Auth token refreshed proactively');
            }
        } catch (error) {
            console.error('Error checking token expiry:', error);
        }
    }, intervalMinutes * 60 * 1000);

    // 返回清理函数
    return () => clearInterval(checkInterval);
}
