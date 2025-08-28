# 移动端应用

基于 React + Vite + antd-mobile 构建的现代化移动端应用，支持响应式设计，兼容手机和平板设备。

## 特性

- 🚀 **现代技术栈**: React 18 + TypeScript + Vite
- 📱 **移动优先**: 基于 antd-mobile 组件库
- 💻 **响应式设计**: 完美适配手机、平板和桌面设备
- 🎨 **优雅界面**: 现代化 UI 设计，流畅的交互体验
- 🔐 **完整认证**: 登录、注册、权限管理
- 📦 **状态管理**: 基于 Zustand 的轻量级状态管理
- 🌐 **网络请求**: 基于 Axios 的 HTTP 客户端
- 📊 **PWA 支持**: 支持离线使用和安装到桌面
- 🔧 **开发友好**: 热重载、TypeScript、ESLint

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 库**: antd-mobile
- **状态管理**: Zustand
- **路由**: React Router
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios
- **代码规范**: ESLint + Prettier

## 项目结构

```
src/
├── components/          # 通用组件
│   └── Layout/         # 布局组件
├── pages/              # 页面组件
│   ├── Home/          # 首页
│   ├── Profile/       # 个人中心
│   ├── Settings/      # 设置页面
│   ├── Auth/          # 认证相关页面
│   └── NotFound/      # 404页面
├── hooks/              # 自定义 Hooks
├── services/           # API 服务
├── store/              # 状态管理
├── types/              # 类型定义
├── utils/              # 工具函数
├── App.tsx            # 主应用组件
├── main.tsx           # 应用入口
└── index.css          # 全局样式
```

## 开始使用

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

应用将在 `http://localhost:3002` 启动

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 代码检查

```bash
pnpm lint
```

### 运行测试

```bash
pnpm test
```

## 功能特性

### 🏠 首页
- 快捷操作入口
- 数据统计展示
- 功能菜单导航
- 通知公告栏

### 👤 个人中心
- 用户信息展示
- 个人统计数据
- 常用功能快捷入口
- 设置入口

### ⚙️ 设置页面
- 通知设置
- 显示设置（主题、语言）
- 隐私设置
- 数据管理
- 关于信息

### 🔐 认证系统
- 用户登录
- 快捷登录（微信、手机号）
- 记住密码
- 忘记密码

### 📱 响应式适配
- 手机端优化（< 768px）
- 平板端适配（768px - 1024px）
- 桌面端兼容（> 1024px）
- 横竖屏自适应

## 设备适配

### 移动端（手机）
- 屏幕宽度 < 768px
- 触摸优化的交互
- 底部导航栏
- 全屏沉浸式体验

### 平板端
- 屏幕宽度 768px - 1024px
- 更大的操作区域
- 优化的布局间距
- 增强的可触达性

### 桌面端
- 屏幕宽度 > 1024px
- 居中布局容器
- 鼠标交互优化
- 完整功能支持

## 开发指南

### 添加新页面

1. 在 `src/pages/` 下创建新的页面目录
2. 创建页面组件和样式文件
3. 在 `src/App.tsx` 中添加路由配置
4. 更新导航菜单（如需要）

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 实现组件逻辑和样式
3. 导出组件供其他地方使用
4. 添加 TypeScript 类型定义

### 状态管理

使用 Zustand 进行状态管理：

```typescript
import { useUserStore } from '@/store'

function MyComponent() {
  const { user, login, logout } = useUserStore()
  
  // 使用状态和方法
}
```

### API 调用

使用封装的 API 客户端：

```typescript
import { api, authApi } from '@/services/api'

// 通用 API 调用
const data = await api.get('/endpoint')

// 认证相关 API
const result = await authApi.login(credentials)
```

### 工具函数

使用提供的工具函数：

```typescript
import { formatTime, debounce, copyToClipboard } from '@/utils'

// 格式化时间
const formatted = formatTime(new Date())

// 防抖函数
const debouncedFn = debounce(() => {}, 300)

// 复制到剪贴板
await copyToClipboard('text to copy')
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置相应的环境变量：

```bash
cp .env.example .env
```

主要配置项：
- `VITE_API_BASE_URL`: API 服务器地址
- `VITE_APP_TITLE`: 应用标题
- `VITE_ENABLE_PWA`: 是否启用 PWA

## 构建和部署

### 构建优化

项目已配置了以下构建优化：
- 代码分割
- 资源压缩
- Tree shaking
- 缓存优化

### 部署选项

1. **静态托管**: 可部署到 Netlify、Vercel 等平台
2. **CDN 部署**: 构建后的文件可上传到 CDN
3. **Docker 部署**: 使用 nginx 提供静态文件服务

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 支持

如有问题或建议，请提交 Issue 或联系开发团队。
