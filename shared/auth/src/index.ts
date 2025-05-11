import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role: string;
}

interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
  role: string;
  exp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // 允许跨域请求携带凭证
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const store = useAuth.getState();
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是401错误且不是刷新token的请求，尝试刷新token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.config.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      
      try {
        await useAuth.getState().refreshAuth();
        // 刷新成功后重试之前失败的请求
        const accessToken = useAuth.getState().accessToken;
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      // 登录方法
      login: async (usernameOrEmail, password) => {
        try {
          const response = await api.post('/auth/login', {
            usernameOrEmail,
            password,
          });

          const { accessToken, refreshToken, user } = response.data;

          set({
            isAuthenticated: true,
            accessToken,
            refreshToken,
            user,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      // 注册方法
      register: async (username, email, password) => {
        try {
          const response = await api.post('/auth/register', {
            username,
            email,
            password,
          });

          const { accessToken, refreshToken, user } = response.data;

          set({
            isAuthenticated: true,
            accessToken,
            refreshToken,
            user,
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      // 登出方法
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout API call failed:', error);
        }

        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });

        // 清除localStorage中的auth相关数据
        localStorage.removeItem('auth-storage');
      },

      // 刷新token方法
      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, user } = response.data;

          set({
            isAuthenticated: true,
            accessToken,
            user,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          // 刷新失败，清除认证状态
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      // 更新用户信息
      updateUser: (userData) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      // 只持久化这些字段
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// 检查token是否过期
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

// 创建一个授权保护组件的高阶组件
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { isAuthenticated, refreshAuth } = useAuth();

    React.useEffect(() => {
      if (!isAuthenticated) {
        refreshAuth().catch(() => {
          // 重定向到登录页或其他处理
          window.location.href = '/login';
        });
      }
    }, [isAuthenticated, refreshAuth]);

    return isAuthenticated ? <Component {...props} /> : null;
  };
}

export default useAuth;
