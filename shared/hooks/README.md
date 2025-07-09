# @ai-code/hooks

🚀 **专为现代 React 应用设计的全功能 Hooks 库**

[![npm version](https://badge.fury.io/js/%40ai-code%2Fhooks.svg)](https://badge.fury.io/js/%40ai-code%2Fhooks)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/ai-code-project/hooks)

## ✨ 特性亮点

- 🔐 **完整认证系统** - 登录、注册、权限管理一站式解决方案
- ⚡ **异步操作管理** - 支持重试、取消、错误处理的异步状态管理
- 📝 **智能表单处理** - 验证、提交、字段管理的完整表单解决方案
- 🌐 **网络状态监控** - 实时网络连接检测和重连机制
- 💾 **本地存储管理** - 类型安全的 localStorage 操作和跨标签页同步
- 📐 **响应式设计** - 窗口尺寸监听和断点管理
- 🎨 **低代码编辑器** - 可视化编辑器的完整状态管理
- 🚀 **API 请求封装** - RESTful API 的简洁调用接口
- 🔧 **实用工具集** - 防抖、客户端检测等常用功能

## 📦 安装

```bash
# 使用 npm
npm install @ai-code/hooks

# 使用 yarn
yarn add @ai-code/hooks

# 使用 pnpm
pnpm add @ai-code/hooks
```

## 🚀 快速开始

### 🔐 用户认证 - useAuth

快速集成完整的用户认证系统：

```tsx
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
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    register 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>欢迎回来, {user?.username}!</h1>
          <p>角色: {user?.role}</p>
          <button onClick={logout}>安全退出</button>
        </div>
      ) : (
        <div>
          <button onClick={() => login({ 
            username: 'demo', 
            password: '123456' 
          })}>
            立即登录
          </button>
          <button onClick={() => register({
            username: 'newuser',
            email: 'user@example.com',
            password: '123456'
          })}>
            快速注册
          </button>
        </div>
      )}
    </div>
  );
}
```

### ⚡ 异步操作 - useAsync

优雅处理异步操作和状态管理：

```tsx
import { useAsync } from '@ai-code/hooks';
import { useEffect } from 'react';

function UserProfile({ userId }) {
  const { 
    data: user, 
    loading, 
    error, 
    execute,
    retry,
    cancel 
  } = useAsync(
    // 异步函数
    async (id) => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    {
      // 配置选项
      retryCount: 3,
      retryDelay: 1000,
      onSuccess: (data) => console.log('用户加载成功:', data),
      onError: (error) => console.error('加载失败:', error)
    }
  );

  // 自动执行或手动触发
  useEffect(() => {
    execute(userId);
  }, [userId, execute]);

  if (loading) return <div>🔄 加载用户信息...</div>;
  if (error) return (
    <div>
      ❌ 加载失败: {error}
      <button onClick={retry}>🔄 重试</button>
      <button onClick={cancel}>❌ 取消</button>
    </div>
  );

  return (
    <div>
      <h2>👤 {user?.name}</h2>
      <p>📧 {user?.email}</p>
      <p>📞 {user?.phone}</p>
    </div>
  );
}
```

### 📝 表单管理 - useForm

强大的表单状态管理和验证：

```tsx
import { useForm } from '@ai-code/hooks';

function ContactForm() {
  const form = useForm({
    // 初始值
    initialValues: {
      name: '',
      email: '',
      message: '',
      agreeTerms: false
    },
    
    // 验证规则
    validate: (values) => {
      const errors = {};
      
      if (!values.name.trim()) {
        errors.name = '姓名不能为空';
      } else if (values.name.length < 2) {
        errors.name = '姓名至少2个字符';
      }
      
      if (!values.email) {
        errors.email = '邮箱不能为空';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = '邮箱格式不正确';
      }
      
      if (!values.message.trim()) {
        errors.message = '消息内容不能为空';
      } else if (values.message.length < 10) {
        errors.message = '消息内容至少10个字符';
      }
      
      if (!values.agreeTerms) {
        errors.agreeTerms = '请同意服务条款';
      }
      
      return errors;
    },
    
    // 提交处理
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        
        if (response.ok) {
          alert('✅ 提交成功！我们会尽快回复您。');
          form.reset();
        } else {
          throw new Error('提交失败');
        }
      } catch (error) {
        alert('❌ 提交失败，请稍后重试');
      }
    }
  });

  return (
    <form onSubmit={form.handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">姓名 *</label>
        <input
          id="name"
          {...form.getFieldProps('name')}
          placeholder="请输入您的姓名"
          className={form.touched.name && form.errors.name ? 'error' : ''}
        />
        {form.touched.name && form.errors.name && (
          <span className="error-message">{form.errors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">邮箱 *</label>
        <input
          id="email"
          type="email"
          {...form.getFieldProps('email')}
          placeholder="your@email.com"
          className={form.touched.email && form.errors.email ? 'error' : ''}
        />
        {form.touched.email && form.errors.email && (
          <span className="error-message">{form.errors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="message">消息 *</label>
        <textarea
          id="message"
          {...form.getFieldProps('message')}
          placeholder="请输入您的消息内容..."
          rows={4}
          className={form.touched.message && form.errors.message ? 'error' : ''}
        />
        {form.touched.message && form.errors.message && (
          <span className="error-message">{form.errors.message}</span>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            {...form.getFieldProps('agreeTerms')}
          />
          我同意 <a href="/terms">服务条款</a> 和 <a href="/privacy">隐私政策</a>
        </label>
        {form.touched.agreeTerms && form.errors.agreeTerms && (
          <span className="error-message">{form.errors.agreeTerms}</span>
        )}
      </div>

      <button 
        type="submit" 
        disabled={form.isSubmitting || !form.isValid}
        className="submit-button"
      >
        {form.isSubmitting ? '🔄 提交中...' : '📤 发送消息'}
      </button>
      
      <div className="form-status">
        表单状态: {form.isValid ? '✅ 有效' : '❌ 无效'} | 
        已修改字段: {Object.keys(form.touched).length}
      </div>
    </form>
  );
}
```

### 🌐 网络状态监控 - useNetworkStatus

实时网络连接检测和离线处理：

```tsx
import { useNetworkStatus } from '@ai-code/hooks';

function NetworkAwareApp() {
  const { 
    isOnline, 
    reconnect, 
    checkConnectivity 
  } = useNetworkStatus({
    onOnline: () => {
      console.log('🟢 网络已连接');
      // 网络恢复时的处理逻辑
      syncOfflineData();
    },
    onOffline: () => {
      console.log('🔴 网络已断开');
      // 网络断开时的处理逻辑
      showOfflineMessage();
    }
  });

  const handleReconnect = async () => {
    const isConnected = await checkConnectivity();
    console.log('网络检测结果:', isConnected ? '已连接' : '已断开');
  };

  return (
    <div className="app">
      {/* 网络状态指示器 */}
      <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
        <span className="status-dot"></span>
        {isOnline ? '🟢 在线' : '🔴 离线'}
        {!isOnline && (
          <button onClick={reconnect} className="reconnect-btn">
            🔄 重新连接
          </button>
        )}
      </div>

      {/* 主要内容 */}
      <main>
        {isOnline ? (
          <OnlineContent />
        ) : (
          <OfflineContent onReconnect={handleReconnect} />
        )}
      </main>
    </div>
  );
}

function OfflineContent({ onReconnect }) {
  return (
    <div className="offline-notice">
      <h2>🚫 网络连接已断开</h2>
      <p>请检查您的网络连接，然后重试。</p>
      <button onClick={onReconnect}>🔄 检查连接</button>
    </div>
  );
}
```

### 💾 本地存储 - useLocalStorage

类型安全的本地存储管理：

```tsx
import { useLocalStorage } from '@ai-code/hooks';

function UserPreferences() {
  const [theme, setTheme, removeTheme] = useLocalStorage('app-theme', 'light', {
    syncAcrossTabs: true, // 跨标签页同步
    onError: (error) => console.error('存储错误:', error)
  });

  const [settings, setSettings] = useLocalStorage('user-settings', {
    language: 'zh-CN',
    notifications: true,
    autoSave: false,
    fontSize: 14
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`app-theme-${theme}`}>
      <h2>⚙️ 用户偏好设置</h2>
      
      {/* 主题切换 */}
      <div className="setting-group">
        <label>🎨 主题设置</label>
        <button onClick={toggleTheme}>
          切换到 {theme === 'light' ? '🌙 深色' : '☀️ 浅色'} 主题
        </button>
        <button onClick={removeTheme}>🗑️ 重置主题</button>
      </div>

      {/* 语言设置 */}
      <div className="setting-group">
        <label>🌍 语言设置</label>
        <select 
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value)}
        >
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>

      {/* 通知设置 */}
      <div className="setting-group">
        <label>🔔 通知设置</label>
        <input
          type="checkbox"
          checked={settings.notifications}
          onChange={(e) => updateSetting('notifications', e.target.checked)}
        />
        启用消息通知
      </div>

      {/* 字体大小 */}
      <div className="setting-group">
        <label>📝 字体大小: {settings.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="20"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
        />
      </div>

      {/* 设置预览 */}
      <div className="settings-preview">
        <h3>当前设置</h3>
        <pre>{JSON.stringify({ theme, ...settings }, null, 2)}</pre>
      </div>
    </div>
  );
}
```

## 📋 完整 Hooks 列表

| Hook | 功能描述 | 使用场景 |
|------|----------|----------|
| 🔐 **useAuth** | 用户认证管理 | 登录、注册、权限控制 |
| ⚡ **useAsync** | 异步操作管理 | API调用、数据加载、错误处理 |
| 📝 **useForm** | 表单状态管理 | 表单验证、提交、字段管理 |
| 🌐 **useNetworkStatus** | 网络状态监控 | 离线检测、重连机制、网络状态显示 |
| 💾 **useLocalStorage** | 本地存储管理 | 用户设置、数据持久化、跨标签页同步 |
| 📐 **useWindowSize** | 窗口尺寸监听 | 响应式设计、断点管理、动态布局 |
| 🚀 **useApi** | API请求管理 | RESTful API、请求拦截、错误处理 |
| 🎨 **useEditor** | 编辑器状态管理 | 低代码编辑器、可视化设计器 |
| 🔧 **useDebounce** | 防抖处理 | 搜索输入、API调用优化 |

## 🎯 高级用法示例

### 🔄 组合多个 Hooks

```tsx
import { 
  useAuth, 
  useApi, 
  useLocalStorage, 
  useNetworkStatus 
} from '@ai-code/hooks';

function TodoApp() {
  const { user, isAuthenticated } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [offlineTodos, setOfflineTodos] = useLocalStorage('offline-todos', []);
  
  const { 
    data: todos, 
    loading, 
    post: createTodo,
    put: updateTodo,
    delete: deleteTodo 
  } = useApi({
    baseURL: '/api/todos',
    onError: (error) => {
      if (!isOnline) {
        // 离线时保存到本地
        console.log('离线模式：数据已保存到本地');
      }
    }
  });

  const handleCreateTodo = async (todoData) => {
    if (isOnline) {
      await createTodo('', todoData);
    } else {
      // 离线时保存到本地存储
      setOfflineTodos(prev => [...prev, { 
        ...todoData, 
        id: Date.now(),
        offline: true 
      }]);
    }
  };

  // 网络恢复时同步离线数据
  useEffect(() => {
    if (isOnline && offlineTodos.length > 0) {
      syncOfflineTodos();
    }
  }, [isOnline, offlineTodos]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="todo-app">
      <Header user={user} isOnline={isOnline} />
      <TodoList 
        todos={isOnline ? todos : offlineTodos}
        loading={loading}
        onCreateTodo={handleCreateTodo}
        onUpdateTodo={updateTodo}
        onDeleteTodo={deleteTodo}
      />
    </div>
  );
}
```

### 🎨 响应式设计

```tsx
import { useWindowSize, useDebounce } from '@ai-code/hooks';

function ResponsiveLayout() {
  const { width, height } = useWindowSize({
    debounceMs: 150 // 防抖优化性能
  });
  
  // 使用防抖优化计算
  const debouncedWidth = useDebounce(width, 100);

  const layout = useMemo(() => {
    if (debouncedWidth < 576) {
      return { columns: 1, sidebar: false, compact: true };
    } else if (debouncedWidth < 768) {
      return { columns: 2, sidebar: false, compact: true };
    } else if (debouncedWidth < 1024) {
      return { columns: 2, sidebar: true, compact: false };
    } else {
      return { columns: 3, sidebar: true, compact: false };
    }
  }, [debouncedWidth]);

  return (
    <div className={`layout layout-${layout.columns}-col ${layout.compact ? 'compact' : ''}`}>
      <main style={{
        gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
        gap: layout.compact ? '8px' : '16px'
      }}>
        <ContentGrid layout={layout} />
      </main>
      
      {layout.sidebar && (
        <aside className="sidebar">
          <SidebarContent />
        </aside>
      )}
      
      <div className="debug-info">
        📐 {width} × {height} | 📱 {layout.columns} 列 | 
        {layout.sidebar ? '📋 有侧边栏' : '📋 无侧边栏'}
      </div>
    </div>
  );
}
```

## 📖 文档和示例

### 📚 完整文档
- 🏠 [在线文档](http://localhost:8000) - 详细的 API 文档和使用示例
- 🎮 [交互式示例](http://localhost:8000/components) - 可运行的代码示例
- 📝 [最佳实践](http://localhost:8000/guide) - 性能优化和使用建议

### 🔧 本地开发文档
```bash
# 克隆项目
git clone <your-repo-url>

# 安装依赖
pnpm install

# 启动文档服务器
pnpm dev

# 访问 http://localhost:8000
```

## 🛠️ 开发和贡献

### 🏗️ 项目结构
```
shared/hooks/
├── src/                 # 源代码
│   ├── useAuth/        # 认证管理
│   ├── useAsync/       # 异步操作
│   ├── useForm/        # 表单管理
│   ├── useApi/         # API请求
│   ├── useLocalStorage/# 本地存储
│   ├── useNetworkStatus/# 网络状态
│   ├── useWindowSize/  # 窗口尺寸
│   ├── useEditor/      # 编辑器状态
│   ├── useDebounce/    # 防抖处理
│   ├── useClientSide/  # 客户端检测
│   └── index.ts        # 入口文件
├── docs/               # 文档
├── dist/               # 构建输出
└── package.json        # 包配置
```

### 🧪 测试
```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试
npm test -- --testNamePattern="useAuth"
```

### 🚀 构建和发布
```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建包
npm run build

# 发布到 npm
npm publish
```

## 🎯 性能优化建议

### ⚡ 最佳实践
1. **按需导入**: 只导入你需要的 hooks
   ```tsx
   import { useAuth } from '@ai-code/hooks/useAuth';
   ```

2. **合理使用防抖**: 对于频繁变化的值使用 `useDebounce`
   ```tsx
   const debouncedSearchTerm = useDebounce(searchTerm, 300);
   ```

3. **缓存复杂计算**: 结合 `useMemo` 优化性能
   ```tsx
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

4. **错误边界**: 使用错误边界包裹使用异步 hooks 的组件

## 📄 许可证

MIT License - 详情请查看 [LICENSE](./LICENSE) 文件

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 🐛 报告问题
- 使用 [GitHub Issues](https://github.com/ai-code-project/hooks/issues)
- 提供详细的复现步骤和环境信息

### 💡 功能建议
- 在 Issues 中使用 `enhancement` 标签
- 描述使用场景和预期行为

### 🔧 代码贡献
1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

### 📝 文档贡献
- 改进文档和示例
- 添加更多使用场景
- 翻译文档到其他语言

## 🏆 致谢

感谢所有贡献者和社区成员的支持！

特别感谢：
- React 团队提供的优秀框架
- 社区中的优秀 hooks 库给我们的灵感
- 所有提供反馈和建议的用户

## 📞 联系我们

- 📧 邮箱: hooks@ai-code.dev
- 💬 讨论: [GitHub Discussions](https://github.com/ai-code-project/hooks/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/ai-code-project/hooks/issues)
- 📱 微信群: 扫码加入开发者交流群

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by [AI-Code Team](https://github.com/ai-code-project)

</div> 