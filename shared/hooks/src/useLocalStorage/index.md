# useLocalStorage

本地存储管理 Hook，提供类型安全的 localStorage 操作，支持跨标签页同步和自定义序列化。

## 基础用法

```javascript
import { useLocalStorage } from '@ai-code/hooks';

function UserPreferences() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 14);
  const [userSettings, setUserSettings] = useLocalStorage('userSettings', {
    notifications: true,
    autoSave: false
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const increaseFontSize = () => {
    setFontSize(prev => prev + 2);
  };

  const toggleNotifications = () => {
    setUserSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  return (
    <div>
      <h2>用户偏好设置</h2>
      
      <div>
        <p>当前主题: {theme}</p>
        <button onClick={toggleTheme}>切换主题</button>
        <button onClick={removeTheme}>重置主题</button>
      </div>
      
      <div>
        <p>字体大小: {fontSize}px</p>
        <button onClick={increaseFontSize}>增大字体</button>
        <button onClick={() => setFontSize(14)}>重置字体</button>
      </div>
      
      <div>
        <p>通知: {userSettings.notifications ? '开启' : '关闭'}</p>
        <button onClick={toggleNotifications}>切换通知</button>
      </div>
    </div>
  );
}
```

## 高级用法

### 跨标签页同步

```javascript
import { useLocalStorage } from '@ai-code/hooks';

function CrossTabSync() {
  // 跨标签页同步用户状态
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false, {
    syncAcrossTabs: true  // 默认为 true
  });

  const [shoppingCart, setShoppingCart] = useLocalStorage('cart', [], {
    syncAcrossTabs: true
  });

  const login = () => {
    setIsLoggedIn(true);
    // 其他标签页会同步更新
  };

  const logout = () => {
    setIsLoggedIn(false);
    setShoppingCart([]); // 清空购物车
  };

  const addToCart = (item) => {
    setShoppingCart(prev => [...prev, item]);
  };

  return (
    <div>
      <h2>购物应用</h2>
      
      {isLoggedIn ? (
        <div>
          <p>已登录 (所有标签页同步)</p>
          <p>购物车商品数: {shoppingCart.length}</p>
          
          <button onClick={() => addToCart({ id: Date.now(), name: '商品' })}>
            添加商品
          </button>
          
          <button onClick={logout}>登出</button>
        </div>
      ) : (
        <div>
          <p>未登录</p>
          <button onClick={login}>登录</button>
        </div>
      )}
    </div>
  );
}
```

### 自定义序列化

```javascript
import { useLocalStorage } from '@ai-code/hooks';

// 自定义日期序列化
function DateStorage() {
  const [lastVisit, setLastVisit] = useLocalStorage(
    'lastVisit',
    new Date(),
    {
      serializer: {
        read: (value) => new Date(value),
        write: (value) => value.toISOString()
      }
    }
  );

  const updateVisit = () => {
    setLastVisit(new Date());
  };

  return (
    <div>
      <h2>访问记录</h2>
      <p>上次访问: {lastVisit.toLocaleString()}</p>
      <button onClick={updateVisit}>更新访问时间</button>
    </div>
  );
}

// 压缩存储大对象
function CompressedStorage() {
  const [largeData, setLargeData] = useLocalStorage(
    'compressedData',
    { items: [] },
    {
      serializer: {
        read: (value) => {
          // 可以在这里添加解压缩逻辑
          return JSON.parse(value);
        },
        write: (value) => {
          // 可以在这里添加压缩逻辑
          return JSON.stringify(value);
        }
      },
      onError: (error) => {
        console.error('存储错误:', error);
        // 可以在这里添加错误上报
      }
    }
  );

  const addItem = () => {
    setLargeData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), data: Math.random() }]
    }));
  };

  return (
    <div>
      <h2>大数据存储</h2>
      <p>数据项数量: {largeData.items.length}</p>
      <button onClick={addItem}>添加数据</button>
    </div>
  );
}
```

### 错误处理

```javascript
import { useLocalStorage } from '@ai-code/hooks';

function ErrorHandling() {
  const [sensitiveData, setSensitiveData] = useLocalStorage(
    'sensitiveData',
    { token: '', preferences: {} },
    {
      onError: (error) => {
        console.error('localStorage 错误:', error);
        
        // 根据错误类型处理
        if (error.name === 'QuotaExceededError') {
          alert('存储空间不足，请清理浏览器数据');
        } else if (error.name === 'SecurityError') {
          console.warn('无法访问 localStorage，可能处于隐私模式');
        } else {
          console.warn('存储操作失败:', error.message);
        }
      }
    }
  );

  const saveToken = (token) => {
    try {
      setSensitiveData(prev => ({ ...prev, token }));
    } catch (error) {
      // 错误会通过 onError 回调处理
    }
  };

  return (
    <div>
      <h2>敏感数据存储</h2>
      <p>Token: {sensitiveData.token ? '已设置' : '未设置'}</p>
      <button onClick={() => saveToken('new-token-' + Date.now())}>
        保存新Token
      </button>
    </div>
  );
}
```

### 表单数据持久化

```javascript
import { useLocalStorage } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function PersistentForm() {
  // 持久化表单数据
  const [formData, setFormData] = useLocalStorage('formDraft', {
    name: '',
    email: '',
    message: ''
  });

  const [isSaved, setIsSaved] = useState(true);

  // 监听表单变化
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => setIsSaved(true), 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearDraft = () => {
    setFormData({ name: '', email: '', message: '' });
  };

  const submitForm = async () => {
    try {
      // 提交表单
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // 成功后清除草稿
      clearDraft();
      alert('提交成功！');
    } catch (error) {
      alert('提交失败，草稿已保存');
    }
  };

  return (
    <div>
      <h2>持久化表单</h2>
      <p>状态: {isSaved ? '已保存' : '保存中...'}</p>
      
      <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
        <div>
          <input
            type="text"
            placeholder="姓名"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        
        <div>
          <input
            type="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        
        <div>
          <textarea
            placeholder="消息"
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
          />
        </div>
        
        <div>
          <button type="submit">提交</button>
          <button type="button" onClick={clearDraft}>清除草稿</button>
        </div>
      </form>
    </div>
  );
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| key | `string` | ✅ | localStorage 键名 |
| initialValue | `T` | ✅ | 初始值 |
| options | `UseLocalStorageOptions<T>` | ❌ | 配置选项 |

### UseLocalStorageOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| serializer | `{ read: Function, write: Function }` | `JSON` | 序列化配置 |
| syncAcrossTabs | `boolean` | `true` | 是否跨标签页同步 |
| onError | `(error: Error) => void` | `console.error` | 错误处理回调 |

### 返回值

返回一个数组 `[value, setValue, removeValue]`：

| 索引 | 类型 | 描述 |
|------|------|------|
| 0 | `T` | 当前存储的值 |
| 1 | `(value: T \| (prev: T) => T) => void` | 设置值的函数 |
| 2 | `() => void` | 删除值的函数 |

## 使用场景

### 1. 用户偏好设置

```javascript
function UserSettings() {
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
      
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
      
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
        {sidebarCollapsed ? '展开' : '收起'}侧边栏
      </button>
    </div>
  );
}
```

### 2. 购物车管理

```javascript
function ShoppingCart() {
  const [items, setItems] = useLocalStorage('cartItems', []);

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div>
      <h2>购物车 ({items.length} 件商品)</h2>
      <p>总价: ¥{getTotalPrice()}</p>
      
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. 游戏存档

```javascript
function GameSave() {
  const [gameState, setGameState] = useLocalStorage('gameState', {
    level: 1,
    score: 0,
    lives: 3,
    achievements: []
  });

  const saveGame = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const resetGame = () => {
    setGameState({
      level: 1,
      score: 0,
      lives: 3,
      achievements: []
    });
  };

  return (
    <div>
      <h2>游戏存档</h2>
      <p>等级: {gameState.level}</p>
      <p>分数: {gameState.score}</p>
      <p>生命: {gameState.lives}</p>
      <p>成就: {gameState.achievements.length}</p>
      
      <button onClick={() => saveGame({ score: gameState.score + 100 })}>
        增加分数
      </button>
      
      <button onClick={resetGame}>重置游戏</button>
    </div>
  );
}
```

## 最佳实践

### 1. 数据验证

```javascript
const [userProfile, setUserProfile] = useLocalStorage(
  'userProfile',
  { name: '', age: 0 },
  {
    serializer: {
      read: (value) => {
        try {
          const data = JSON.parse(value);
          // 验证数据结构
          if (typeof data.name === 'string' && typeof data.age === 'number') {
            return data;
          }
          throw new Error('Invalid data structure');
        } catch {
          return { name: '', age: 0 }; // 返回默认值
        }
      },
      write: JSON.stringify
    }
  }
);
```

### 2. 版本控制

```javascript
const STORAGE_VERSION = '1.0';

const [appData, setAppData] = useLocalStorage(
  'appData',
  { version: STORAGE_VERSION, data: {} },
  {
    serializer: {
      read: (value) => {
        const stored = JSON.parse(value);
        if (stored.version !== STORAGE_VERSION) {
          // 处理版本升级
          return { version: STORAGE_VERSION, data: {} };
        }
        return stored;
      },
      write: JSON.stringify
    }
  }
);
```

### 3. 性能优化

```javascript
// 对于大对象，使用防抖优化写入
import { useDebouncedCallback } from '@ai-code/hooks';

function OptimizedStorage() {
  const [data, setData] = useLocalStorage('largeData', {});
  
  const debouncedSetData = useDebouncedCallback(setData, 500);
  
  // 频繁更新时使用防抖版本
  const handleDataChange = (newData) => {
    debouncedSetData(newData);
  };

  return <div>/* 组件内容 */</div>;
}
```

## 注意事项

1. **存储限制**：localStorage 通常有 5-10MB 的存储限制
2. **同步操作**：localStorage 是同步 API，大量数据可能影响性能
3. **隐私模式**：某些浏览器的隐私模式可能禁用 localStorage
4. **数据类型**：只能存储字符串，复杂对象需要序列化
5. **跨域限制**：不同域名无法共享 localStorage 数据
6. **生命周期**：数据会永久保存，直到用户手动清除或代码删除 