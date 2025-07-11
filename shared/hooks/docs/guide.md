# 快速开始

欢迎使用 AI-Code Hooks！这是一个功能强大的 React Hooks 库，专为现代 Web 开发而设计。

## 🚀 安装

```bash
# 使用 npm
npm install @corn12138/hooks

# 使用 yarn
yarn add @corn12138/hooks

# 使用 pnpm
pnpm add @corn12138/hooks
```

## 📦 引入方式

### 按需引入（推荐）

```javascript
import { useAuth, useDebounce, useAsync } from '@corn12138/hooks';
```

### 全量引入

```javascript
import * as Hooks from '@corn12138/hooks';
```

## 🎯 基础使用

### 1. 用户认证管理

```tsx
import { useAuth } from '@corn12138/hooks';

function LoginComponent() {
  const { user, login, logout, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'admin', password: '123456' });
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  if (loading) return <div>登录中...</div>;

  return (
    <div>
      {user ? (
        <div>
          <span>欢迎，{user.username}!</span>
          <button onClick={logout}>退出</button>
        </div>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  );
}
```

### 2. 防抖处理

```tsx
import { useDebounce } from '@corn12138/hooks';
import { useState, useEffect } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索逻辑
      console.log('搜索:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      placeholder="输入搜索内容..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

### 3. 异步操作管理

```tsx
import { useAsync } from '@corn12138/hooks';

function DataComponent() {
  const { data, loading, error, execute } = useAsync(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });

  return (
    <div>
      <button onClick={execute} disabled={loading}>
        {loading ? '加载中...' : '获取数据'}
      </button>
      
      {error && <div>错误: {error.message}</div>}
      {data && <div>数据: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

## 🔧 TypeScript 支持

所有 Hooks 都提供完整的 TypeScript 类型定义：

```typescript
import { useAuth, User } from '@corn12138/hooks';

interface MyUser extends User {
  role: 'admin' | 'user';
}

function TypedComponent() {
  const { user } = useAuth<MyUser>();
  
  return (
    <div>
      {user && <span>角色: {user.role}</span>}
    </div>
  );
}
```

## 🌟 特性亮点

- ✅ **零依赖**：除了 React，无其他依赖
- ✅ **TypeScript**：完整的类型支持
- ✅ **Tree-shaking**：支持按需引入
- ✅ **SSR 友好**：支持服务端渲染
- ✅ **测试覆盖**：90%+ 测试覆盖率
- ✅ **体积小巧**：gzip 后仅 ~5KB

## 📚 更多示例

查看 [交互示例](/examples) 页面获取更多实际使用案例。

## 🐛 问题反馈

如果您在使用过程中遇到问题，请通过以下方式反馈：

- [GitHub Issues](https://github.com/corn12138/ai-code-hooks/issues)
- [GitHub Discussions](https://github.com/corn12138/ai-code-hooks/discussions)

## 🤝 贡献指南

欢迎贡献代码！请查看 [贡献指南](https://github.com/corn12138/ai-code-hooks/blob/main/CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

MIT License - 详见 [LICENSE](https://github.com/corn12138/ai-code-hooks/blob/main/LICENSE) 文件。 