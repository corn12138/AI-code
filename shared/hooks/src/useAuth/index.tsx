'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
    login: (credentials: { email: string; password: string }) => Promise<boolean>;
    logout: () => void;
    register: (userData: { username: string; email: string; password: string }) => Promise<boolean>;
    updateUser: (userData: Partial<User>) => void;
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

    const login = useCallback(async (credentials: { email: string; password: string }): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
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