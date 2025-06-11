'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from "./constants";

// 定义认证上下文的类型
interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (credentials: { usernameOrEmail?: string; email?: string; password: string }) => Promise<any>;
    logout: () => Promise<void>;
    register: (userData: any) => Promise<any>;
    loading: boolean;
    isLoading: boolean; // 添加别名以兼容不同的命名约定
}

// 使用适当的类型创建上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 实现基础的认证hook
function useAuthBase(): AuthContextType {
    const [user, setUser] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // 在这里检查localStorage或cookies中的令牌
        // 如果有，则验证令牌并设置用户状态
        const checkAuth = async () => {
            try {
                // 从本地存储获取令牌
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                if (token) {
                    // 这里应该验证令牌并获取用户信息
                    // 为简单起见，我们只检查令牌是否存在
                    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
                    setUser(userData);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Authentication check failed', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // 登录函数
    const login = async (credentials: { usernameOrEmail?: string; email?: string; password: string }) => {
        try {
            setLoading(true);

            // 统一处理登录参数
            const loginData = {
                usernameOrEmail: credentials.usernameOrEmail || credentials.email,
                password: credentials.password,
            };

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 包含cookies
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '服务器内部错误');
            }

            const data = await response.json();

            if (data.accessToken) {
                localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
            }
            if (data.user) {
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
                setUser(data.user);
                setIsAuthenticated(true);
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            console.log('登录错误:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 登出函数
    const logout = async () => {
        try {
            setLoading(true);

            // 调用API的登出端点
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
                    },
                });
            } catch (error) {
                console.warn('登出API调用失败，但继续清除本地状态');
            }

            // 清除本地存储
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 注册函数
    const register = async (userData: any) => {
        try {
            setLoading(true);
            // 这里应该调用API注册端点
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        isAuthenticated,
        user,
        login,
        logout,
        register,
        loading,
        isLoading: loading, // 添加别名
    };
}

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
    const auth = useAuthBase();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const auth = useContext(AuthContext);
    if (!auth) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return auth;
}