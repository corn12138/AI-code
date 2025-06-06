import React, { createContext, useEffect, useState } from 'react';
import { api } from '../api';

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    error: string | null;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    accessToken: null,
    isLoading: true,
    error: null,
    login: async () => { },
    logout: async () => { },
    isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('accessToken');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                // 设置API请求的默认token
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // 获取当前用户信息
                const { data } = await api.get('/auth/me');

                setUser(data);
                setAccessToken(storedToken);
            } catch (err) {
                console.error('获取用户信息失败', err);
                // 尝试刷新token
                try {
                    const { data } = await api.post('/auth/refresh');
                    localStorage.setItem('accessToken', data.accessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

                    // 重新获取用户信息
                    const userResponse = await api.get('/auth/me');
                    setUser(userResponse.data);
                    setAccessToken(data.accessToken);
                } catch (refreshErr) {
                    // 如果刷新token失败，清除认证信息
                    localStorage.removeItem('accessToken');
                    delete api.defaults.headers.common['Authorization'];
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (usernameOrEmail: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/auth/login', {
                usernameOrEmail,
                password,
            });

            setUser(data.user);
            setAccessToken(data.accessToken);
            localStorage.setItem('accessToken', data.accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        } catch (err: any) {
            console.error('登录失败', err);
            setError(err.response?.data?.message || '登录失败，请检查账号密码');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            if (accessToken) {
                await api.post('/auth/logout');
            }
        } catch (err) {
            console.error('登出时发生错误', err);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            delete api.defaults.headers.common['Authorization'];
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isLoading,
                error,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
