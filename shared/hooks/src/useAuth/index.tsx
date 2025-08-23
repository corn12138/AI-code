'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    roles?: string[];
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
    // 兼容两种调用方式：
    // 1) login({ email, password })
    // 2) login(usernameOrEmail, password)
    login: (
        credentialsOrUsername: { email: string; password: string } | string,
        passwordIfUsername?: string
    ) => Promise<boolean>;
    logout: () => void;
    register: (userData: { username: string; email: string; password: string }) => Promise<boolean>;
    updateUser: (userData: Partial<User>) => void;
    // 刷新accessToken（依赖后端httpOnly refreshToken cookie）
    refreshToken: () => Promise<boolean>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // 只在客户端执行初始化
    useEffect(() => {
        const initAuth = () => {
            if (typeof window === 'undefined') return;

            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setAuthState({
                        user,
                        token,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (
        credentialsOrUsername: { email: string; password: string } | string,
        passwordIfUsername?: string
    ): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            // 构造请求体：优先兼容后端Nest接口 { usernameOrEmail, password }
            let body: any;
            if (typeof credentialsOrUsername === 'string') {
                body = {
                    usernameOrEmail: credentialsOrUsername,
                    password: passwordIfUsername ?? ''
                };
            } else {
                const { email, password } = credentialsOrUsername;
                // 同时兼容使用邮箱登录
                body = { usernameOrEmail: email, password };
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            const data = await response.json();
            const { user, accessToken } = data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
            }

            setAuthState({
                user,
                token: accessToken,
                isLoading: false,
                isAuthenticated: true,
            });

            return true;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
        setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
        });
    }, []);

    const register = useCallback(async (userData: { username: string; email: string; password: string }): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            const data = await response.json();
            const { user, accessToken } = data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
            }

            setAuthState({
                user,
                token: accessToken,
                isLoading: false,
                isAuthenticated: true,
            });

            return true;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            const { accessToken } = data;

            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const user = userStr ? JSON.parse(userStr) as User : null;

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
            }

            setAuthState(prev => ({
                user: user ?? prev.user,
                token: accessToken,
                isLoading: false,
                isAuthenticated: Boolean(user ?? prev.user),
            }));

            return true;
        } catch (e) {
            return false;
        }
    }, []);

    const updateUser = useCallback((userData: Partial<User>) => {
        setAuthState(prev => {
            if (!prev.user) return prev;

            const updatedUser = { ...prev.user, ...userData };

            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            return {
                ...prev,
                user: updatedUser,
            };
        });
    }, []);

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        register,
        updateUser,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth必须在AuthProvider内部使用');
    }
    return context;
}; 