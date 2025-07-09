import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// 用户类型定义
interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
}

// 认证状态类型
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// 认证上下文类型
interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: { username: string; email: string; password: string }) => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    clearError: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 模拟用户数据
const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: '123456', role: 'admin' as const },
    { id: 2, username: 'user', email: 'user@example.com', password: '123456', role: 'user' as const },
];

// 认证提供者组件
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    });

    // 模拟API延迟
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 登录函数
    const login = useCallback(async (email: string, password: string) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await delay(1000); // 模拟网络延迟

            const user = mockUsers.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('邮箱或密码错误');
            }

            const { password: _, ...userWithoutPassword } = user;

            setAuthState({
                user: userWithoutPassword,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            // 模拟保存到localStorage
            localStorage.setItem('auth-demo-user', JSON.stringify(userWithoutPassword));

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : '登录失败'
            }));
        }
    }, []);

    // 登出函数
    const logout = useCallback(() => {
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        });
        localStorage.removeItem('auth-demo-user');
    }, []);

    // 注册函数
    const register = useCallback(async (userData: { username: string; email: string; password: string }) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await delay(1200);

            // 检查邮箱是否已存在
            if (mockUsers.some(u => u.email === userData.email)) {
                throw new Error('该邮箱已被注册');
            }

            const newUser: User = {
                id: mockUsers.length + 1,
                username: userData.username,
                email: userData.email,
                role: 'user'
            };

            setAuthState({
                user: newUser,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            localStorage.setItem('auth-demo-user', JSON.stringify(newUser));

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : '注册失败'
            }));
        }
    }, []);

    // 更新用户信息
    const updateProfile = useCallback(async (userData: Partial<User>) => {
        if (!authState.user) return;

        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await delay(800);

            const updatedUser = { ...authState.user, ...userData };

            setAuthState(prev => ({
                ...prev,
                user: updatedUser,
                isLoading: false
            }));

            localStorage.setItem('auth-demo-user', JSON.stringify(updatedUser));

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : '更新失败'
            }));
        }
    }, [authState.user]);

    // 清除错误
    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

    // 初始化时检查本地存储
    useEffect(() => {
        const savedUser = localStorage.getItem('auth-demo-user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                localStorage.removeItem('auth-demo-user');
            }
        }
    }, []);

    const contextValue: AuthContextType = {
        ...authState,
        login,
        logout,
        register,
        updateProfile,
        clearError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// useAuth hook
function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// 登录表单组件
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            await login(email, password);
        }
    };

    const fillDemoData = (type: 'admin' | 'user') => {
        setEmail(type === 'admin' ? 'admin@example.com' : 'user@example.com');
        setPassword('123456');
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '300px' }}>
            <h5 style={{ margin: '0 0 16px 0' }}>用户登录</h5>

            {error && (
                <div style={{
                    padding: '8px',
                    background: '#fff2f0',
                    border: '1px solid #ffb3b3',
                    borderRadius: '4px',
                    color: '#ff4d4f',
                    marginBottom: '12px',
                    fontSize: '12px'
                }}>
                    {error}
                    <button
                        type="button"
                        onClick={clearError}
                        style={{
                            float: 'right',
                            background: 'none',
                            border: 'none',
                            color: '#ff4d4f',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <div style={{ marginBottom: '12px' }}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="邮箱地址"
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading || !email || !password}
                style={{
                    width: '100%',
                    padding: '10px',
                    background: isLoading || !email || !password ? '#f5f5f5' : '#1890ff',
                    color: isLoading || !email || !password ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
                    marginBottom: '12px'
                }}
            >
                {isLoading ? '登录中...' : '登录'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => fillDemoData('admin')}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: '#faad14',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    管理员登录
                </button>
                <button
                    type="button"
                    onClick={() => fillDemoData('user')}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: '#52c41a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    普通用户登录
                </button>
            </div>
        </form>
    );
}

// 用户资料组件
function UserProfile() {
    const { user, logout, updateProfile, isLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');

    const handleUpdate = async () => {
        await updateProfile({ username });
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <div style={{ maxWidth: '400px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <h5 style={{ margin: 0 }}>用户信息</h5>
                <button
                    onClick={logout}
                    style={{
                        padding: '6px 12px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    退出登录
                </button>
            </div>

            <div style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px'
            }}>
                <div style={{ marginBottom: '12px' }}>
                    <strong>用户名：</strong>
                    {isEditing ? (
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                marginLeft: '8px',
                                padding: '4px 8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    ) : (
                        <span style={{ marginLeft: '8px' }}>{user.username}</span>
                    )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <strong>邮箱：</strong>
                    <span style={{ marginLeft: '8px' }}>{user.email}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <strong>角色：</strong>
                    <span style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        background: user.role === 'admin' ? '#faad14' : '#52c41a',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                    }}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleUpdate}
                                disabled={isLoading}
                                style={{
                                    padding: '6px 12px',
                                    background: '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {isLoading ? '保存中...' : '保存'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setUsername(user.username);
                                }}
                                style={{
                                    padding: '6px 12px',
                                    background: '#ccc',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                取消
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '6px 12px',
                                background: '#1890ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            编辑资料
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// 主演示组件
export default function AuthDemo() {
    return (
        <AuthProvider>
            <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h4>🔐 用户认证管理演示</h4>

                <AuthContent />

                <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                    💡 提示：使用快速登录按钮体验不同用户角色，或者手动输入邮箱和密码！
                </div>
            </div>
        </AuthProvider>
    );
}

// 认证内容组件
function AuthContent() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div>
            {!isAuthenticated ? (
                <LoginForm />
            ) : (
                <UserProfile />
            )}

            {/* 状态显示 */}
            <div style={{
                marginTop: '20px',
                padding: '12px',
                background: '#f0f2f5',
                borderRadius: '6px'
            }}>
                <h6 style={{ margin: '0 0 8px 0' }}>当前状态：</h6>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <div><strong>已登录：</strong> {isAuthenticated ? 'true' : 'false'}</div>
                    {user && (
                        <>
                            <div><strong>用户ID：</strong> {user.id}</div>
                            <div><strong>用户名：</strong> {user.username}</div>
                            <div><strong>邮箱：</strong> {user.email}</div>
                            <div><strong>角色：</strong> {user.role}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 