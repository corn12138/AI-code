# useChatSSE

用于处理 AI Chat 流式对话的 React Hook。支持 SSE（Server-Sent Events）实时通信，提供打字机效果的流式消息接收。**高度可配置，支持各种 API 接口和认证方式。**

## 特性

- 🚀 **实时流式通信** - 基于 SSE 的实时消息流
- 🔄 **多轮对话支持** - 支持对话历史和上下文
- 🤖 **多模型切换** - 支持动态切换 AI 模型
- 🔐 **多种认证方式** - Bearer、Basic、自定义认证
- 🔌 **自动重连机制** - 网络断开时智能重连
- ⚙️ **高度可配置** - 支持自定义 API 端点、请求头、数据格式
- 🎯 **TypeScript 支持** - 完整的类型定义
- 🛡️ **错误处理** - 完善的错误处理和状态管理
- 📡 **双模式支持** - EventSource 和 Fetch ReadableStream
- 🎛️ **数据转换** - 支持请求/响应数据自定义转换

## 基础用法

```tsx
import React, { useState } from 'react';
import { useChatSSE } from '@corn12138/hooks';

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const { 
    sendMessage, 
    connectionStatus, 
    isConnected, 
    reconnectAttempts 
  } = useChatSSE({
    onMessage: (content, type, data) => {
      if (type === 'content') {
        // 处理流式内容
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage.streaming) {
            // 更新最后一条消息
            return prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, content: msg.content + content }
                : msg
            );
          } else {
            // 创建新消息
            return [...prev, {
              role: 'assistant',
              content,
              streaming: true
            }];
          }
        });
      } else if (type === 'finish') {
        // 消息完成
        setMessages(prev =>
          prev.map(msg => ({ ...msg, streaming: false }))
        );
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onConnectionChange: (status) => {
      console.log('连接状态:', status);
    }
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // 添加用户消息
    setMessages(prev => [...prev, {
      role: 'user',
      content: input
    }]);

    // 发送到AI
    await sendMessage(input);
    setInput('');
  };

  return (
    <div>
      <div>状态: {connectionStatus} {reconnectAttempts > 0 && `(重连第${reconnectAttempts}次)`}</div>
      
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.role}:</strong> {msg.content}
            {msg.streaming && <span className="cursor">|</span>}
          </div>
        ))}
      </div>
      
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      
      <button onClick={handleSend} disabled={!isConnected}>
        发送 {!isConnected && '(连接中...)'}
      </button>
    </div>
  );
}
```

## 高级自定义配置

### 自定义认证方式

```tsx
import { useChatSSE } from '@corn12138/hooks';

// Bearer Token 认证（默认）
const { sendMessage } = useChatSSE({
  authType: 'bearer',
  getAuthToken: () => sessionStorage.getItem('token'),
  onMessage: (content) => console.log(content),
  onError: (error) => console.error(error)
});

// Basic 认证
const { sendMessage: sendWithBasic } = useChatSSE({
  authType: 'basic',
  getBasicAuth: () => ({
    username: 'user@example.com',
    password: 'password123'
  }),
  onMessage: (content) => console.log(content),
  onError: (error) => console.error(error)
});

// 自定义认证头
const { sendMessage: sendWithCustom } = useChatSSE({
  authType: 'custom',
  getCustomAuthHeader: () => ({
    'X-API-Key': 'your-api-key',
    'X-Client-ID': 'your-client-id'
  }),
  onMessage: (content) => console.log(content),
  onError: (error) => console.error(error)
});

// 无认证
const { sendMessage: sendPublic } = useChatSSE({
  authType: 'none',
  onMessage: (content) => console.log(content),
  onError: (error) => console.error(error)
});
```

### 自动重连配置

```tsx
import { useChatSSE } from '@corn12138/hooks';

function ReconnectChat() {
  const { sendMessage, connectionStatus, reconnectAttempts } = useChatSSE({
    // 启用自动重连
    reconnect: {
      enabled: true,
      maxAttempts: 5,          // 最多重连5次
      interval: 1000,          // 基础间隔1秒
      backoffFactor: 2         // 递增因子，重连间隔会增长
    },
    
    // 超时配置
    timeout: {
      connection: 10000,       // 连接超时10秒
      response: 30000,         // 响应超时30秒
      idle: 60000             // 空闲超时1分钟
    },
    
    onMessage: (content) => console.log(content),
    onError: (error) => console.error(error),
    onConnectionChange: (status) => console.log('状态:', status),
    onReconnectAttempt: (attempt, maxAttempts) => {
      console.log(`重连尝试 ${attempt}/${maxAttempts}`);
    }
  });

  return (
    <div>
      <div>连接状态: {connectionStatus}</div>
      {reconnectAttempts > 0 && <div>重连次数: {reconnectAttempts}</div>}
    </div>
  );
}
```

### 自定义 API 接口

```tsx
import { useChatSSE } from '@corn12138/hooks';

function CustomAPIChat() {
  const { sendMessage } = useChatSSE({
    // API 配置
    chatEndpoint: 'https://api.example.com/v2/chat',
    httpMethod: 'POST',
    dataFormat: 'json',
    corsMode: 'cors',
    credentials: 'include',
    
    // 自定义请求头
    headers: {
      'X-API-Version': '2.0',
      'X-Client-Platform': 'web'
    },
    
    // 自定义请求体构建
    buildRequestBody: (message, conversationId, model, extraData) => ({
      prompt: message,
      session_id: conversationId,
      model_name: model,
      stream: true,
      temperature: 0.7,
      ...extraData
    }),
    
    // 自定义URL构建
    buildRequestUrl: (endpoint, params) => {
      const url = new URL(endpoint);
      url.searchParams.set('format', 'sse');
      return url.toString();
    },
    
    onMessage: (content) => console.log(content),
    onError: (error) => console.error(error)
  });

  // 发送时可以传入额外数据
  const handleSend = () => {
    sendMessage('Hello', null, 'gpt-4', {
      temperature: 0.9,
      max_tokens: 1000
    });
  };

  return <button onClick={handleSend}>发送</button>;
}
```

### 自定义 SSE 解析器

```tsx
import { useChatSSE } from '@corn12138/hooks';

function CustomSSEChat() {
  const { sendMessage } = useChatSSE({
    // 自定义 SSE 解析器
    sseParser: {
      // 识别有效的 SSE 行
      isValidLine: (line) => line.startsWith('event: message'),
      
      // 解析 SSE 数据
      parseData: (line) => {
        const data = line.slice(14); // 移除 'event: message' 前缀
        try {
          return JSON.parse(data);
        } catch {
          return { type: 'content', content: data };
        }
      },
      
      // 检查是否为结束信号
      isEndSignal: (data) => data.event === 'done' || data.error
    },
    
    onMessage: (content, type, data) => {
      console.log('收到:', content, '类型:', type);
    },
    onError: (error) => console.error(error)
  });

  return <div>自定义 SSE 解析</div>;
}
```

### 数据转换器

```tsx
import { useChatSSE } from '@corn12138/hooks';

function DataTransformChat() {
  const { sendMessage } = useChatSSE({
    // 数据转换器
    dataTransformer: {
      // 请求前转换
      request: (data) => ({
        ...data,
        timestamp: Date.now(),
        user_agent: navigator.userAgent
      }),
      
      // 响应后转换
      response: (data) => ({
        ...data,
        content: data.text || data.content, // 统一字段名
        type: data.event_type || data.type
      })
    },
    
    onMessage: (content, type, data) => {
      console.log('转换后的数据:', data);
    },
    onError: (error) => console.error(error)
  });

  return <div>数据转换示例</div>;
}
```

### 调试模式

```tsx
import { useChatSSE } from '@corn12138/hooks';

function DebugChat() {
  const { sendMessage } = useChatSSE({
    // 启用调试
    debug: true,
    
    // 自定义日志函数
    logger: (level, message, data) => {
      const timestamp = new Date().toISOString();
      console[level](`[${timestamp}][useChatSSE] ${message}`, data);
      
      // 也可以发送到远程日志服务
      if (level === 'error') {
        // sendToLogService({ level, message, data, timestamp });
      }
    },
    
    onMessage: (content) => console.log(content),
    onError: (error) => console.error(error)
  });

  return <div>调试模式</div>;
}
```

### 使用 EventSource 模式

```tsx
import { useChatSSE } from '@corn12138/hooks';

function EventSourceChat() {
  const { sendMessage } = useChatSSE({
    // 使用原生 EventSource
    useEventSource: true,
    
    // EventSource 配置
    eventSourceConfig: {
      withCredentials: true
    },
    
    // 模型配置
    modelFieldName: 'ai_model',
    defaultModel: 'claude-3',
    
    onMessage: (content) => console.log(content),
    onError: (error) => console.error(error)
  });

  return <div>EventSource 模式</div>;
}
```

## API 参考

### UseChatSSEOptions

#### 基础回调

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `onMessage` | `(content: string, type: string, data?: any) => void` | ✅ | 消息接收回调 |
| `onError` | `(error: Error) => void` | ✅ | 错误处理回调 |
| `onConnectionChange` | `(status: ConnectionStatus) => void` | ❌ | 连接状态变化回调 |
| `onReconnectAttempt` | `(attempt: number, maxAttempts: number) => void` | ❌ | 重连尝试回调 |

#### API 配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `chatEndpoint` | `string` | `'/api/chat'` | Chat API 端点 |
| `httpMethod` | `'GET' \| 'POST' \| 'PUT' \| 'PATCH'` | `'POST'` | HTTP 方法 |
| `dataFormat` | `'json' \| 'form' \| 'text' \| 'custom'` | `'json'` | 数据格式 |
| `headers` | `Record<string, string>` | `{}` | 自定义请求头 |
| `corsMode` | `RequestMode` | `'cors'` | 跨域模式 |
| `credentials` | `RequestCredentials` | `'same-origin'` | 请求凭证模式 |

#### 认证配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `authType` | `'bearer' \| 'basic' \| 'custom' \| 'none'` | `'bearer'` | 认证类型 |
| `getAuthToken` | `() => string \| null` | 从 localStorage 读取 | 获取认证 token |
| `getBasicAuth` | `() => {username: string, password: string} \| null` | - | 获取 Basic 认证信息 |
| `getCustomAuthHeader` | `() => Record<string, string>` | - | 自定义认证头生成器 |

#### 模型配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `defaultModel` | `string` | `'qwen/qwen2.5-7b-instruct/bf-16'` | 默认AI模型 |
| `modelsEndpoint` | `string` | - | 获取可用模型的端点 |
| `modelFieldName` | `string` | `'model'` | 请求体中模型字段名 |

#### SSE 配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `sseParser` | `SSEParser` | 默认解析器 | 自定义 SSE 解析器 |
| `useEventSource` | `boolean` | `false` | 是否使用原生 EventSource |
| `eventSourceConfig` | `EventSourceInit` | `{}` | EventSource 初始化配置 |

#### 重连配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `reconnect` | `ReconnectConfig` | 见下表 | 重连配置 |

**ReconnectConfig**:
```typescript
{
  enabled: false,        // 是否启用自动重连
  maxAttempts: 3,       // 最大重连次数
  interval: 1000,       // 重连间隔（毫秒）
  backoffFactor: 2      // 重连间隔递增因子
}
```

#### 超时配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `timeout` | `TimeoutConfig` | 见下表 | 超时配置 |

**TimeoutConfig**:
```typescript
{
  connection: 10000,    // 连接超时（毫秒）
  response: 30000,      // 响应超时（毫秒）
  idle: 60000          // 空闲超时（毫秒）
}
```

#### 自定义构建器

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `buildRequestBody` | `(message: string, conversationId?: string, model?: string, extraData?: any) => any` | 自定义请求体构建器 |
| `buildRequestUrl` | `(endpoint: string, params?: Record<string, string>) => string` | 自定义 URL 构建器 |

#### 数据转换

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `dataTransformer` | `DataTransformer` | 数据转换器 |

**DataTransformer**:
```typescript
{
  request?: (data: any) => any;   // 发送前的数据转换
  response?: (data: any) => any;  // 接收后的数据转换
}
```

#### 调试配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `debug` | `boolean` | `false` | 是否启用调试日志 |
| `logger` | `(level: 'info' \| 'warn' \| 'error', message: string, data?: any) => void` | 控制台输出 | 自定义日志函数 |

### UseChatSSEReturn

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `sendMessage` | `(message: string, conversationId?: string, model?: string, extraData?: any) => Promise<void>` | 发送消息 |
| `disconnect` | `() => void` | 断开连接 |
| `getAvailableModels` | `() => Promise<{availableModels: string[], defaultModel: string}>` | 获取可用模型列表 |
| `connectionStatus` | `ConnectionStatus` | 连接状态 |
| `isConnected` | `boolean` | 是否已连接 |
| `reconnectAttempts` | `number` | 重连次数 |
| `reconnect` | `() => Promise<void>` | 手动重连 |

### 类型定义

#### ConnectionStatus
```typescript
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
```

#### SSEParser
```typescript
interface SSEParser {
  isValidLine: (line: string) => boolean;
  parseData: (line: string) => any;
  isEndSignal: (data: any) => boolean;
}
```

#### ChatSSEData
```typescript
interface ChatSSEData {
  type: 'content' | 'finish' | 'error' | string;
  content?: string;
  conversationId?: string;
  messageId?: string;
  model?: string;
  error?: string;
  [key: string]: any;
}
```

## 最佳实践

### 1. 错误处理
```tsx
const { sendMessage } = useChatSSE({
  onError: (error) => {
    if (error.message.includes('401')) {
      // 处理认证失败
      redirectToLogin();
    } else if (error.message.includes('429')) {
      // 处理速率限制
      showRateLimitWarning();
    } else {
      // 其他错误
      showErrorToast(error.message);
    }
  },
  onMessage: (content) => console.log(content)
});
```

### 2. 状态管理
```tsx
const [chatState, setChatState] = useState({
  status: 'disconnected',
  messages: [],
  isTyping: false
});

const { sendMessage, connectionStatus } = useChatSSE({
  onConnectionChange: (status) => {
    setChatState(prev => ({ ...prev, status }));
  },
  onMessage: (content, type) => {
    if (type === 'content') {
      setChatState(prev => ({ ...prev, isTyping: true }));
    } else if (type === 'finish') {
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  },
  onError: (error) => console.error(error)
});
```

### 3. 性能优化
```tsx
// 使用 useCallback 优化回调函数
const handleMessage = useCallback((content, type) => {
  // 处理消息逻辑
}, []);

const handleError = useCallback((error) => {
  // 错误处理逻辑
}, []);

const { sendMessage } = useChatSSE({
  onMessage: handleMessage,
  onError: handleError
});
```

## 服务端要求

### SSE 响应格式
服务端需要返回符合以下格式的 SSE 流：

```
data: {"type": "content", "content": "Hello", "conversationId": "123"}

data: {"type": "content", "content": " World", "conversationId": "123"}

data: {"type": "finish", "conversationId": "123", "messageId": "msg-456"}
```

### 认证支持
- **Bearer Token**: `Authorization: Bearer <token>`
- **Basic Auth**: `Authorization: Basic <base64(username:password)>`
- **Custom**: 自定义认证头

### CORS 配置
确保服务端正确配置 CORS 头：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

## 相关 Hooks

- [`useAuth`](../useAuth) - 用户认证管理
- [`useApi`](../useApi) - API 请求管理
- [`useAsync`](../useAsync) - 异步操作管理
- [`useNetworkStatus`](../useNetworkStatus) - 网络状态检测 