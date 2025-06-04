'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean | null; // null表示正在加载中
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (userData: { username: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // 初始加载时检查认证状态
  useEffect(() => {
    async function loadAuthState() {
      try {
        setIsLoading(true);
        
        // 从localStorage获取用户信息
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth-token');
        
        if (storedUser && token) {
          // 正常环境应该验证token是否有效
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAuthState();
  }, []);
  
  // 登录
  const signIn = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      // 在生产环境：调用真实的API登录
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials),
      // });
      
      // if (!response.ok) throw new Error('登录失败');
      // const data = await response.json();
      
      // 模拟登录成功响应
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: 'user-1',
        username: credentials.email.split('@')[0],
        email: credentials.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
      };
      
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // 存储用户信息和token
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('auth-token', mockToken);
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 注册
  const signUp = useCallback(async (userData: { username: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      // 在生产环境：调用真实的API注册
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData),
      // });
      
      // if (!response.ok) throw new Error('注册失败');
      // const data = await response.json();
      
      // 模拟注册成功响应
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substring(2),
        username: userData.username,
        email: userData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      };
      
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // 存储用户信息和token
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('auth-token', mockToken);
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 登出
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 在生产环境：调用真实的API登出
      // await fetch('/api/auth/logout', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
      // });
      
      // 模拟登出延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      
      // 更新状态
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
