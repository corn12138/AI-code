'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    AuthUser,
    csrfFetch,
    getCsrfToken,
    invalidateCsrfToken,
    loadSessionFromServer,
    refreshSessionCache,
    sessionCache
} from '../useAuth/utils';

export type User = AuthUser;

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const resolveInitialState = (): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> => {
    const user = sessionCache.get();
    return {
        user,
        token: null,
        isAuthenticated: Boolean(user),
    };
};

const ACCESS_TOKEN_WINDOW = 15 * 60 * 1000; // 15 minutes
const REFRESH_LEEWAY = 2 * 60 * 1000; // refresh 2 minutes before expiry

export const AuthSecureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initial = resolveInitialState();
    const [authState, setAuthState] = useState<AuthState>({
        ...initial,
        isLoading: !initial.user,
        isRefreshing: false,
        error: null,
    });

    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    const scheduleTokenRefresh = useCallback(() => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        refreshTimeoutRef.current = setTimeout(() => {
            void refreshToken();
        }, Math.max(ACCESS_TOKEN_WINDOW - REFRESH_LEEWAY, 60 * 1000));
    }, []);

    const updateState = useCallback((updates: Partial<AuthState>) => {
        setAuthState(prev => ({ ...prev, ...updates }));
    }, []);

    const setAuthData = useCallback((user: User) => {
        sessionCache.set(user);
        updateState({
            user,
            token: null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });
        scheduleTokenRefresh();
    }, [updateState, scheduleTokenRefresh]);

    const clearAuthData = useCallback(() => {
        sessionCache.clear();
        updateState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isRefreshing: false,
        });
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, [updateState]);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (isRefreshingRef.current) return false;

        isRefreshingRef.current = true;
        updateState({ isRefreshing: true });

        try {
            await getCsrfToken();
            const response = await csrfFetch('/api/auth/refresh', {
                method: 'POST',
            });

            if (!response.ok) {
                clearAuthData();
                return false;
            }

            const data = await response.json();
            if (data?.user) {
                setAuthData(data.user as User);
            } else {
                const user = await refreshSessionCache();
                if (user) {
                    setAuthData(user);
                }
            }

            invalidateCsrfToken();
            await getCsrfToken(true);
            return true;
        } catch (error) {
            clearAuthData();
            return false;
        } finally {
            isRefreshingRef.current = false;
            updateState({ isRefreshing: false });
        }
    }, [clearAuthData, setAuthData, updateState]);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            const user = await loadSessionFromServer();
            if (!isMounted) return;

            if (user) {
                setAuthData(user);
            } else {
                updateState({ isLoading: false, isAuthenticated: false });
            }
        };

        init().catch(() => {
            if (isMounted) {
                updateState({ isLoading: false });
            }
        });

        return () => {
            isMounted = false;
        };
    }, [setAuthData, updateState]);

    useEffect(() => () => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
    }, []);

    const resolveCredentials = (credentials: LoginCredentials): { email: string; password: string } => {
        if (credentials.usernameOrEmail) {
            return { email: credentials.usernameOrEmail, password: credentials.password };
        }
        if (credentials.email) {
            return { email: credentials.email, password: credentials.password };
        }
        if (credentials.username) {
            return { email: credentials.username, password: credentials.password };
        }
        throw new Error('Please provide email or username');
    };

    const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
        updateState({ isLoading: true, error: null });

        try {
            const payload = resolveCredentials(credentials);
            await getCsrfToken();
            const response = await csrfFetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data?.message || data?.error || 'Login failed';
                updateState({ isLoading: false, error: errorMessage });
                return { success: false, error: errorMessage };
            }

            if (data?.user) {
                setAuthData(data.user as User);
            } else {
                const user = await refreshSessionCache();
                if (user) {
                    setAuthData(user);
                }
            }

            invalidateCsrfToken();
            await getCsrfToken(true);

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            updateState({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [setAuthData, updateState]);

    const logout = useCallback(async (): Promise<void> => {
        updateState({ isLoading: true });

        try {
            await getCsrfToken();
            await csrfFetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            // ignore
        } finally {
            invalidateCsrfToken();
            clearAuthData();
        }
    }, [clearAuthData, updateState]);

    const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
        updateState({ isLoading: true, error: null });

        try {
            await getCsrfToken();
            const response = await csrfFetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data?.message || data?.error || 'Registration failed';
                updateState({ isLoading: false, error: errorMessage });
                return { success: false, error: errorMessage };
            }

            if (data?.user) {
                setAuthData(data.user as User);
            } else {
                const user = await refreshSessionCache();
                if (user) {
                    setAuthData(user);
                }
            }

            invalidateCsrfToken();
            await getCsrfToken(true);

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            updateState({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [setAuthData, updateState]);

    const updateUser = useCallback((userData: Partial<User>) => {
        setAuthState(prev => {
            if (!prev.user) {
                return prev;
            }

            const updatedUser = { ...prev.user, ...userData };
            sessionCache.set(updatedUser);

            return {
                ...prev,
                user: updatedUser,
            };
        });
    }, []);

    const clearError = useCallback(() => {
        updateState({ error: null });
    }, [updateState]);

    const value = useMemo<AuthContextType>(() => ({
        ...authState,
        login,
        logout,
        register,
        updateUser,
        refreshToken,
        clearError,
    }), [authState, login, logout, register, updateUser, refreshToken, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthSecure = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthSecure must be used within an AuthSecureProvider');
    }
    return context;
};
