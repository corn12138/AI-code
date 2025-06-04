'use client';

import React, { createContext, useContext, useState } from 'react';

// 创建认证上下文
const AuthContext = createContext<{
  user: any | null;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}>({
  user: null,
  login: async () => false,
  logout: () => { },
  isLoading: true
});

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 登录函数
  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      // 这里将来会实现真正的登录逻辑
      console.log('登录中...', credentials);
      // 模拟登录成功
      setUser({ id: '1', name: '示例用户' });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      setIsLoading(false);
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义钩子，用于访问认证上下文
export function useAuth() {
  return useContext(AuthContext);
}
