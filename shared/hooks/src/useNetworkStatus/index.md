# useNetworkStatus

用于监控网络状态的 React Hook。

## 基本用法

```tsx
import { useNetworkStatus } from '@corn12138/hooks';

function NetworkIndicator() {
  const { online, downlink, effectiveType } = useNetworkStatus();
  
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

## 高级用法

```tsx
import { useNetworkStatus } from '@corn12138/hooks';

function DataComponent() {
  const { online, downlink } = useNetworkStatus();
  
  // 根据网络状态调整行为
  const shouldLoadHighRes = online && downlink > 10;
  
  return (
    <div>
      <img 
        src={shouldLoadHighRes ? '/high-res.jpg' : '/low-res.jpg'} 
        alt="Dynamic quality"
      />
    </div>
  );
}
```

## 离线处理

```tsx
import { useNetworkStatus } from '@corn12138/hooks';
import { useLocalStorage } from '@corn12138/hooks';

function OfflineHandler() {
  const { online } = useNetworkStatus();
  const [offlineData, setOfflineData] = useLocalStorage('offline', []);
  
  useEffect(() => {
    if (!online) {
      // 保存离线数据
      setOfflineData(prev => [...prev, { timestamp: Date.now() }]);
    }
  }, [online]);
  
  return (
    <div>
      {!online && (
        <div>您当前离线，数据将在联网后同步</div>
      )}
    </div>
  );
}
```

## 网络质量监控

```tsx
import { useNetworkStatus } from '@corn12138/hooks';

function QualityMonitor() {
  const { downlink, effectiveType, rtt } = useNetworkStatus();
  
  const getQualityColor = () => {
    if (downlink > 10) return 'green';
    if (downlink > 1) return 'yellow';
    return 'red';
  };
  
  return (
    <div>
      <div style={{ color: getQualityColor() }}>
        Network Quality: {effectiveType}
      </div>
      <p>Speed: {downlink} Mbps</p>
      <p>Latency: {rtt} ms</p>
    </div>
  );
}
```

## 实际应用

```tsx
import { useNetworkStatus } from '@corn12138/hooks';

function VideoPlayer() {
  const { online, downlink } = useNetworkStatus();
  
  const getVideoQuality = () => {
    if (!online) return 'none';
    if (downlink > 25) return '4K';
    if (downlink > 10) return '1080p';
    if (downlink > 5) return '720p';
    return '480p';
  };
  
  return (
    <div>
      <video 
        src={`/video-${getVideoQuality()}.mp4`}
        controls
      />
      <p>Quality: {getVideoQuality()}</p>
    </div>
  );
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| options | `UseNetworkStatusOptions` | ❌ | 配置选项 |

### UseNetworkStatusOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| onOnline | `() => void` | - | 网络连接回调 |
| onOffline | `() => void` | - | 网络断开回调 |

### 返回值

返回 `UseNetworkStatusReturn` 对象：

| 属性 | 类型 | 描述 |
|------|------|------|
| isOnline | `boolean` | 是否在线 |
| reconnect | `() => void` | 重新检测连接 |
| checkConnectivity | `() => Promise<boolean>` | 异步检测连通性 |

## 使用场景

### 1. 离线提示

```javascript
function OfflineNotification() {
  const { isOnline } = useNetworkStatus();
  
  if (isOnline) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '12px',
      textAlign: 'center',
      zIndex: 9999
    }}>
      ⚠️ 网络连接已断开，某些功能可能无法使用
    </div>
  );
}
```

### 2. 条件功能禁用

```javascript
function NetworkDependentFeatures() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <div>
      <button disabled={!isOnline}>
        在线聊天 {!isOnline && '(需要网络连接)'}
      </button>
      
      <button disabled={!isOnline}>
        同步数据 {!isOnline && '(离线模式)'}
      </button>
      
      <button>
        离线阅读 (始终可用)
      </button>
    </div>
  );
}
```

### 3. 数据同步状态

```javascript
function DataSyncStatus() {
  const { isOnline } = useNetworkStatus({
    onOnline: () => {
      // 网络恢复时自动同步
      syncPendingData();
    }
  });
  
  const syncPendingData = async () => {
    // 同步逻辑
    console.log('开始同步数据...');
  };
  
  return (
    <div>
      <h3>数据同步</h3>
      <p>状态: {isOnline ? '实时同步' : '离线模式'}</p>
      {!isOnline && <p>网络恢复后将自动同步数据</p>}
    </div>
  );
}
```

## 最佳实践

### 1. 优雅降级

```javascript
function GracefulDegradation() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <div>
      {isOnline ? (
        <LiveDataComponent />
      ) : (
        <CachedDataComponent />
      )}
    </div>
  );
}
```

### 2. 错误边界

```javascript
function NetworkAwareErrorBoundary({ children }) {
  const { isOnline } = useNetworkStatus();
  
  // 根据网络状态显示不同的错误提示
  return (
    <ErrorBoundary
      fallback={isOnline ? <OnlineErrorUI /> : <OfflineErrorUI />}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 3. 性能优化

```javascript
// 避免过度检测
const { isOnline, checkConnectivity } = useNetworkStatus();

// 使用防抖避免频繁检测
const debouncedCheck = useDebouncedCallback(checkConnectivity, 1000);
```

## 注意事项

1. **浏览器兼容性**：依赖 `navigator.onLine` API，在某些环境下可能不准确
2. **连通性检测**：默认请求 `/ping` 端点，需要服务器支持或自定义检测逻辑
3. **隐私考虑**：频繁的网络检测可能产生额外流量
4. **移动端**：移动设备的网络状态变化更频繁，需要适当的防抖处理
5. **服务端渲染**：在 SSR 环境中默认返回在线状态 