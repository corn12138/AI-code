# AI-Code 项目结构说明

## 项目概述

AI-Code 是一个基于 Monorepo 架构的全栈应用项目，包含博客系统、移动端 H5 应用、原生移动应用和后端服务。

## 目录结构

```
AI-code/
├── apps/                           # 应用程序
│   ├── blog/                      # Next.js 博客应用
│   ├── mobile/                    # React H5 移动应用 (SSR)
│   ├── server/                    # NestJS 后端服务
│   ├── android-native/            # Android 原生应用
│   ├── ios-native/               # iOS 原生应用
│   └── env.example               # 环境变量示例
├── shared/                        # 共享代码库
│   ├── hooks/                    # React Hooks 库 (@corn12138/hooks)
│   ├── ui/                       # UI 组件库
│   ├── utils/                    # 工具函数库
│   └── auth/                     # 认证相关共享代码
├── config/                        # 配置文件
│   ├── eslint/                   # ESLint 配置
│   ├── typescript/               # TypeScript 配置
│   └── database.js               # 数据库配置
├── scripts/                       # 项目脚本
│   ├── cleanup-duplicates.sh     # 清理重复文件
│   ├── health-check.sh           # 健康检查
│   ├── security-audit.js         # 安全审计
│   ├── sync-hooks.sh             # Hooks 同步到独立仓库
│   ├── publish-hooks.sh          # Hooks 发布脚本
│   ├── sync-mobile-to-ios.sh     # H5 同步到 iOS
│   ├── sync-mobile-to-android.sh # H5 同步到 Android
│   └── monitoring-quick-start.sh # 监控快速启动
├── docs/                          # 项目文档
│   ├── blog/                     # 博客相关文档
│   ├── mobile/                   # 移动端文档
│   ├── server/                   # 服务端文档
│   ├── android-native/           # Android 文档
│   ├── ios-native/              # iOS 文档
│   ├── interview/               # 面试相关文档
│   ├── testing/                 # 测试文档
│   └── reports/                 # 项目报告
├── testing/                       # 测试相关
│   ├── e2e/                     # 端到端测试
│   ├── orchestrator/            # 测试编排器
│   ├── docs/                    # 测试文档
│   └── tools/                   # 测试工具
├── monitoring/                    # 监控配置
│   ├── grafana/                 # Grafana 配置
│   └── prometheus/              # Prometheus 配置
├── infra/                         # 基础设施
│   ├── compose.ci.yml           # CI Docker Compose
│   └── compose.prod.yml         # 生产环境 Docker Compose
├── nginx/                         # Nginx 配置
├── qa/                           # 质量保证
└── docker-compose.yml            # 开发环境 Docker Compose
```

## 应用程序详情

### 1. Blog 应用 (`apps/blog/`)
- **技术栈**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **功能**: 博客文章管理、AI 聊天、用户认证、评论系统
- **特色**: 星空暗黑主题、实时 AI 对话、Markdown 编辑器

### 2. Mobile 应用 (`apps/mobile/`)
- **技术栈**: React, Vite, TypeScript, SSR
- **功能**: 移动端文章阅读、分类浏览、详情展示
- **特色**: 服务端渲染、移动优先设计、原生应用嵌入支持

### 3. Server 服务 (`apps/server/`)
- **技术栈**: NestJS, TypeScript, PostgreSQL, TypeORM
- **功能**: API 服务、用户管理、文章管理、数据库操作
- **特色**: 模块化架构、数据库迁移、API 文档

### 4. Android Native (`apps/android-native/`)
- **技术栈**: Kotlin, WebView, Retrofit
- **功能**: 原生 Android 应用，嵌入 H5 页面
- **特色**: 混合开发、原生桥接、离线支持

### 5. iOS Native (`apps/ios-native/`)
- **技术栈**: Swift, WKWebView, URLSession
- **功能**: 原生 iOS 应用，嵌入 H5 页面
- **特色**: 混合开发、原生桥接、离线支持

## 共享代码库

### Hooks 库 (`shared/hooks/`)
- **NPM 包**: @corn12138/hooks
- **功能**: 通用 React Hooks 集合
- **特色**: 独立发布、完整文档、TypeScript 支持

### UI 组件库 (`shared/ui/`)
- **功能**: 跨应用共享的 UI 组件
- **特色**: 主题支持、响应式设计

### 工具函数库 (`shared/utils/`)
- **功能**: 通用工具函数
- **特色**: 类型安全、单元测试覆盖

## 开发工作流

### 1. 开发环境启动
```bash
# 安装依赖
pnpm install

# 启动所有服务
pnpm dev

# 或单独启动
pnpm dev:blog    # 博客
pnpm dev:mobile  # 移动端
pnpm dev:server  # 后端服务
```

### 2. 构建和部署
```bash
# 构建所有应用
pnpm build

# 使用 Docker Compose 部署
docker-compose up -d
```

### 3. 测试
```bash
# 运行所有测试
pnpm test

# 端到端测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

## 技术特色

### 1. Monorepo 架构
- 统一的依赖管理
- 代码共享和复用
- 一致的开发体验

### 2. 混合移动开发
- H5 + 原生应用结合
- 开发环境远程加载
- 生产环境本地打包

### 3. 服务端渲染 (SSR)
- 自定义 SSR 实现
- 数据预加载
- SEO 优化

### 4. 完整的 CI/CD
- 自动化测试
- 代码质量检查
- 自动化部署

### 5. 监控和运维
- Prometheus + Grafana 监控
- 健康检查
- 日志管理

## 维护指南

### 1. 添加新应用
1. 在 `apps/` 目录下创建新应用
2. 更新 `pnpm-workspace.yaml`
3. 添加相应的脚本和文档

### 2. 更新共享代码
1. 修改 `shared/` 目录下的代码
2. 运行测试确保兼容性
3. 更新版本号和文档

### 3. 发布 Hooks 包
```bash
# 同步到独立仓库
./scripts/sync-hooks.sh

# 发布新版本
./scripts/publish-hooks.sh patch "更新说明"
```

### 4. 移动端资源同步
```bash
# 同步到 iOS
./scripts/sync-mobile-to-ios.sh

# 同步到 Android
./scripts/sync-mobile-to-android.sh
```

## 注意事项

1. **环境变量**: 复制 `apps/env.example` 到各应用的 `.env` 文件
2. **数据库**: 确保 PostgreSQL 服务正常运行
3. **端口冲突**: 各服务使用不同端口，避免冲突
4. **依赖更新**: 定期运行 `pnpm deps:update` 更新依赖
5. **安全检查**: 定期运行 `pnpm security-audit` 进行安全审计
