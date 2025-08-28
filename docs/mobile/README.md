# 移动端 H5 应用文档

## 项目概述

移动端 H5 应用是一个基于 React + Umi 4 + antd-mobile 构建的现代化移动端工作台应用。该应用支持独立运行，也可以作为 H5 页面嵌入到原生 iOS 和 Android 应用中。

## 技术栈

### 核心技术
- **框架**: React 18 + TypeScript
- **构建工具**: Umi 4.x
- **UI 组件**: antd-mobile 5.x
- **样式**: Tailwind CSS + PostCSS
- **状态管理**: Zustand
- **路由**: Umi 内置路由
- **HTTP 客户端**: Axios
- **开发工具**: vConsole (移动端调试)

### 项目特色
- 📱 移动优先的响应式设计
- 🔄 支持 PWA (Progressive Web App)
- 🌉 原生桥接能力 (JavaScript Bridge)
- 🎨 现代化 UI 设计
- 🔧 完善的开发工具链
- 📊 全面的状态管理
- 🛡️ TypeScript 类型安全

## 项目结构

```
apps/mobile/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── auth/              # 认证相关 API
│   │   ├── client.ts          # Axios 客户端配置
│   │   └── ...
│   ├── components/            # 公共组件
│   │   ├── ErrorBoundary/     # 错误边界组件
│   │   ├── Layout/            # 布局组件
│   │   └── Toast/             # Toast 组件
│   ├── config/                # 配置文件
│   │   └── env.ts             # 环境配置
│   ├── hooks/                 # 自定义 Hooks
│   │   └── useDeviceInfo.ts   # 设备信息 Hook
│   ├── pages/                 # 页面组件
│   │   ├── Auth/              # 认证页面
│   │   ├── Home/              # 首页
│   │   ├── Apps/              # 应用页面
│   │   ├── Message/           # 消息页面
│   │   └── Profile/           # 个人页面
│   ├── router/                # 路由配置
│   │   └── routes.ts          # 路由定义
│   ├── stores/                # 状态管理
│   │   ├── auth/              # 认证状态
│   │   ├── app/               # 应用状态
│   │   ├── ui/                # UI 状态
│   │   └── index.ts           # 统一导出
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   │   ├── nativeBridge.ts    # 原生桥接
│   │   └── index.ts
│   ├── app.tsx                # Umi 运行时配置
│   └── index.css              # 全局样式
├── public/                    # 静态资源
├── .umirc.ts                  # Umi 配置文件
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 项目依赖
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖
```bash
cd apps/mobile
pnpm install
```

### 开发模式
```bash
pnpm dev
```
访问 http://localhost:8000

### 构建生产版本
```bash
pnpm build
```

### 预览生产版本
```bash
pnpm preview
```

## 核心功能

### 1. 认证系统
- 用户登录/注册
- 忘记密码
- Token 自动刷新
- 权限控制

### 2. 应用中心
- 应用列表展示
- 应用分类
- 应用搜索
- 应用详情

### 3. 消息系统
- 消息列表
- 消息分类 (全部/未读/聊天/通知)
- 消息搜索
- 实时消息推送

### 4. 个人中心
- 个人信息管理
- 设置中心
- 通知管理
- 账户安全

### 5. 文档管理
- 文档列表
- 文档分类
- 文档搜索
- 文档预览

## 状态管理

采用 Zustand 进行状态管理，按功能模块划分：

### 认证状态 (useAuthStore)
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  // ...
}
```

### UI 状态 (useUIStore)
```typescript
interface UIState {
  globalLoading: boolean
  toasts: ToastMessage[]
  modals: ModalState
  setGlobalLoading: (loading: boolean, text?: string) => void
  showToast: (message: string, type?: ToastType) => void
  // ...
}
```

### 应用状态 (useAppStore)
```typescript
interface AppState {
  settings: AppSettings
  isOnline: boolean
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  // ...
}
```

## 原生桥接

### JavaScript Bridge API
提供与原生应用通信的桥接功能：

```typescript
// 调用原生方法
nativeBridge.callNative('showToast', { message: '操作成功' })

// 监听原生事件
nativeBridge.onNativeMessage('networkStatusChanged', (data) => {
  console.log('网络状态变化:', data)
})

// 获取设备信息
const deviceInfo = await nativeBridge.getDeviceInfo()
```

### 支持的原生功能
- 设备信息获取
- 网络状态监听
- 文件操作
- 相机/相册访问
- 位置服务
- 推送通知
- 应用状态管理

## 响应式设计

### 断点配置
```typescript
const breakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)'
}
```

### 设备适配
- 移动端优先设计
- 支持平板横屏/竖屏
- 自适应不同屏幕尺寸
- 触摸友好的交互设计

## 开发调试

### vConsole 调试
在开发环境自动启用 vConsole：
- Console 面板：查看日志
- Network 面板：监控网络请求
- Element 面板：查看 DOM 结构
- Storage 面板：查看本地存储

### 调试工具
```typescript
// 在首页提供的调试功能
- 测试 vConsole
- 生成测试日志
- 原生功能测试
- 环境信息查看
```

## 部署配置

### 环境变量
```bash
# API 配置
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_VCONSOLE=true
VITE_ENABLE_PWA=true

# 应用配置
VITE_APP_TITLE=移动端工作台
VITE_APP_VERSION=1.0.0
```

### PWA 配置
- Service Worker 支持
- 离线功能
- 应用图标
- 启动画面

## 性能优化

### 代码分割
- 路由级别的懒加载
- 组件级别的动态导入
- 第三方库按需加载

### 缓存策略
- HTTP 缓存
- Service Worker 缓存
- 本地存储缓存

### 资源优化
- 图片懒加载
- 资源压缩
- CDN 加速

## 测试

### 单元测试
```bash
pnpm test
```

### 类型检查
```bash
pnpm type-check
```

### ESLint 检查
```bash
pnpm lint
```

## 故障排除

### 常见问题

1. **开发服务器启动失败**
   - 检查端口是否被占用
   - 确认 Node.js 版本
   - 清除 node_modules 重新安装

2. **构建失败**
   - 检查 TypeScript 类型错误
   - 确认所有依赖已安装
   - 检查环境变量配置

3. **移动端显示异常**
   - 检查 viewport 配置
   - 确认 CSS 兼容性
   - 测试不同设备

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
