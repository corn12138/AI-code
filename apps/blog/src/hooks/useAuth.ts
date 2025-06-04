'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('认证检查失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // 登录函数
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        username: email.split('@')[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('accessToken', 'mock-token-' + Date.now());
      setUser(mockUser);
    } catch (error) {
      console.error('登录失败:', error);
      throw new Error('登录失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 登出函数
  const logout = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(null);
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 使用React.createElement而不是JSX语法
  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading
      }
    },
    children
  );
}

// 自定义钩子
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
