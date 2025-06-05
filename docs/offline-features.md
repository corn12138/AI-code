# 离线功能实现详解

本文档详细介绍低代码平台的离线编辑功能实现。

## 技术架构

离线功能基于以下技术实现：

- **Service Worker API**: 拦截网络请求，实现资源缓存和离线响应
- **Cache API**: 存储静态资源和API响应
- **IndexedDB**: 存储用户设计、组件库和同步队列
- **Background Sync API**: 网络恢复时自动同步数据（支持的浏览器）

## Service Worker实现

### 注册流程

```javascript
// 在应用入口处注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error);
      });
  });
}
```

### 缓存策略

Service Worker实现了多种缓存策略：

1. **Cache First (缓存优先)**: 先查询缓存，缓存未命中再请求网络
   - 适用于组件库、静态资源等变动少的内容
   
2. **Network First (网络优先)**: 先请求网络，网络请求失败再使用缓存
   - 适用于频繁变动的内容，如API数据
   
3. **Stale While Revalidate**: 先返回缓存内容，同时更新缓存
   - 适用于可接受短暂旧数据的情况

### 离线降级策略

网络请求失败时的处理策略：

- **组件列表API**: 返回本地缓存的组件库
- **设计获取API**: 返回IndexedDB中的设计数据
- **设计保存API**: 保存到同步队列，等待网络恢复
- **HTML页面请求**: 返回离线页面(offline.html)

## 数据管理

### IndexedDB数据库结构

数据库包含三个对象存储：

1. **designs**: 存储用户设计
   - 键: `id` (设计ID)
   - 索引: `updatedAt`, `userId`
   
2. **components**: 缓存组件库
   - 键: `id` (组件ID)
   - 索引: `type`, `category`
   
3. **syncQueue**: 存储待同步操作
   - 键: 自增ID
   - 索引: `operation`, `timestamp`
   - 存储结构:
     ```typescript
     {
       id: number;
       operation: 'save' | 'delete' | 'publish';
       data: any; // 操作相关数据
       timestamp: string; // ISO日期字符串
       attempts: number; // 尝试次数
     }
     ```

### 离线存储API

提供以下主要功能：

```typescript
// 保存设计到离线存储
saveDesignOffline(design: Design): Promise<string>;

// 从离线存储获取设计
getDesignOffline(id: string): Promise<Design | null>;

// 获取所有离线设计
getAllDesignsOffline(): Promise<Design[]>;

// 删除离线设计
deleteDesignOffline(id: string): Promise<void>;

// 缓存组件库
cacheComponents(components: Component[]): Promise<void>;

// 获取缓存的组件
getCachedComponents(category?: string): Promise<Component[]>;

// 添加操作到同步队列
addToSyncQueue(
  operation: 'save' | 'delete' | 'publish', 
  data: any
): Promise<void>;

// 立即尝试同步
trySyncNow(): Promise<void>;

// 监控网络连接状态
initNetworkMonitor(
  onlineCallback: () => void,
  offlineCallback: () => void
): () => void;
```

## 网络状态监测

使用NetworkStatus组件监测并显示网络状态：

- 显示当前是否在线
- 指示是否有待同步的更改
- 提供手动同步按钮

```tsx
const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // 组件UI渲染
  // ...
};
```

## 同步机制

### 自动同步

网络恢复时自动尝试同步待处理的操作：

1. `online`事件触发时，调用`trySyncNow()`
2. 遍历同步队列中的操作并执行
3. 成功后从队列中移除，失败则增加尝试计数

### 手动同步

用户可通过UI手动触发同步：

1. 点击同步按钮
2. 调用`trySyncNow()`尝试同步
3. 显示同步进度和结果

## 安全考虑

- **数据验证**: 从IndexedDB读取数据时验证其结构
- **同源策略**: Service Worker遵循同源策略，只处理同源请求
- **版本管理**: 缓存更新时清理旧版本数据
- **错误处理**: 全面的错误捕获和恢复机制

## 兼容性

支持所有现代浏览器：
- Chrome 45+
- Firefox 44+
- Safari 11.1+
- Edge 17+

某些功能在特定浏览器可能降级：
- Background Sync API: 仅Chrome和基于Chromium的浏览器支持
- 其他浏览器使用轮询方式实现同步

## 性能优化

- **选择性缓存**: 只缓存必要的资源
- **缓存大小控制**: 监控和限制缓存大小
- **延迟加载**: 非关键资源延迟加载
- **批量同步**: 合并多个同步操作，减少网络请求

## 测试方法

1. **模拟断网**:
   - Chrome开发者工具 → Network → Offline
   - 或物理断开网络连接
   
2. **测试场景**:
   - 断网前加载页面，然后断网操作
   - 断网状态下直接访问页面
   - 断网编辑后恢复网络，验证自动同步
   
3. **调试Service Worker**:
   - Chrome: `chrome://serviceworker-internals/`
   - Firefox: `about:debugging#workers`
