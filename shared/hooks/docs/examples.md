---
title: 交互式示例
nav:
  title: 示例
  order: 2
---

# 🎮 交互式示例

在这里您可以直接体验和测试我们的 hooks！

## 🔧 useDebounce - 防抖示例

```tsx
import React, { useState } from 'react';
import { useDebounce } from '@ai-code/hooks';

export default function DebounceDemo() {
  const [inputValue, setInputValue] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  
  // 防抖处理用户输入，延迟 500ms
  const debouncedValue = useDebounce(inputValue, 500);
  
  // 模拟搜索API调用
  React.useEffect(() => {
    if (debouncedValue) {
      setSearchCount(prev => prev + 1);
      console.log('模拟API调用：', debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>🔍 搜索演示</h4>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入搜索关键词..."
          style={{
            width: '300px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
        <p><strong>实时输入值：</strong> {inputValue || '(空)'}</p>
        <p><strong>防抖后的值：</strong> {debouncedValue || '(空)'}</p>
        <p><strong>模拟API调用次数：</strong> {searchCount}</p>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        💡 提示：快速输入文字，观察防抖效果！API调用只在停止输入500ms后触发。
      </div>
    </div>
  );
}
```

## 💾 useLocalStorage - 本地存储示例

```tsx
import React from 'react';
import { useLocalStorage } from '@ai-code/hooks';

export default function LocalStorageDemo() {
  // 使用本地存储保存用户偏好
  const [theme, setTheme] = useLocalStorage('demo-theme', 'light');
  const [username, setUsername] = useLocalStorage('demo-username', '');
  const [notifications, setNotifications] = useLocalStorage('demo-notifications', true);

  const handleReset = () => {
    setTheme('light');
    setUsername('');
    setNotifications(true);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #eee', 
      borderRadius: '8px',
      background: theme === 'dark' ? '#2d2d2d' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000'
    }}>
      <h4>💾 本地存储演示</h4>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          主题设置：
        </label>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          style={{ padding: '4px 8px', marginRight: '12px' }}
        >
          <option value="light">浅色主题</option>
          <option value="dark">深色主题</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          用户名：
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="输入您的用户名"
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: theme === 'dark' ? '#444' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          接收通知
        </label>
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        重置设置
      </button>

      <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
        💡 提示：您的设置会自动保存到浏览器本地存储中，刷新页面后依然有效！
      </div>
    </div>
  );
}
```

## 📐 useWindowSize - 响应式示例

```tsx
import React from 'react';
import { useWindowSize } from '@ai-code/hooks';

export default function WindowSizeDemo() {
  const { width, height } = useWindowSize();
  
  // 根据窗口大小确定设备类型
  const getDeviceType = () => {
    if (width < 768) return { type: '📱 手机', color: '#ff4d4f' };
    if (width < 1024) return { type: '📊 平板', color: '#faad14' };
    return { type: '💻 桌面', color: '#52c41a' };
  };

  const device = getDeviceType();

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>📐 窗口尺寸监听演示</h4>
      
      <div style={{ 
        background: '#f0f2f5', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: device.color, fontSize: '20px', marginRight: '8px' }}>
            {device.type}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {width} × {height}
          </span>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div>宽度: {width}px</div>
          <div>高度: {height}px</div>
        </div>
      </div>

      {/* 响应式网格演示 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: width < 768 ? '1fr' : width < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {[1, 2, 3].map(num => (
          <div
            key={num}
            style={{
              background: '#e6f7ff',
              padding: '16px',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #91d5ff'
            }}
          >
            网格项目 {num}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        💡 提示：调整浏览器窗口大小，观察网格布局和设备类型的变化！
      </div>
    </div>
  );
}
```

## ⚡ useAsync - 异步操作示例

```tsx
import React from 'react';
import { useAsync } from '@ai-code/hooks';

// 模拟API函数
const mockFetchUser = async (userId: number): Promise<{id: number, name: string, email: string}> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟随机失败
  if (Math.random() < 0.3) {
    throw new Error('网络请求失败，请重试');
  }
  
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
  ];
  
  return users.find(user => user.id === userId) || users[0];
};

export default function AsyncDemo() {
  const { data: user, loading, error, execute, retry } = useAsync(mockFetchUser, {
    immediate: false,
    retryCount: 2,
    retryDelay: 1000,
    onSuccess: (data) => console.log('用户加载成功:', data),
    onError: (error) => console.log('加载失败:', error.message)
  });

  const handleLoadUser = (userId: number) => {
    execute(userId);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>⚡ 异步操作演示</h4>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ marginBottom: '12px' }}>选择要加载的用户：</p>
        {[1, 2, 3].map(id => (
          <button
            key={id}
            onClick={() => handleLoadUser(id)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              margin: '0 8px 8px 0',
              background: loading ? '#f5f5f5' : '#1890ff',
              color: loading ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            加载用户 {id}
          </button>
        ))}
      </div>

      {/* 状态显示 */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '16px', 
        borderRadius: '8px',
        minHeight: '120px'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', color: '#1890ff' }}>
            🔄 加载中...
          </div>
        )}
        
        {error && (
          <div style={{ color: '#ff4d4f' }}>
            ❌ {error}
            <button
              onClick={retry}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </div>
        )}
        
        {user && !loading && (
          <div style={{ color: '#52c41a' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>✅ 用户信息加载成功：</h5>
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>姓名:</strong> {user.name}</div>
            <div><strong>邮箱:</strong> {user.email}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        💡 提示：此示例有30%的随机失败率，支持自动重试。请多次点击体验不同状态！
      </div>
    </div>
  );
}
```

## 📝 useForm - 表单状态管理

<code src="./components/FormDemo.tsx"></code>

## 🌐 useNetworkStatus - 网络状态监控

<code src="./components/NetworkStatusDemo.tsx"></code>

## 🔐 useAuth - 用户认证管理

<code src="./components/AuthDemo.tsx"></code>

## 🌍 useApi - API请求封装

<code src="./components/ApiDemo.tsx"></code>

## 💻 useClientSide - 客户端检测

<code src="./components/ClientSideDemo.tsx"></code>

## 🎨 useEditor - 低代码编辑器

<code src="./components/EditorDemo.tsx"></code>

---

## 🛠️ 实现原理

这些示例展示了如何在 Dumi 中创建真正可交互的组件：

### ✅ **关键要素**

1. **独立的示例文件** - 每个示例都是完整的组件
2. **Mock 数据和函数** - 不依赖外部 API
3. **完整的状态管理** - 组件内部处理所有状态
4. **错误处理** - 模拟真实场景的错误情况

### 🎯 **最佳实践**

- 使用 `export default` 导出组件
- 提供清晰的状态反馈
- 添加说明提示
- 模拟真实的使用场景 