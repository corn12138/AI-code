import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/auth';
import { lazy, Suspense } from 'react';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const Editor = lazy(() => import('./components/Editor'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Preview = lazy(() => import('./pages/Preview'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, refreshToken } = useAuth();
  
  useEffect(() => {
    // 尝试刷新令牌，如果本地有refreshToken
    if (!isAuthenticated) {
      refreshToken().catch(() => {
        // 刷新失败不做处理，让用户手动登录
      });
    }
  }, [isAuthenticated, refreshToken]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
