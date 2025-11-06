# 📱 Blog 应用

一个基于 Next.js 14 的现代化技术博客平台，支持 AI 聊天、宇宙主题、服务端渲染等高级功能。

> 📚 **完整文档**: 查看 [docs/README.md](./docs/README.md) 获取详细的技术文档和指南

## 🚀 特性

- **现代化架构**: Next.js 14 + React 18 + TypeScript
- **AI 聊天功能**: 集成 AI 聊天和分析功能
- **宇宙主题**: 独特的暗黑主题设计
- **服务端渲染**: 完整的 SSR 支持
- **数据库集成**: Prisma + PostgreSQL
- **测试覆盖**: 完整的测试基础设施

## 🛠️ 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 设置数据库
```bash
pnpm db:setup
```

### 运行测试
```bash
pnpm test
```

## 📁 项目结构

```
blog/
├── docs/                    # 📚 文档中心
├── src/                    # 💻 源代码
│   ├── app/                # 📄 Next.js 应用
│   ├── components/         # 🧩 React 组件
│   ├── lib/                # 📚 工具库
│   └── test/               # 🧪 测试文件
├── prisma/                 # 🗄️ 数据库
└── scripts/                # 🔧 脚本工具
```

## 🎯 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS v4, 宇宙主题
- **数据库**: Prisma, PostgreSQL
- **测试**: Vitest, Testing Library
- **部署**: Docker, Vercel

## 📚 文档

查看 [docs/README.md](./docs/README.md) 获取完整的技术文档，包括：

- 项目报告和总结
- 技术指南和最佳实践
- 架构设计和实现
- 部署和设置指南

## 🚀 部署

### Docker 部署
```bash
docker build -t blog-app .
docker run -p 3000:3000 blog-app
```

### Vercel 部署
```bash
vercel --prod
```

## 📈 项目状态

- ✅ **重构完成**: 项目结构已优化
- ✅ **文档完善**: 完整的技术文档
- ✅ **测试覆盖**: 全面的测试基础设施
- ✅ **AI 功能**: 完整的 AI 聊天功能
- ✅ **主题系统**: 宇宙暗黑主题
- ✅ **部署就绪**: 生产环境配置

---

*最后更新: 2025-01-03*
