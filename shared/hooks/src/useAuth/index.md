# useAuth

用户认证管理Hook，提供登录、注册、登出等功能。

## 基础用法

```javascript
// 1. 安装
npm install @ai-code/hooks

// 2. 导入
import { useAuth, AuthProvider } from '@ai-code/hooks';

// 3. 在应用根部包裹AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}

// 4. 在组件中使用useAuth
function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'test', password: '123456' });
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>欢迎, {user?.username}!</p>
          <button onClick={logout}>登出</button>
        </div>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  );
}
```

## API

### AuthState

| 属性 | 类型 | 描述 |
|------|------|------|
| user | User \| null | 当前用户信息 |
| token | string \| null | 认证令牌 |
| isLoading | boolean | 是否正在加载 |
| isAuthenticated | boolean | 是否已认证 |

### 方法

| 方法 | 类型 | 描述 |
|------|------|------|
| login | (credentials) => Promise<void> | 用户登录 |
| logout | () => void | 用户登出 |
| register | (userData) => Promise<void> | 用户注册 |
| updateUser | (userData) => void | 更新用户信息 | 