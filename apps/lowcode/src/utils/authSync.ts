import { trySyncNow } from './offlineStorage';

// 登录状态存储键
const AUTH_TOKEN_KEY = 'lowcode-auth-token';
const USER_DATA_KEY = 'lowcode-user-data';

// 存储认证信息
// Define interface for user data
export interface UserData {
    [key: string]: any;
}

export function storeAuth(token: string, userData: UserData): void {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

        // 同步到sessionStorage以支持多标签页
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);

        // 设置auth cookie (httpOnly由服务器设置)
        document.cookie = `auth-session=true; path=/; max-age=86400; samesite=strict`;
}

// 清除认证信息
export async function clearAuth() {
    try {
        // 先尝试同步所有未保存的更改
        if (navigator.onLine) {
            await trySyncNow();
        }

        // 调用登出API
        if (navigator.onLine) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
                }
            });
        }
    } catch (error) {
        console.warn('Error during logout sync:', error);
    } finally {
        // 清除所有存储的认证信息
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(USER_DATA_KEY);

        // 清除cookie
        document.cookie = 'auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
}

// 更新service worker注册中的认证状态
// Define interface for the service worker message
interface AuthStatusMessage {
    type: 'AUTH_STATUS_CHANGE';
    payload: {
        isLoggedIn: boolean;
    };
}

export function updateServiceWorkerAuth(isLoggedIn: boolean): void {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                        type: 'AUTH_STATUS_CHANGE',
                        payload: { isLoggedIn }
                });
        }
}

// 修改service worker中的同步API调用，加入认证
export function enhanceServiceWorkerWithAuth() {
    // 在service-worker.js中处理这条消息
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NEED_AUTH_TOKEN') {
                    const token = localStorage.getItem(AUTH_TOKEN_KEY);
                    event.ports[0].postMessage({ token });
                }
            });
        });
    }
}
