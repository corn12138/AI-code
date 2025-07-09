# 🚀 快速开始指南

欢迎使用 **@ai-code/hooks**！这是一个专为现代 React 应用设计的全功能 Hooks 库，提供认证管理、异步操作、表单处理、网络监控等一站式解决方案。

## 📦 安装

### 使用 npm
```bash
npm install @ai-code/hooks
```

### 使用 yarn
```bash
yarn add @ai-code/hooks
```

### 使用 pnpm
```bash
pnpm add @ai-code/hooks
```

## 🛠️ 项目配置

### TypeScript 支持

`@ai-code/hooks` 完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "node"
  }
}
```

### Next.js 配置

在 Next.js 项目中使用时，确保在 `next.config.js` 中配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-code/hooks'],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
```

## 🎯 核心 Hooks 使用指南

### 🔐 用户认证管理 (useAuth)

完整的用户认证解决方案，支持登录、注册、权限管理。

```typescript
import React from 'react';
import { useAuth, AuthProvider } from '@ai-code/hooks';

// 1. 在应用根部包裹 AuthProvider
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

// 2. 在组件中使用认证功能
function Dashboard() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'admin', password: '123456' });
      console.log('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>欢迎, {user?.username}!</h1>
          <button onClick={logout}>退出登录</button>
        </div>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  );
}
```

### ⚡ 异步操作管理 (useAsync)

智能的异步状态管理，支持重试、取消、错误处理。

```typescript
import React from 'react';
import { useAsync } from '@ai-code/hooks';

// 定义异步函数
const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('获取用户数据失败');
  return response.json();
};

function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, execute, retry } = useAsync(
    fetchUserData,
    {
      immediate: true,        // 立即执行
      retryCount: 3,         // 重试3次
      retryDelay: 1000,      // 重试延迟1秒
      onSuccess: (data) => console.log('获取成功:', data),
      onError: (error) => console.error('获取失败:', error)
    }
  );

  React.useEffect(() => {
    execute(userId);
  }, [userId, execute]);

  if (loading) return <div>加载中...</div>;
  if (error) return (
    <div>
      <p>错误: {error}</p>
      <button onClick={retry}>重试</button>
    </div>
  );

  return <div>用户: {user?.name}</div>;
}
```

### 📝 表单状态管理 (useForm)

强大的表单状态管理，包含验证、提交、字段管理。

```typescript
import React from 'react';
import { useForm } from '@ai-code/hooks';

interface LoginForm {
  email: string;
  password: string;
}

function LoginForm() {
  const form = useForm<LoginForm>({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginForm, string>> = {};
      
      if (!values.email) {
        errors.email = '邮箱不能为空';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = '邮箱格式不正确';
      }
      
      if (!values.password) {
        errors.password = '密码不能为空';
      } else if (values.password.length < 6) {
        errors.password = '密码长度至少6位';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      console.log('提交数据:', values);
      // 处理登录逻辑
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input {...form.getFieldProps('email')} placeholder="邮箱" />
        {form.touched.email && form.errors.email && (
          <div style={{ color: 'red' }}>{form.errors.email}</div>
        )}
      </div>
      
      <div>
        <input 
          {...form.getFieldProps('password')} 
          type="password" 
          placeholder="密码" 
        />
        {form.touched.password && form.errors.password && (
          <div style={{ color: 'red' }}>{form.errors.password}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

### 🌐 网络状态监控 (useNetworkStatus)

实时网络连接检测，支持离线处理、自动重连。

```typescript
import React from 'react';
import { useNetworkStatus } from '@ai-code/hooks';

function NetworkIndicator() {
  const { 
    isOnline, 
    connectionType, 
    effectiveType, 
    reconnect 
  } = useNetworkStatus({
    onOnline: () => console.log('网络已连接'),
    onOffline: () => console.log('网络已断开'),
    pingUrl: '/api/ping',
    pingInterval: 30000  // 30秒检查一次
  });

  return (
    <div style={{
      padding: '10px',
      backgroundColor: isOnline ? '#4caf50' : '#f44336',
      color: 'white'
    }}>
      <span>
        {isOnline ? '🟢 在线' : '🔴 离线'}
        {connectionType && ` (${connectionType})`}
        {effectiveType && ` - ${effectiveType}`}
      </span>
      {!isOnline && (
        <button onClick={reconnect} style={{ marginLeft: '10px' }}>
          重新连接
        </button>
      )}
    </div>
  );
}
```

### 💾 本地存储管理 (useLocalStorage)

类型安全的 localStorage 操作，支持跨标签页同步。

```typescript
import React from 'react';
import { useLocalStorage } from '@ai-code/hooks';

interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

function SettingsPanel() {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'user-settings',
    {
      theme: 'light',
      language: 'zh-CN',
      notifications: true
    },
    {
      serializer: JSON,           // 自定义序列化器
      syncAcrossTabs: true,      // 跨标签页同步
      onError: (error) => console.error('存储错误:', error)
    }
  );

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  return (
    <div>
      <h3>设置</h3>
      <div>
        <label>
          主题:
          <select 
            value={settings.theme} 
            onChange={(e) => updateTheme(e.target.value as 'light' | 'dark')}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              notifications: e.target.checked 
            }))}
          />
          启用通知
        </label>
      </div>
    </div>
  );
}
```

### 📐 响应式设计支持 (useWindowSize)

窗口尺寸监听和断点管理，助力构建响应式界面。

```typescript
import React from 'react';
import { useWindowSize } from '@ai-code/hooks';

function ResponsiveComponent() {
  const { width, height } = useWindowSize({
    debounceDelay: 150,           // 防抖延迟
    enableOrientation: true,      // 启用方向检测
    initialWidth: 1200,          // 初始宽度(SSR)
    initialHeight: 800           // 初始高度(SSR)
  });

  // 定义断点
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return (
    <div>
      <h3>当前屏幕: {width} x {height}</h3>
      <div>
        设备类型: {
          isMobile ? '📱 手机' : 
          isTablet ? '📱 平板' : 
          '💻 桌面'
        }
      </div>
      
      {/* 响应式网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${isMobile ? 1 : isTablet ? 2 : 3}, 1fr)`,
        gap: '16px',
        marginTop: '20px'
      }}>
        <div>卡片 1</div>
        <div>卡片 2</div>
        <div>卡片 3</div>
      </div>
    </div>
  );
}
```

### 🚀 API 请求封装 (useApi)

简洁的 RESTful API 调用接口，支持请求拦截、错误处理。

```typescript
import React from 'react';
import { useApi } from '@ai-code/hooks';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserManager() {
  const { data: users, loading, error, get, post, put, delete: deleteUser } = useApi<User[]>({
    baseURL: '/api',
    headers: {
      'Authorization': 'Bearer token'
    },
    onSuccess: (data) => console.log('请求成功:', data),
    onError: (error) => console.error('请求失败:', error)
  });

  // 获取用户列表
  const fetchUsers = () => get('/users');

  // 创建用户
  const createUser = async (userData: Omit<User, 'id'>) => {
    await post('/users', userData);
    fetchUsers(); // 刷新列表
  };

  // 更新用户
  const updateUser = async (id: string, userData: Partial<User>) => {
    await put(`/users/${id}`, userData);
    fetchUsers();
  };

  // 删除用户
  const removeUser = async (id: string) => {
    await deleteUser(`/users/${id}`);
    fetchUsers();
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h3>用户管理</h3>
      <button onClick={() => createUser({ name: '新用户', email: 'new@example.com' })}>
        添加用户
      </button>
      
      {users?.map(user => (
        <div key={user.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px' }}>
          <h4>{user.name}</h4>
          <p>{user.email}</p>
          <button onClick={() => updateUser(user.id, { name: '更新的名字' })}>
            更新
          </button>
          <button onClick={() => removeUser(user.id)}>
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 🔧 防抖处理 (useDebounce)

性能优化利器，减少不必要的函数调用和API请求。

```typescript
import React, { useState } from 'react';
import { useDebounce } from '@ai-code/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  
  // 防抖搜索词
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 当防抖后的搜索词变化时执行搜索
  React.useEffect(() => {
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm).then(setResults);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const searchAPI = async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="输入搜索关键词..."
        style={{ padding: '8px', width: '300px' }}
      />
      
      <div style={{ marginTop: '10px' }}>
        <small>
          搜索词: "{searchTerm}" | 防抖后: "{debouncedSearchTerm}"
        </small>
      </div>

      <div style={{ marginTop: '20px' }}>
        {results.map((item, index) => (
          <div key={index} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 🎨 低代码编辑器 (useEditor)

可视化编辑器的完整状态管理，支持组件操作、历史记录。

```typescript
import React from 'react';
import { useEditor } from '@ai-code/hooks';

interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Component[];
}

function VisualEditor() {
  const {
    components,
    selectedComponent,
    history,
    canUndo,
    canRedo,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    undo,
    redo,
    exportJSON,
    importJSON
  } = useEditor<Component>({
    maxHistorySize: 50,
    autoSave: true,
    autoSaveDelay: 2000
  });

  const handleAddButton = () => {
    addComponent({
      id: Date.now().toString(),
      type: 'button',
      props: {
        text: '新按钮',
        onClick: () => alert('点击了按钮')
      }
    });
  };

  const handleExport = () => {
    const json = exportJSON();
    console.log('导出的JSON:', json);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 工具栏 */}
      <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h3>组件面板</h3>
        <button onClick={handleAddButton}>添加按钮</button>
        
        <div style={{ marginTop: '20px' }}>
          <h4>历史操作</h4>
          <button onClick={undo} disabled={!canUndo}>撤销</button>
          <button onClick={redo} disabled={!canRedo}>重做</button>
          <div>历史记录: {history.length}</div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={handleExport}>导出JSON</button>
        </div>
      </div>

      {/* 画布区域 */}
      <div style={{ flex: 1, padding: '10px' }}>
        <h3>画布</h3>
        {components.map(component => (
          <div
            key={component.id}
            onClick={() => selectComponent(component.id)}
            style={{
              padding: '10px',
              margin: '5px',
              border: selectedComponent?.id === component.id ? '2px solid blue' : '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            <div>类型: {component.type}</div>
            <div>ID: {component.id}</div>
            {component.type === 'button' && (
              <button>{component.props.text}</button>
            )}
          </div>
        ))}
      </div>

      {/* 属性面板 */}
      <div style={{ width: '200px', padding: '10px', borderLeft: '1px solid #ccc' }}>
        <h3>属性面板</h3>
        {selectedComponent ? (
          <div>
            <h4>选中组件: {selectedComponent.type}</h4>
            <div>ID: {selectedComponent.id}</div>
            
            {selectedComponent.type === 'button' && (
              <div>
                <label>
                  按钮文字:
                  <input
                    value={selectedComponent.props.text || ''}
                    onChange={(e) => updateComponent(selectedComponent.id, {
                      props: { ...selectedComponent.props, text: e.target.value }
                    })}
                  />
                </label>
              </div>
            )}
            
            <button 
              onClick={() => deleteComponent(selectedComponent.id)}
              style={{ marginTop: '10px', color: 'red' }}
            >
              删除组件
            </button>
          </div>
        ) : (
          <div>请选择一个组件</div>
        )}
      </div>
    </div>
  );
}
```

## 💡 最佳实践

### 1. 组合使用 Hooks

多个 hooks 组合使用可以创建强大的功能：

```typescript
function SmartForm() {
  // 组合表单、异步和防抖
  const { execute: submitForm, loading } = useAsync(submitAPI);
  const form = useForm({
    initialValues: { email: '', message: '' },
    validate: validateForm,
    onSubmit: submitForm
  });
  
  // 组合本地存储实现草稿功能
  const [, setDraft] = useLocalStorage('form-draft', form.values);
  const debouncedValues = useDebounce(form.values, 1000);
  
  React.useEffect(() => {
    setDraft(debouncedValues);
  }, [debouncedValues, setDraft]);

  return (
    <form onSubmit={form.handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}
```

### 2. 错误处理策略

```typescript
function ErrorBoundaryExample() {
  const { data, error, retry } = useAsync(fetchData, {
    retryCount: 3,
    onError: (error) => {
      // 记录错误日志
      console.error('API Error:', error);
      
      // 显示用户友好的错误消息
      if (error.message.includes('network')) {
        toast.error('网络连接异常，请检查网络设置');
      } else {
        toast.error('操作失败，请稍后重试');
      }
    }
  });

  if (error) {
    return (
      <div className="error-container">
        <h3>出现错误</h3>
        <p>{error}</p>
        <button onClick={retry}>重试</button>
      </div>
    );
  }

  return <div>{data && JSON.stringify(data)}</div>;
}
```

### 3. 性能优化

```typescript
// 使用 React.memo 优化渲染
const OptimizedComponent = React.memo(function MyComponent({ userId }: { userId: string }) {
  const { data, loading } = useAsync(
    React.useCallback(() => fetchUser(userId), [userId]),
    { immediate: true }
  );

  return loading ? <Spinner /> : <UserCard user={data} />;
});

// 使用防抖优化搜索
function OptimizedSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: results } = useAsync(
    React.useCallback(() => 
      debouncedQuery ? searchAPI(debouncedQuery) : Promise.resolve([]),
      [debouncedQuery]
    ),
    { immediate: false }
  );

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

## 🔗 集成其他库

### 与 React Query 结合

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAsync } from '@ai-code/hooks';

function HybridDataFetching({ userId }: { userId: string }) {
  // 使用 React Query 做缓存
  const { data: cachedData } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 使用 useAsync 做复杂的状态管理
  const { execute: updateUser, loading } = useAsync(updateUserAPI, {
    onSuccess: () => {
      // 更新成功后刷新缓存
      queryClient.invalidateQueries(['user', userId]);
    }
  });

  return (
    <div>
      {cachedData && <UserDisplay user={cachedData} />}
      <button onClick={() => updateUser(userId, newData)} disabled={loading}>
        {loading ? '更新中...' : '更新用户'}
      </button>
    </div>
  );
}
```

### 与状态管理库结合

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@ai-code/hooks';

function ReduxIntegration() {
  const dispatch = useDispatch();
  const { user, login } = useAuth();
  const appState = useSelector(state => state.app);

  // 同步认证状态到 Redux
  React.useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
  }, [user, dispatch]);

  return <div>{/* 组件内容 */}</div>;
}
```

## 🐛 常见问题

### Q: 在 SSR 环境中使用时出现水合错误？

A: 对于依赖浏览器 API 的 hooks，使用 `useClientSide` 进行包装：

```typescript
import { useClientSide, useWindowSize } from '@ai-code/hooks';

function ResponsiveComponent() {
  const isClient = useClientSide();
  const { width } = useWindowSize();

  if (!isClient) {
    return <div>加载中...</div>; // 服务端渲染时的占位符
  }

  return <div>宽度: {width}px</div>;
}
```

### Q: useAuth 在组件外使用时报错？

A: 确保组件被 `AuthProvider` 包裹：

```typescript
// ✅ 正确使用
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// ❌ 错误：没有 Provider
function App() {
  return <Dashboard />; // 会报错
}
```

### Q: 如何处理内存泄漏？

A: hooks 内部已经处理了清理逻辑，但在某些情况下需要手动清理：

```typescript
function MyComponent() {
  const { execute, cancel } = useAsync(longRunningTask);

  React.useEffect(() => {
    return () => {
      cancel(); // 组件卸载时取消请求
    };
  }, [cancel]);

  return <div>{/* 组件内容 */}</div>;
}
```

## 📚 进阶主题

### 自定义 Hook 开发

基于现有 hooks 创建自定义 hook：

```typescript
import { useAsync, useLocalStorage } from '@ai-code/hooks';

// 自定义数据获取 hook
function useDataWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { cacheTime?: number }
) {
  const [cachedData, setCachedData] = useLocalStorage<{
    data: T;
    timestamp: number;
  } | null>(`cache_${key}`, null);

  const { data, loading, error, execute } = useAsync(fetcher, {
    immediate: false,
    onSuccess: (data) => {
      setCachedData({
        data,
        timestamp: Date.now()
      });
    }
  });

  React.useEffect(() => {
    const now = Date.now();
    const cacheTime = options?.cacheTime || 5 * 60 * 1000; // 默认5分钟

    if (cachedData && (now - cachedData.timestamp) < cacheTime) {
      // 使用缓存数据
      return;
    }

    // 缓存过期或不存在，重新获取
    execute();
  }, [cachedData, execute, options?.cacheTime]);

  return {
    data: data || cachedData?.data,
    loading,
    error,
    refresh: execute
  };
}

// 使用自定义 hook
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, refresh } = useDataWithCache(
    `user_${userId}`,
    () => fetchUser(userId),
    { cacheTime: 10 * 60 * 1000 } // 10分钟缓存
  );

  return (
    <div>
      {loading && <div>加载中...</div>}
      {user && (
        <div>
          <h1>{user.name}</h1>
          <button onClick={refresh}>刷新</button>
        </div>
      )}
    </div>
  );
}
```

## 🎉 总结

`@ai-code/hooks` 提供了一套完整的 React Hooks 解决方案，涵盖了现代 Web 应用开发的各个方面。通过合理使用这些 hooks，你可以：

- 🚀 **提升开发效率** - 开箱即用的功能组件
- 🛡️ **增强代码质量** - TypeScript 支持和最佳实践
- ⚡ **优化用户体验** - 智能的状态管理和错误处理
- 🔧 **简化复杂逻辑** - 声明式的 API 设计

开始你的 hooks 之旅吧！如果遇到任何问题，请查看具体的 API 文档或提交 Issue。 