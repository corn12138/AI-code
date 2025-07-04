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
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => void;
    register: (userData: { username: string; email: string; password: string }) => Promise<void>;
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

    // 初始化认证状态
    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
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
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (credentials: { username: string; password: string }) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            // 这里调用实际的登录API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) throw new Error('登录失败');

            const { user, token } = await response.json();

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setAuthState({
                user,
                token,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
        });
    }, []);

    const register = useCallback(async (userData: { username: string; email: string; password: string }) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) throw new Error('注册失败');

            const { user, token } = await response.json();

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setAuthState({
                user,
                token,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const updateUser = useCallback((userData: Partial<User>) => {
        setAuthState(prev => {
            if (!prev.user) return prev;

            const updatedUser = { ...prev.user, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

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