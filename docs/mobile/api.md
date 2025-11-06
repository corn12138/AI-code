# 📱 移动端 API 文档

基于 NestJS BFF 三端统一架构的移动端应用 API 文档。

## 🚀 技术栈

- **BFF 服务**: NestJS + TypeScript + PostgreSQL
- **前端**: React 18 + TypeScript + Vite
- **状态管理**: Zustand
- **样式**: Tailwind CSS v4
- **测试**: Vitest + Testing Library
- **SSR**: 自定义服务端渲染实现
- **外部服务**: 预留 Python/Go 高并发服务接口

## 🏗️ 三端统一架构

### API 版本化设计
- **移动端统一 API**: `/api/mobile/v1/*` - 为 iOS、Android、Web 提供统一接口
- **Web 端增强 API**: `/api/web/v1/*` - 为 Web 应用提供增强功能
- **客户端自动识别**: 通过请求头自动识别客户端类型并优化响应

### 客户端识别
```typescript
// 请求头配置
const headers = {
  'X-Client': 'ios' | 'android' | 'web',        // 客户端类型
  'X-App-Version': '1.0.0',                     // 应用版本
  'X-Platform': 'ios' | 'android' | 'web',      // 平台类型
  'X-Device-Id': 'device-uuid',                 // 设备ID（可选）
  'X-OS-Version': 'iOS 15.0',                   // 系统版本（可选）
}
```

## API 客户端配置

### 基础配置

```typescript
// src/services/api.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-server.com' 
    : 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'web',                    // 客户端类型
    'X-App-Version': '1.0.0',            // 应用版本
    'X-Platform': 'web',                 // 平台类型
  }
})
```

## 📋 API 接口列表

### 移动端统一 API (`/api/mobile/v1/`)

#### 文档相关接口
```bash
# 获取文档列表
GET /api/mobile/v1/docs
Query: ?page=1&pageSize=10&category=frontend&search=关键词

# 获取文档详情
GET /api/mobile/v1/docs/:id

# 创建文档
POST /api/mobile/v1/docs
Body: { title, content, category, author, tags }

# 更新文档
PUT /api/mobile/v1/docs/:id
Body: { title, content, category, tags }

# 删除文档
DELETE /api/mobile/v1/docs/:id

# 批量创建文档
POST /api/mobile/v1/docs/batch
Body: [{ title, content, category }, ...]

# 获取分类列表
GET /api/mobile/v1/categories
```

#### 响应格式
```typescript
// 成功响应
{
  success: true,
  data: T,
  traceId: string,
  timestamp: string
}

// 分页响应
{
  success: true,
  data: {
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    hasMore: boolean
  },
  traceId: string,
  timestamp: string
}
```

### Web 端增强 API (`/api/web/v1/`)

#### 增强功能接口
```bash
# 获取文档列表（包含编辑链接）
GET /api/web/v1/docs

# 获取文档详情（包含字数统计、分享链接）
GET /api/web/v1/docs/:id

# 获取统计信息
GET /api/web/v1/docs/stats

# 增强搜索功能
GET /api/web/v1/docs/search?q=关键词&page=1&pageSize=10
```

### 数据裁剪示例

#### Web 端响应
```typescript
{
  id: "doc-123",
  title: "文档标题",
  content: "文档内容",
  _links: {
    self: "/api/web/v1/docs/doc-123",
    edit: "/api/web/v1/docs/doc-123/edit",
    delete: "/api/web/v1/docs/doc-123"
  },
  _meta: {
    wordCount: 1500,
    readingProgress: 0,
    isBookmarked: false
  }
}
```

#### iOS 端响应
```typescript
{
  id: "doc-123",
  title: "文档标题",
  content: "文档内容",
  _ios: {
    supportsOfflineReading: true,
    supportsShare: true,
    supportsBookmark: true,
    estimatedDataUsage: 2048
  }
}
```

#### Android 端响应
```typescript
{
  id: "doc-123",
  title: "文档标题",
  content: "文档内容",
  _android: {
    supportsOfflineReading: true,
    supportsShare: true,
    supportsBookmark: true,
    estimatedDataUsage: 2048,
    supportsMaterialDesign: true
  }
}
```

### 请求拦截器

```typescript
// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### 响应拦截器

```typescript
// 响应拦截器 - 处理错误和 token 刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期，自动刷新或跳转登录
      const { refreshToken } = useAuthStore.getState()
      // 刷新逻辑...
    }
    return Promise.reject(error)
  }
)
```

## 认证 API

### 登录
```typescript
POST /api/auth/login

// 请求体
{
  "username": "string",
  "password": "string"
}

// 响应
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string"
    },
    "token": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

### 注册
```typescript
POST /api/auth/register

// 请求体
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone?": "string"
}

// 响应
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
}
```

### 刷新 Token
```typescript
POST /api/auth/refresh

// 请求体
{
  "refreshToken": "string"
}

// 响应
{
  "code": 200,
  "data": {
    "token": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

### 重置密码
```typescript
// 发送重置码
POST /api/auth/send-reset-code
{
  "email": "string"
}

// 验证重置码
POST /api/auth/verify-reset-code
{
  "email": "string",
  "code": "string"
}

// 重置密码
POST /api/auth/reset-password
{
  "email": "string",
  "code": "string",
  "newPassword": "string"
}
```

## 用户 API

### 获取用户信息
```typescript
GET /api/user/profile

// 响应
{
  "code": 200,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "phone": "string",
    "avatar": "string",
    "settings": {
      "theme": "light" | "dark",
      "language": "zh-CN" | "en-US"
    }
  }
}
```

### 更新用户信息
```typescript
PUT /api/user/profile

// 请求体
{
  "username?": "string",
  "email?": "string",
  "phone?": "string",
  "avatar?": "string"
}
```

### 更新用户设置
```typescript
PUT /api/user/settings

// 请求体
{
  "theme?": "light" | "dark",
  "language?": "zh-CN" | "en-US",
  "notifications?": {
    "email": boolean,
    "push": boolean,
    "sms": boolean
  }
}
```

## 应用 API

### 获取应用列表
```typescript
GET /api/apps?page=1&limit=20&category=office&search=keyword

// 响应
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "icon": "string",
        "category": "string",
        "url": "string",
        "isInstalled": boolean,
        "version": "string"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 获取应用详情
```typescript
GET /api/apps/:id

// 响应
{
  "code": 200,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "screenshots": ["string"],
    "category": "string",
    "url": "string",
    "version": "string",
    "size": "string",
    "developer": "string",
    "rating": 4.5,
    "downloads": 1000,
    "features": ["string"],
    "requirements": ["string"]
  }
}
```

### 安装/卸载应用
```typescript
POST /api/apps/:id/install
DELETE /api/apps/:id/uninstall

// 响应
{
  "code": 200,
  "message": "操作成功"
}
```

## 消息 API

### 获取消息列表
```typescript
GET /api/messages?page=1&limit=20&type=all&read=false

// 响应
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "string",
        "type": "chat" | "system" | "notification",
        "title": "string",
        "content": "string",
        "avatar": "string",
        "time": "string",
        "isRead": boolean,
        "unreadCount": 0,
        "sender": {
          "id": "string",
          "name": "string",
          "avatar": "string"
        }
      }
    ],
    "total": 50,
    "unreadCount": 5
  }
}
```

### 获取消息详情
```typescript
GET /api/messages/:id

// 响应
{
  "code": 200,
  "data": {
    "id": "string",
    "type": "chat" | "system" | "notification",
    "title": "string",
    "content": "string",
    "time": "string",
    "isRead": boolean,
    "sender": {
      "id": "string",
      "name": "string",
      "avatar": "string"
    },
    "attachments": [
      {
        "type": "image" | "file",
        "url": "string",
        "name": "string",
        "size": "string"
      }
    ]
  }
}
```

### 标记消息已读
```typescript
PUT /api/messages/:id/read
PUT /api/messages/read-all

// 响应
{
  "code": 200,
  "message": "操作成功"
}
```

### 发送消息
```typescript
POST /api/messages

// 请求体
{
  "type": "chat",
  "receiverId": "string",
  "content": "string",
  "attachments?": [
    {
      "type": "image" | "file",
      "url": "string",
      "name": "string"
    }
  ]
}
```

## 通知 API

### 获取通知列表
```typescript
GET /api/notifications?page=1&limit=20&read=false

// 响应
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "string",
        "title": "string",
        "content": "string",
        "type": "info" | "success" | "warning" | "error" | "system",
        "read": boolean,
        "createdAt": "string",
        "data": {},
        "actions": [
          {
            "text": "string",
            "action": "string",
            "style": "default" | "primary" | "danger"
          }
        ]
      }
    ],
    "total": 30,
    "unreadCount": 3
  }
}
```

### 标记通知已读
```typescript
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
```

### 删除通知
```typescript
DELETE /api/notifications/:id
DELETE /api/notifications/clear
```

## 文档 API

### 获取文档列表
```typescript
GET /api/documents?page=1&limit=20&type=all&search=keyword

// 响应
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "string",
        "name": "string",
        "type": "pdf" | "doc" | "image" | "video",
        "size": "string",
        "url": "string",
        "thumbnailUrl": "string",
        "createdAt": "string",
        "updatedAt": "string",
        "folder": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "total": 100
  }
}
```

### 上传文档
```typescript
POST /api/documents/upload

// FormData
{
  "file": File,
  "folderId?": "string"
}

// 响应
{
  "code": 200,
  "data": {
    "id": "string",
    "name": "string",
    "url": "string",
    "thumbnailUrl": "string"
  }
}
```

### 删除文档
```typescript
DELETE /api/documents/:id
```

## 文件夹 API

### 获取文件夹列表
```typescript
GET /api/folders

// 响应
{
  "code": 200,
  "data": [
    {
      "id": "string",
      "name": "string",
      "parentId": "string",
      "createdAt": "string",
      "documentsCount": 10
    }
  ]
}
```

### 创建文件夹
```typescript
POST /api/folders

// 请求体
{
  "name": "string",
  "parentId?": "string"
}
```

## 错误处理

### 错误码定义

```typescript
{
  200: "操作成功",
  400: "请求参数错误",
  401: "未授权",
  403: "禁止访问",
  404: "资源不存在",
  422: "参数验证失败",
  500: "服务器内部错误"
}
```

### 错误响应格式

```typescript
{
  "code": 400,
  "message": "请求参数错误",
  "errors?": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

## 使用示例

### 在组件中使用 API

```typescript
import { apiClient } from '@/api/client'
import { loading, toast } from '@/stores'

const MessageList = () => {
  const [messages, setMessages] = useState([])

  const loadMessages = async () => {
    try {
      loading.show('加载消息中...')
      const response = await apiClient.get('/api/messages')
      setMessages(response.data.data.list)
    } catch (error) {
      toast.error('加载失败')
    } finally {
      loading.hide()
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  return (
    // JSX
  )
}
```

### 使用专用的 API 方法

```typescript
// src/api/auth/index.ts
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiClient.post('/api/auth/login', credentials),
  
  register: (userData: RegisterData) =>
    apiClient.post('/api/auth/register', userData),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/api/auth/refresh', { refreshToken })
}

// 在组件中使用
import { authAPI } from '@/api/auth'

const login = async (credentials) => {
  const response = await authAPI.login(credentials)
  // 处理响应
}
```
