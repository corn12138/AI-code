import { AUTH_TOKEN_KEY } from './src/constants';

/**
 * 在多个应用/标签页间同步认证状态
 */
export function initAuthSyncManager() {
    // 监听存储变化事件
    window.addEventListener('storage', (event) => {
        if (event.key === AUTH_TOKEN_KEY) {
            if (!event.newValue && event.oldValue) {
                // Token被删除，执行登出逻辑
                window.dispatchEvent(new CustomEvent('auth-state-change', {
                    detail: { state: 'logged-out' }
                }));
            } else if (event.newValue && !event.oldValue) {
                // Token被添加，执行登录后逻辑
                window.dispatchEvent(new CustomEvent('auth-state-change', {
                    detail: { state: 'logged-in' }
                }));
            }
        }
    });
}

/**
 * 广播认证状态变化到其他标签页/窗口
 */
export function broadcastAuthChange(type: 'login' | 'logout') {
    // 使用自定义事件系统
    const event = new StorageEvent('storage', {
        key: AUTH_TOKEN_KEY,
        oldValue: type === 'logout' ? localStorage.getItem(AUTH_TOKEN_KEY) : null,
        newValue: type === 'login' ? localStorage.getItem(AUTH_TOKEN_KEY) : null,
        storageArea: localStorage,
    });

    // 手动触发事件
    window.dispatchEvent(event);
}

/**
 * 添加钩子以响应认证状态变化
 */
export function useAuthStateListener(
    onLogin: () => void,
    onLogout: () => void
): () => void {
    const handleAuthChange = (e: CustomEvent) => {
        if (e.detail.state === 'logged-in') {
            onLogin();
        } else if (e.detail.state === 'logged-out') {
            onLogout();
        }
    };

    window.addEventListener('auth-state-change', handleAuthChange as EventListener);

    // 返回清理函数
    return () => {
        window.removeEventListener('auth-state-change', handleAuthChange as EventListener);
    };
}
