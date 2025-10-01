'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    AuthUser,
    csrfFetch,
    getCsrfHeaderName,
    getCsrfToken,
    invalidateCsrfToken,
    loadSessionFromServer,
    refreshSessionCache,
    sessionCache
} from './utils';

export type User = AuthUser;

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
    login: (credentials: { email: string; password: string }) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (userData: { username: string; email: string; password: string }) => Promise<boolean>;
    updateUser: (userData: Partial<User>) => void;
    refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const resolveInitialUser = (): User | null => {
    try {
        return sessionCache.get();
    } catch (error) {
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialUser = resolveInitialUser();
    const [authState, setAuthState] = useState<AuthState>({
        user: initialUser,
        token: null,
        isLoading: !initialUser,
        isAuthenticated: Boolean(initialUser),
    });

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            const user = await loadSessionFromServer();
            if (!isMounted) return;

            if (user) {
                setAuthState({
                    user,
                    token: null,
                    isLoading: false,
                    isAuthenticated: true,
                });
            } else {
                setAuthState(prev => ({
                    ...prev,
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                }));
            }
        };

        bootstrap().catch(() => {
            if (isMounted) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const persistUser = useCallback((user: User) => {
        sessionCache.set(user);
        setAuthState({
            user,
            token: null,
            isAuthenticated: true,
            isLoading: false,
        });
    }, []);

    const clearSession = useCallback(() => {
        sessionCache.clear();
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    const login = useCallback(async (credentials: { email: string; password: string }): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            await getCsrfToken();
            const response = await csrfFetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            const data = await response.json();
            if (data?.user) {
                persistUser(data.user as User);
            } else {
                const user = await refreshSessionCache();
                if (user) {
                    persistUser(user);
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                    return false;
                }
            }

            invalidateCsrfToken();
            await getCsrfToken(true);
            return true;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, [persistUser]);

    const logout = useCallback(async (): Promise<void> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            await getCsrfToken();
            await csrfFetch('/api/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            // Swallow errors - logout should always clear client state
        } finally {
            invalidateCsrfToken();
            clearSession();
        }
    }, [clearSession]);

    const register = useCallback(async (userData: { username: string; email: string; password: string }): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            await getCsrfToken();
            const response = await csrfFetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            const data = await response.json();
            if (data?.user) {
                persistUser(data.user as User);
            } else {
                const user = await refreshSessionCache();
                if (user) {
                    persistUser(user);
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                    return false;
                }
            }

            invalidateCsrfToken();
            await getCsrfToken(true);
            return true;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, [persistUser]);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            await getCsrfToken();
            const response = await csrfFetch('/api/auth/refresh', {
                method: 'POST',
            });

            if (!response.ok) {
                clearSession();
                return false;
            }

            const data = await response.json();
            if (data?.user) {
                persistUser(data.user as User);
            } else {
                const user = await refreshSessionCache();
                if (user) {
                    persistUser(user);
                }
            }

            invalidateCsrfToken();
            await getCsrfToken(true);
            return true;
        } catch (error) {
            clearSession();
            return false;
        }
    }, [clearSession, persistUser]);

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

    const value = useMemo<AuthContextType>(() => ({
        ...authState,
        login,
        logout,
        register,
        updateUser,
        refreshToken,
    }), [authState, login, logout, register, updateUser, refreshToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth必须在AuthProvider内部使用');
    }
    return context;
};

export const CSRF_HEADER = getCsrfHeaderName();
