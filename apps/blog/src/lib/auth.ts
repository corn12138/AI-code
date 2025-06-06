import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import api from './api';

// 登出函数
export async function logout() {
    try {
        // 调用后端登出API
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // 清除本地存储的认证信息
        localStorage.removeItem('auth-token');
        sessionStorage.removeItem('user-info');

        // 可选：清除其他应用特定存储
        document.cookie = 'auth-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // 刷新页面以确保状态完全清除
        window.location.href = '/';
    }
}

// 登录状态检查钩子
export function useAuthCheck(requiredAuth = false) {
    const router = useRouter();
    const { pathname } = router;

    useEffect(() => {
        // 跳过登录和注册页面的检查
        if (pathname === '/login' || pathname === '/register') return;

        const token = localStorage.getItem('auth-token');

        if (requiredAuth && !token) {
            toast({
                title: "需要登录",
                description: "请先登录后再访问此页面",
                variant: "destructive",
            });
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }

        // 可选：验证令牌有效性
        if (token) {
            api.get('/auth/validate-token')
                .catch(() => {
                    // 令牌无效，清除并跳转
                    localStorage.removeItem('auth-token');
                    if (requiredAuth) {
                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                    }
                });
        }
    }, [pathname, requiredAuth, router]);
}
