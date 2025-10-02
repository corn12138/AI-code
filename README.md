# AI-Code 全栈应用项目

这是一个基于 Monorepo 架构的现代化全栈应用项目，包含博客系统、移动端 H5 应用、原生移动应用和后端服务。

## 🚀 项目特色

- **📱 混合移动开发**: H5 + 原生应用，支持开发环境远程加载和生产环境本地打包
- **🌟 星空暗黑主题**: 现代化 UI 设计，GPU 加速动画效果
- **⚡ 服务端渲染**: 自定义 SSR 实现，优化 SEO 和首屏加载
- **🔧 Monorepo 架构**: 统一的依赖管理和代码共享
- **🧪 完整测试体系**: 单元测试、集成测试、端到端测试
- **📊 监控运维**: Prometheus + Grafana 监控体系

## 🛠 技术栈

- **前端**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **移动端**: React + Vite (SSR), Kotlin (Android), Swift (iOS)
- **后端**: NestJS, TypeScript, PostgreSQL, TypeORM
- **部署**: Docker, Nginx, Docker Compose
- **包管理**: pnpm workspace
- **测试**: Vitest, Playwright, Jest
- **监控**: Prometheus, Grafana

## 📁 项目结构

```
AI-code/
├── apps/                    # 应用程序
│   ├── blog/               # Next.js 博客应用
│   ├── mobile/             # React H5 移动应用 (SSR)
│   ├── server/             # NestJS 后端服务
│   ├── android-native/     # Android 原生应用
│   └── ios-native/         # iOS 原生应用
├── shared/                  # 共享代码库
│   ├── hooks/              # React Hooks 库 (@corn12138/hooks)
│   ├── ui/                 # UI 组件库
│   └── utils/              # 工具函数库
├── scripts/                 # 项目脚本
├── docs/                    # 项目文档
├── testing/                 # 测试相关
├── monitoring/              # 监控配置
└── docker-compose.yml       # Docker 编排
```

## 🚀 快速开始

### 开发环境

1. **安装依赖**
```bash
pnpm install
```

2. **启动开发服务器**
```bash
# 启动所有服务
pnpm dev

# 或单独启动
pnpm dev:blog    # 博客应用 (http://localhost:3000)
pnpm dev:mobile  # 移动端应用 (http://localhost:3000)
pnpm dev:server  # 后端服务 (http://localhost:3001)
```

3. **配置环境变量**
```bash
# 复制环境变量示例文件
cp apps/env.example apps/blog/.env
cp apps/env.example apps/mobile/.env
cp apps/env.example apps/server/.env
```

### 生产环境

使用 Docker Compose 一键部署：

```bash
docker-compose up -d
```

## 📱 移动端开发

### H5 应用构建
```bash
cd apps/mobile

# 构建原生嵌入版本
npm run build:native

# 构建 iOS 版本
npm run build:ios

# 构建 Android 版本
npm run build:android
```

### 原生应用开发
```bash
# Android 应用
cd apps/android-native
./run-android.sh

# iOS 应用
cd apps/ios-native
./run-ios.sh
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 单元测试
pnpm test:unit

# 端到端测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

## 📊 监控

```bash
# 启动监控服务
./scripts/monitoring-quick-start.sh

# 访问监控面板
# Grafana: http://localhost:3000
# Prometheus: http://localhost:9090
```

## 🔧 开发工具

### Hooks 库管理
```bash
# 同步 Hooks 到独立仓库
./scripts/sync-hooks.sh

# 发布新版本
./scripts/publish-hooks.sh patch "更新说明"
```

### 移动端资源同步
```bash
# 同步 H5 到 iOS
./scripts/sync-mobile-to-ios.sh

# 同步 H5 到 Android
./scripts/sync-mobile-to-android.sh
```

### 项目维护
```bash
# 健康检查
./scripts/health-check.sh

# 安全审计
pnpm security-audit

# 清理重复文件
./scripts/cleanup-duplicates.sh
```

## 📚 文档

- [项目结构说明](./docs/PROJECT_STRUCTURE.md)
- [博客应用文档](./docs/blog/README.md)
- [移动端应用文档](./docs/mobile/README.md)
- [服务端文档](./docs/server/README.md)
- [原生应用文档](./NATIVE_APPS_README.md)
- [移动端嵌入策略](./MOBILE_EMBEDDING_STRATEGY.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [NestJS](https://nestjs.com/) - Node.js 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
