'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';
import { initSessionChecker, useSessionExpiryListener } from '@shared/auth/sessionChecker';
import { initAuthSyncManager } from '@shared/auth/syncManager';
import { PropsWithChildren, useEffect } from 'react';

export function Providers({ children }: PropsWithChildren) {
    // 初始化会话检查
    useEffect(() => {
        try {
            initSessionChecker();
            initAuthSyncManager();
        } catch (error) {
            console.error('Failed to initialize auth services:', error);
        }
    }, []);

    // 会话过期监听
    useSessionExpiryListener(() => {
        toast({
            title: "会话已过期",
            description: "请重新登录以继续",
            variant: "destructive",
        });
        // 可以跳转到登录页面
    });

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
    );
}
