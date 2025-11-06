# 📚 Blog 项目文档中心

欢迎来到 AI-Code Blog 项目的文档中心！这里包含了项目的所有技术文档、报告和指南。

## 📋 文档结构

### 📊 项目报告
- [项目完成报告](./reports/PROJECT_COMPLETION_REPORT.md) - 项目整体完成情况
- [测试完成报告](./reports/TESTING_COMPLETION_REPORT.md) - 测试基础设施完成情况
- [测试总结报告](./reports/TESTING_SUMMARY.md) - 测试执行结果总结
- [待办事项列表](./reports/TODO_LIST.md) - 项目待办事项
- [重构完成报告](./reports/REFACTOR_COMPLETION_REPORT.md) - 项目重构完成情况

### 📖 技术指南
- [宇宙主题指南](./guides/COSMIC_THEME_GUIDE.md) - 宇宙暗黑主题设计指南

### 🏗️ 架构文档
- [AI 分析设计](./architecture/AI-ANALYTICS-DESIGN.md) - AI 分析功能设计
- [AI 分析实现总结](./architecture/AI-ANALYTICS-IMPLEMENTATION-SUMMARY.md) - AI 分析实现详情

### 🚀 部署文档
- [Docker 部署指南](./deployment/DOCKER-GUIDE.md) - Docker 容器化部署
- [生产环境部署指南](./deployment/PRODUCTION-DEPLOYMENT-GUIDE.md) - 生产环境部署

### 🛠️ 开发文档
- [组件审计指南](./development/COMPONENT_AUDIT_GUIDE.md) - 组件质量审计
- [重构总结](./development/REFACTOR_SUMMARY.md) - 代码重构总结
- [Toast 实现总结](./development/TOAST-IMPLEMENTATION-SUMMARY.md) - Toast 通知实现

### ⚙️ 设置指南
- [AI 聊天设置](./setup/AI-CHAT-SETUP.md) - AI 聊天功能设置
- [邮件设置](./setup/EMAIL-SETUP.md) - 邮件服务配置
- [环境变量设置](./setup/ENV-SETUP.md) - 环境变量配置
- [独立设置](./setup/STANDALONE-SETUP.md) - 独立运行设置

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **样式系统**: Tailwind CSS v4 + 宇宙主题
- **状态管理**: Zustand + React Query
- **数据库**: Prisma + PostgreSQL
- **测试**: Vitest + Testing Library
- **部署**: Docker + Vercel

## 📁 项目结构

```
blog/
├── docs/                    # 📚 文档中心
│   ├── reports/            # 📊 项目报告
│   ├── guides/             # 📖 技术指南
│   ├── architecture/        # 🏗️ 架构文档
│   ├── deployment/          # 🚀 部署文档
│   ├── development/         # 🛠️ 开发文档
│   └── setup/              # ⚙️ 设置指南
├── src/                    # 💻 源代码
│   ├── app/                # 📄 Next.js 应用路由
│   ├── components/         # 🧩 React 组件
│   ├── lib/                # 📚 工具库
│   ├── test/               # 🧪 测试文件
│   └── styles/             # 🎨 样式文件
├── prisma/                 # 🗄️ 数据库模式
├── scripts/                # 🔧 脚本工具
└── public/                 # 🌐 静态资源
```

## 🎯 快速开始

### 开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test
```

### 数据库设置
```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库模式
pnpm db:push

# 填充测试数据
pnpm db:seed
```

### 构建部署
```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📈 项目状态

- ✅ **重构完成**: 项目结构已优化，无重复文件
- ✅ **文档完善**: 所有文档集中在 `docs/` 目录
- ✅ **测试覆盖**: 完整的测试基础设施
- ✅ **主题系统**: 宇宙暗黑主题完整实现
- ✅ **AI 功能**: AI 聊天和分析功能完整
- ✅ **部署就绪**: Docker 和生产环境部署配置

## 🔗 相关链接

- [项目根目录 README](../README.md)
- [Next.js 配置](../next.config.js)
- [Tailwind 配置](../tailwind.config.ts)
- [测试配置](../vitest.config.ts)
- [Prisma 模式](../prisma/schema.prisma)

## 📝 贡献指南

1. 查看相关文档了解项目结构
2. 遵循代码规范和最佳实践
3. 编写测试确保功能正常
4. 更新文档保持同步

---

*最后更新: 2025-01-03*
*维护者: AI Assistant*