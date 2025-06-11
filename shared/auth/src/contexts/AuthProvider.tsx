'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY } from '../constants';
import { useAuth as useSharedAuth } from '../index';

// 创建认证上下文
const AuthContext = createContext<{
    user: any | null;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}>({
    user: null,
    login: async () => { throw new Error('未实现') },
    logout: async () => { throw new Error('未实现') },
    isLoading: true
});

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 使用共享的auth hook
    const sharedAuth = useSharedAuth();

    // 初始化时加载用户数据
    useEffect(() => {
        // 如果共享auth已经有用户数据，直接使用
        if (sharedAuth.isAuthenticated && sharedAuth.user) {
            setUser(sharedAuth.user);
            setIsLoading(false);
            return;
        }

        // 否则尝试从localStorage获取
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse user data');
            }
        }

        setIsLoading(false);
    }, [sharedAuth.isAuthenticated, sharedAuth.user]);

    // 登录函数
    const login = useCallback(async (usernameOrEmail: string, password: string) => {
        setIsLoading(true);
        try {
            // 使用共享auth的login方法
            await sharedAuth.login(usernameOrEmail, password);
            // 登录成功后同步user状态
            setUser(sharedAuth.user);
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [sharedAuth]);

    // 登出函数
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            // 使用共享auth的logout方法
            await sharedAuth.logout();
        } finally {
            setUser(null);
            setIsLoading(false);
        }
    }, [sharedAuth]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// 自定义钩子，用于访问认证上下文
export function useAuth() {
    return useContext(AuthContext);
}