import { AUTH_TOKEN_KEY } from './src/constants';
import { refreshAuthToken } from './tokenManager';

/**
 * 周期性检查会话有效性，确保跨应用会话同步
 */
export function initSessionChecker(
    checkInterval = 60000, // 默认每分钟检查一次
    tokenExpiryThreshold = 300000 // 5分钟内到期则刷新
): () => void {
    // 解析JWT令牌
    function parseJwt(token: string) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // 检查令牌是否接近过期
    function isTokenNearExpiry(token: string): boolean {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) return false;

        const expiryTimeMs = payload.exp * 1000; // 转为毫秒
        return Date.now() + tokenExpiryThreshold >= expiryTimeMs;
    }

    // 设置检查间隔
    const interval = setInterval(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        // 未登录状态不处理
        if (!token) return;

        // 检查令牌是否接近过期
        if (isTokenNearExpiry(token)) {
            refreshAuthToken().catch(err => {
                console.error('Failed to refresh session:', err);

                // 如果刷新失败且令牌已过期，清除登录状态
                if (Date.now() >= parseJwt(token).exp * 1000) {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    // 通知用户会话已过期
                    window.dispatchEvent(new CustomEvent('session-expired'));
                }
            });
        }
    }, checkInterval);

    // 返回清理函数
    return () => clearInterval(interval);
}

/**
 * 使用会话过期通知
 */
export function useSessionExpiryListener(onExpiry: () => void): () => void {
    const handleSessionExpiry = () => {
        onExpiry();
    };

    window.addEventListener('session-expired', handleSessionExpiry);

    return () => {
        window.removeEventListener('session-expired', handleSessionExpiry);
    };
}
