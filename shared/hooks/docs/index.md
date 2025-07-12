---
title: '@corn12138/hooks'
description: 🎣 A collection of powerful React hooks for modern web development
---

# @corn12138/hooks

🎣 强大的 React Hooks 集合，为现代 Web 开发而生。

## 🌟 为什么选择 @corn12138/hooks？

我们的 Hooks 库专为现代 React 应用设计，提供：

- ⚡ **高性能**：优化的实现，最小化重新渲染
- 🔒 **类型安全**：完整的 TypeScript 支持
- 🎯 **易于使用**：简洁的 API 设计
- 📦 **零依赖**：纯净的实现，无额外依赖
- 🌳 **Tree-shaking**：支持按需导入

## 🚀 快速开始

```bash
npm install @corn12138/hooks
```

```tsx
import { useAuth } from '@corn12138/hooks';

function App() {
  const { user, login, logout } = useAuth();
  
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

## 📚 核心 Hooks

### 表单处理
```tsx
import { useForm, useAsync } from '@corn12138/hooks';

function ContactForm() {
  const { values, handleChange, handleSubmit } = useForm({
    name: '',
    email: '',
    message: ''
  });
  
  const { loading, execute } = useAsync(async () => {
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(values)
    });
  });
  
  return (
    <form onSubmit={handleSubmit(execute)}>
      <input 
        name="name"
        value={values.name}
        onChange={handleChange}
        placeholder="Your Name"
      />
      <input 
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Your Email"
      />
      <textarea 
        name="message"
        value={values.message}
        onChange={handleChange}
        placeholder="Your Message"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

### 性能优化
```tsx
import { useDebounce, useAsync } from '@corn12138/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  const { data, loading } = useAsync(async () => {
    if (!debouncedQuery) return [];
    const response = await fetch(`/api/search?q=${debouncedQuery}`);
    return response.json();
  }, [debouncedQuery]);
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Searching...</p>}
      {data && (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 网络状态监控
```tsx
import { useNetworkStatus, useLocalStorage } from '@corn12138/hooks';

function OfflineIndicator() {
  const { online, downlink, effectiveType } = useNetworkStatus();
  const [offlineData, setOfflineData] = useLocalStorage('offlineData', []);
  
  useEffect(() => {
    if (!online) {
      // 保存离线数据
      setOfflineData(prev => [...prev, { timestamp: Date.now() }]);
    }
  }, [online]);
  
  return (
    <div>
      <p>Status: {online ? 'Online' : 'Offline'}</p>
      {online && (
        <div>
          <p>Speed: {downlink} Mbps</p>
          <p>Connection: {effectiveType}</p>
        </div>
      )}
    </div>
  );
}
```

### 响应式设计
```tsx
import { useWindowSize, useDebounce } from '@corn12138/hooks';

function ResponsiveComponent() {
  const { width, height } = useWindowSize();
  const debouncedWidth = useDebounce(width, 100);
  
  const isMobile = debouncedWidth < 768;
  const isTablet = debouncedWidth >= 768 && debouncedWidth < 1024;
  const isDesktop = debouncedWidth >= 1024;
  
  return (
    <div>
      <p>Window Size: {width} x {height}</p>
      <p>Device Type: {
        isMobile ? 'Mobile' : 
        isTablet ? 'Tablet' : 
        'Desktop'
      }</p>
      
      {isMobile && (
        <div>Mobile-specific content</div>
      )}
      
      {isDesktop && (
        <div>Desktop-specific content</div>
      )}
    </div>
  );
}
```

## 📦 安装

```bash
# npm
npm install @corn12138/hooks

# yarn
yarn add @corn12138/hooks

# pnpm
pnpm add @corn12138/hooks
```

## 🎯 使用示例

```tsx
import { useForm, useAsync } from '@corn12138/hooks';

function MyApp() {
  const { user, login } = useAuth();
  const { data, loading } = useAsync(fetchUserData);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome to My App</h1>
      {user && <p>Hello, {user.name}!</p>}
    </div>
  );
}
```

## 🤝 社区

<div style="display: flex; gap: 20px; margin: 20px 0;">
  <img src="https://img.shields.io/npm/v/@corn12138/hooks?style=flat-square" alt="NPM Version" />
  <img src="https://img.shields.io/npm/dt/@corn12138/hooks?style=flat-square" alt="NPM Downloads" />
  <img src="https://img.shields.io/github/stars/corn12138/ai-code-hooks?style=flat-square" alt="GitHub Stars" />
</div>

<p>已有数千名开发者在使用 @corn12138/hooks 构建优秀的应用</p>

---

<div style="text-align: center; margin: 40px 0;">
  <h3>🎉 加入 2000+ 开发者社区</h3>
  <p>已有数千名开发者在使用 @corn12138/hooks 构建优秀的应用</p>
  
  🎯 **准备好了吗？** [立即开始](/guide) 您的开发之旅！
</div> 