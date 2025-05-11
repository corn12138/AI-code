# 类掘金博客与低代码平台

这是一个使用Monorepo架构构建的全栈应用，包含博客模块和低代码平台。

## 技术栈

- **前端**：
  - 博客模块：Next.js
  - 低代码模块：React + Vite
- **后端**：NestJS
- **数据库**：PostgreSQL
- **部署**：Docker, Nginx
- **包管理**：pnpm workspace

## 目录结构

```
.
├─ apps/
│  ├─ blog/          # Next.js 博客
│  ├─ lowcode/       # React 低代码
│  └─ server/        # NestJS 服务
├─ shared/           # 通用库 & UI 组件
├─ config/           # ESLint, TypeScript 配置
├─ docs/             # 项目文档
├─ docker-compose.yml
└─ pnpm-workspace.yaml
```

## 快速开始

### 开发环境

1. 安装依赖

```bash
pnpm install
```

2. 启动开发服务器

```bash
# 所有项目
pnpm dev

# 或单独启动
pnpm dev:blog    # 博客
pnpm dev:lowcode # 低代码平台
pnpm dev:server  # 后端服务
```

### 生产环境

使用Docker Compose启动:

```bash
docker-compose up -d
```

## 模块文档

- [博客模块](./docs/modules/blog.md)
- [低代码模块](./docs/modules/lowcode.md)
- [服务端模块](./docs/modules/server.md)
