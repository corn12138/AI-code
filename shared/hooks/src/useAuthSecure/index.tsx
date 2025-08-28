'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ==================== 类型定义 ====================

export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    roles?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isRefreshing: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email?: string;
    username?: string;
    usernameOrEmail?: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
    updateUser: (userData: Partial<User>) => void;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
}

// ==================== 工具函数 ====================

// 安全的localStorage操作
const secureStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn(`Failed to get item from localStorage: ${key}`, error);
            return null;
        }
    },

    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Failed to set item in localStorage: ${key}`, error);
        }
    },

    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Failed to remove item from localStorage: ${key}`, error);
        }
    },

    clear: (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
        } catch (error) {
            console.warn('Failed to clear auth data from localStorage', error);
        }
    }
};

// API请求封装
const apiRequest = async (
    url: string,
    options: RequestInit = {},
    includeAuth: boolean = false,
    token?: string
): Promise<Response> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (includeAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        credentials: 'include',
        ...options,
        headers,
    });
};

// Token有效性检查
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// ==================== Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Provider ====================

export const AuthSecureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
        isRefreshing: false,
        error: null,
    });

    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    // ==================== 认证状态更新 ====================

    const updateAuthState = useCallback((updates: Partial<AuthState>) => {
        setAuthState(prev => ({ ...prev, ...updates }));
    }, []);

    const setAuthData = useCallback((user: User, token: string) => {
        secureStorage.setItem('accessToken', token);
        secureStorage.setItem('user', JSON.stringify(user));

        updateAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });
    }, [updateAuthState]);

    const clearAuthData = useCallback(() => {
        secureStorage.clear();

        updateAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isRefreshing: false,
        });

        // 清除自动刷新定时器
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, [updateAuthState]);

    // ==================== 自动Token刷新 ====================

    const scheduleTokenRefresh = useCallback((token: string) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = payload.exp * 1000 - Date.now();

            // 在token过期前5分钟刷新
            const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000);

            refreshTimeoutRef.current = setTimeout(() => {
                refreshToken();
            }, refreshTime);
        } catch (error) {
            console.warn('Failed to schedule token refresh:', error);
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (isRefreshingRef.current) return false;

        isRefreshingRef.current = true;
        updateAuthState({ isRefreshing: true });

        try {
            const response = await apiRequest('/api/auth/refresh', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const { user, accessToken } = data;

            setAuthData(user, accessToken);
            scheduleTokenRefresh(accessToken);

            return true;
        } catch (error) {
            console.warn('Token refresh failed:', error);
            clearAuthData();
            return false;
        } finally {
            isRefreshingRef.current = false;
            updateAuthState({ isRefreshing: false });
        }
    }, [updateAuthState, setAuthData, clearAuthData, scheduleTokenRefresh]);

    // ==================== 初始化认证状态 ====================

    useEffect(() => {
        const initAuth = async () => {
            if (typeof window === 'undefined') return;

            const token = secureStorage.getItem('accessToken');
            const userStr = secureStorage.getItem('user');

            if (!token || !userStr) {
                updateAuthState({ isLoading: false });
                return;
            }

            try {
                const user = JSON.parse(userStr) as User;

                // 检查token是否过期
                if (isTokenExpired(token)) {
                    // 尝试刷新token
                    const refreshSuccess = await refreshToken();
                    if (!refreshSuccess) {
                        clearAuthData();
                    }
                } else {
                    setAuthData(user, token);
                    scheduleTokenRefresh(token);
                }
            } catch (error) {
                console.warn('Failed to initialize auth state:', error);
                clearAuthData();
            }
        };

        initAuth();
    }, [updateAuthState, refreshToken, clearAuthData, setAuthData, scheduleTokenRefresh]);

    // ==================== 认证方法 ====================

    const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
        updateAuthState({ isLoading: true, error: null });

        try {
            // 构造请求体，兼容博客后端API
            let body: any;
            if (credentials.usernameOrEmail) {
                body = {
                    email: credentials.usernameOrEmail, // 后端期望email字段
                    password: credentials.password,
                };
            } else if (credentials.email) {
                body = {
                    email: credentials.email,
                    password: credentials.password,
                };
            } else if (credentials.username) {
                body = {
                    email: credentials.username, // 将username当作email处理
                    password: credentials.password,
                };
            } else {
                throw new Error('Please provide email or username');
            }

            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Login failed';
                updateAuthState({ isLoading: false, error: errorMessage });
                return { success: false, error: errorMessage };
            }

            const { user, accessToken } = data;
            setAuthData(user, accessToken);
            scheduleTokenRefresh(accessToken);

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            updateAuthState({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [updateAuthState, setAuthData, scheduleTokenRefresh]);

    const logout = useCallback(async (): Promise<void> => {
        updateAuthState({ isLoading: true });

        try {
            // 调用后端登出接口（可选）
            await apiRequest('/api/auth/logout', {
                method: 'POST',
            }, true, authState.token || undefined);
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            clearAuthData();
        }
    }, [updateAuthState, clearAuthData, authState.token]);

    const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
        updateAuthState({ isLoading: true, error: null });

        try {
            const response = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Registration failed';
                updateAuthState({ isLoading: false, error: errorMessage });
                return { success: false, error: errorMessage };
            }

            const { user, accessToken } = data;
            setAuthData(user, accessToken);
            scheduleTokenRefresh(accessToken);

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            updateAuthState({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [updateAuthState, setAuthData, scheduleTokenRefresh]);

    const updateUser = useCallback((userData: Partial<User>) => {
        if (!authState.user) return;

        const updatedUser = { ...authState.user, ...userData };
        secureStorage.setItem('user', JSON.stringify(updatedUser));
        updateAuthState({ user: updatedUser });
    }, [authState.user, updateAuthState]);

    const clearError = useCallback(() => {
        updateAuthState({ error: null });
    }, [updateAuthState]);

    // ==================== Cleanup ====================

    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    // ==================== Context Value ====================

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        register,
        updateUser,
        refreshToken,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ==================== Hook ====================

export const useAuthSecure = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthSecure must be used within an AuthSecureProvider');
    }
    return context;
};

// ==================== 工具导出 ====================

export { apiRequest, isTokenExpired, secureStorage };

