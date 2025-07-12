# useAuth

用于身份认证的 React Hook。

## 安装

```bash
npm install @corn12138/hooks
```

```tsx
import { useAuth, AuthProvider } from '@corn12138/hooks';

function App() {
  return (
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
}

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('username', 'password')}>
          Login
        </button>
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