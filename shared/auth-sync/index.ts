/**
 * 跨项目认证状态同步
 */

// 定义回调函数类型
type AuthCallback = () => void;

// 监听存储变化事件
export function initAuthSyncListener(onLogout: AuthCallback, onLogin: AuthCallback): void {
    window.addEventListener('storage', (event) => {
        // 监听认证令牌变化
        if (event.key === 'auth-token') {
            if (!event.newValue && event.oldValue) {
                // Token被删除，执行登出逻辑
                onLogout();
            } else if (event.newValue && !event.oldValue) {
                // Token被添加，执行登录后逻辑
                onLogin();
            }
        }
    });

    // 单页应用内存储变化不会触发storage事件
    // 可以通过自定义事件处理
    window.addEventListener('app-auth-change', ((event: CustomEvent) => {
        if (event.detail.status === 'logout') {
            onLogout();
        } else if (event.detail.status === 'login') {
            onLogin();
        }
    }) as EventListener);
}

// 广播认证状态变化
export function broadcastAuthChange(status: 'login' | 'logout'): void {
    // 如果是登出，清除localStorage中的token
    if (status === 'logout') {
        localStorage.removeItem('auth-token');
    }

    // 触发自定义事件供当前应用使用
    window.dispatchEvent(new CustomEvent('app-auth-change', {
        detail: { status }
    }));

    // 尝试修改localStorage以触发storage事件
    if (status === 'logout') {
        const current = localStorage.getItem('auth-broadcast');
        localStorage.setItem('auth-broadcast', `logout-${Date.now()}`);
        setTimeout(() => {
            localStorage.setItem('auth-broadcast', current || '');
        }, 100);
    }
}
