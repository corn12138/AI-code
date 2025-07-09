# useNetworkStatus

网络状态监控 Hook，实时监测网络连接状态，支持重连检测和状态回调。

## 基础用法

```javascript
import { useNetworkStatus } from '@ai-code/hooks';

function NetworkIndicator() {
  const { isOnline, reconnect, checkConnectivity } = useNetworkStatus();

  const handleReconnect = async () => {
    const isConnected = await checkConnectivity();
    console.log('网络连接检测结果:', isConnected);
  };

  return (
    <div>
      <div style={{
        padding: '12px',
        borderRadius: '6px',
        backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
        color: isOnline ? '#155724' : '#721c24',
        border: `1px solid ${isOnline ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <h3>网络状态</h3>
        <p>状态: {isOnline ? '在线' : '离线'}</p>
        
        {!isOnline && (
          <div>
            <p>网络连接已断开，请检查网络设置</p>
            <button onClick={reconnect}>重新连接</button>
            <button onClick={handleReconnect}>手动检测</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 高级用法

### 状态回调处理

```javascript
import { useNetworkStatus } from '@ai-code/hooks';
import { useState } from 'react';

function NetworkStatusWithCallbacks() {
  const [messages, setMessages] = useState([]);
  
  const { isOnline, reconnect } = useNetworkStatus({
    onOnline: () => {
      console.log('网络已连接');
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        text: '网络连接已恢复',
        time: new Date().toLocaleTimeString()
      }]);
      
      // 网络恢复时的处理逻辑
      // 比如重新发送失败的请求、同步离线数据等
      console.log('网络恢复，可以执行数据同步操作');
    },
    onOffline: () => {
      console.log('网络已断开');
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error', 
        text: '网络连接已断开',
        time: new Date().toLocaleTimeString()
      }]);
      
      // 网络断开时的处理逻辑
      // 比如缓存未发送的数据、切换到离线模式等
    }
  });

  const clearMessages = () => setMessages([]);

  return (
    <div>
      <div style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <h3>网络状态监控</h3>
        <p>当前状态: <strong style={{color: isOnline ? 'green' : 'red'}}>
          {isOnline ? '在线' : '离线'}
        </strong></p>
        
        <div style={{ marginTop: '12px' }}>
          <button onClick={reconnect}>检查连接</button>
          <button onClick={clearMessages} style={{ marginLeft: '8px' }}>
            清除日志
          </button>
        </div>
      </div>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <h4>网络状态日志</h4>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>暂无日志</p>
        ) : (
          messages.map(message => (
            <div key={message.id} style={{
              padding: '8px',
              margin: '4px 0',
              borderRadius: '4px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24'
            }}>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {message.time}
              </span>
              <span style={{ marginLeft: '8px' }}>{message.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 离线数据缓存

```javascript
import { useNetworkStatus } from '@ai-code/hooks';
import { useLocalStorage } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function OfflineDataSync() {
  const { isOnline } = useNetworkStatus({
    onOnline: async () => {
      // 网络恢复时同步离线数据
      await syncOfflineData();
    }
  });
  
  const [offlineQueue, setOfflineQueue] = useLocalStorage('offlineQueue', []);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) return;
    
    setIsSyncing(true);
    
    try {
      for (const item of offlineQueue) {
        // 模拟发送离线数据
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      
      // 同步成功后清空队列
      setOfflineQueue([]);
      console.log('离线数据同步完成');
    } catch (error) {
      console.error('离线数据同步失败:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addOfflineData = (data) => {
    if (isOnline) {
      // 在线时直接发送
      sendDataOnline(data);
    } else {
      // 离线时加入队列
      setOfflineQueue(prev => [...prev, {
        ...data,
        timestamp: Date.now(),
        id: Date.now().toString()
      }]);
    }
  };

  const sendDataOnline = async (data) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      console.log('数据发送成功');
    } catch (error) {
      // 发送失败时加入离线队列
      addOfflineData(data);
    }
  };

  return (
    <div>
      <div style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <h3>离线数据同步</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>网络状态:</span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
            color: isOnline ? '#155724' : '#721c24'
          }}>
            {isOnline ? '在线' : '离线'}
          </span>
          
          {isSyncing && (
            <span style={{ color: '#007bff' }}>正在同步...</span>
          )}
        </div>
        
        <p>离线队列: {offlineQueue.length} 项待同步</p>
        
        <div style={{ marginTop: '12px' }}>
          <button onClick={() => addOfflineData({ 
            action: 'create', 
            data: { name: '测试数据', value: Math.random() }
          })}>
            添加数据 (自动检测网络状态)
          </button>
          
          {isOnline && offlineQueue.length > 0 && (
            <button 
              onClick={syncOfflineData}
              style={{ marginLeft: '8px' }}
              disabled={isSyncing}
            >
              手动同步离线数据
            </button>
          )}
        </div>
      </div>
      
      {offlineQueue.length > 0 && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4>离线队列</h4>
          {offlineQueue.map(item => (
            <div key={item.id} style={{
              padding: '8px',
              margin: '4px 0',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <div>操作: {item.action}</div>
              <div>时间: {new Date(item.timestamp).toLocaleString()}</div>
              <div>数据: {JSON.stringify(item.data)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 网络质量监控

```javascript
import { useNetworkStatus } from '@ai-code/hooks';
import { useState, useEffect, useRef } from 'react';

function NetworkQualityMonitor() {
  const { isOnline, checkConnectivity } = useNetworkStatus();
  const [ping, setPing] = useState(null);
  const [quality, setQuality] = useState('unknown');
  const intervalRef = useRef(null);

  const measurePing = async () => {
    if (!isOnline) return;
    
    const startTime = performance.now();
    try {
      const isConnected = await checkConnectivity();
      const endTime = performance.now();
      const pingTime = endTime - startTime;
      
      if (isConnected) {
        setPing(Math.round(pingTime));
        
        // 根据延迟判断网络质量
        if (pingTime < 100) {
          setQuality('excellent');
        } else if (pingTime < 300) {
          setQuality('good');
        } else if (pingTime < 1000) {
          setQuality('fair');
        } else {
          setQuality('poor');
        }
      } else {
        setPing(null);
        setQuality('disconnected');
      }
    } catch (error) {
      setPing(null);
      setQuality('error');
    }
  };

  useEffect(() => {
    if (isOnline) {
      measurePing();
      intervalRef.current = setInterval(measurePing, 10000); // 每10秒检测一次
    } else {
      setPing(null);
      setQuality('offline');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOnline]);

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return '#28a745';
      case 'good': return '#17a2b8';
      case 'fair': return '#ffc107';
      case 'poor': return '#fd7e14';
      case 'offline':
      case 'disconnected':
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getQualityText = (quality) => {
    switch (quality) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '较差';
      case 'offline': return '离线';
      case 'disconnected': return '无连接';
      case 'error': return '检测失败';
      default: return '未知';
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h3>网络质量监控</h3>
      
      <div style={{
        display: 'inline-block',
        padding: '20px',
        borderRadius: '50%',
        backgroundColor: getQualityColor(quality),
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        minWidth: '80px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        {ping !== null ? `${ping}ms` : '--'}
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {getQualityText(quality)}
        </div>
      </div>
      
      <div style={{ marginTop: '16px' }}>
        <button onClick={measurePing} disabled={!isOnline}>
          立即检测
        </button>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
        {isOnline ? '自动每10秒检测一次' : '网络离线'}
      </div>
    </div>
  );
}
```

### 智能重连机制

```javascript
import { useNetworkStatus } from '@ai-code/hooks';
import { useState, useEffect, useRef } from 'react';

function SmartReconnect() {
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;

  const { isOnline, checkConnectivity } = useNetworkStatus({
    onOnline: () => {
      setReconnectAttempts(0);
      setIsReconnecting(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    },
    onOffline: () => {
      startReconnectProcess();
    }
  });

  const startReconnectProcess = () => {
    if (isReconnecting || reconnectAttempts >= maxReconnectAttempts) return;
    
    setIsReconnecting(true);
    attemptReconnect();
  };

  const attemptReconnect = async () => {
    const newAttempts = reconnectAttempts + 1;
    setReconnectAttempts(newAttempts);
    
    try {
      const isConnected = await checkConnectivity();
      
      if (isConnected) {
        setIsReconnecting(false);
        setReconnectAttempts(0);
        return;
      }
    } catch (error) {
      console.error('重连检测失败:', error);
    }

    // 如果还没达到最大重连次数，继续尝试
    if (newAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, newAttempts - 1), 30000); // 指数退避，最大30秒
      
      reconnectTimeoutRef.current = setTimeout(() => {
        attemptReconnect();
      }, delay);
    } else {
      setIsReconnecting(false);
    }
  };

  const manualReconnect = () => {
    setReconnectAttempts(0);
    setIsReconnecting(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    startReconnectProcess();
  };

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const getNextRetryTime = () => {
    if (!isReconnecting || reconnectAttempts >= maxReconnectAttempts) return 0;
    return Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
  };

  return (
    <div style={{
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h3>智能重连机制</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <div>网络状态: 
          <span style={{
            marginLeft: '8px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
            color: isOnline ? '#155724' : '#721c24'
          }}>
            {isOnline ? '在线' : '离线'}
          </span>
        </div>
        
        {!isOnline && (
          <div style={{ marginTop: '8px' }}>
            <div>重连尝试: {reconnectAttempts} / {maxReconnectAttempts}</div>
            
            {isReconnecting && (
              <div style={{ color: '#007bff' }}>
                正在重连... 
                {getNextRetryTime() > 0 && (
                  <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                    下次尝试: {(getNextRetryTime() / 1000).toFixed(0)}秒后
                  </span>
                )}
              </div>
            )}
            
            {reconnectAttempts >= maxReconnectAttempts && !isReconnecting && (
              <div style={{ color: '#dc3545' }}>
                重连失败，已达到最大尝试次数
              </div>
            )}
          </div>
        )}
      </div>
      
      <div>
        <button 
          onClick={manualReconnect} 
          disabled={isOnline || (isReconnecting && reconnectAttempts < maxReconnectAttempts)}
        >
          手动重连
        </button>
      </div>
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