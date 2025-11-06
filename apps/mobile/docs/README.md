# 📱 Mobile 应用文档中心

欢迎来到 AI-Code Mobile 应用的文档中心！这里包含了项目的所有技术文档、报告和指南。

## 📚 文档结构

### 🏗️ 架构文档
- [SSR 实现指南](./SSR_IMPLEMENTATION_GUIDE.md) - 服务端渲染实现详解
- [SSR 架构深度解析](./SSR_ARCHITECTURE_DEEP_DIVE.md) - SSR 架构设计原理
- [SSR vs Next.js 对比分析](./SSR_VS_NEXTJS_COMPARISON.md) - 技术选型对比
- [SSR 性能优化指南](./SSR_PERFORMANCE_OPTIMIZATION.md) - 性能优化最佳实践

### 📊 项目报告
- [测试完成总结](./reports/MOBILE_TEST_SUMMARY.md) - 测试基础设施和结果
- [Tailwind CSS 检查报告](./reports/TAILWIND_CHECK_REPORT.md) - Tailwind CSS 配置检查
- [配置清理报告](./reports/CLEANUP_REPORT.md) - 项目配置优化清理

### 🚀 快速开始
- [项目概览](./DOCUMENTATION_INDEX.md) - 项目整体介绍和快速导航

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 4 + Tailwind CSS v4
- **状态管理**: Zustand
- **路由**: React Router v6
- **测试**: Vitest + Testing Library
- **服务端渲染**: 自定义 SSR 实现

## 📁 项目结构

```
mobile/
├── docs/                    # 📚 文档中心
│   ├── reports/            # 📊 项目报告
│   ├── guides/             # 📖 技术指南
│   └── README.md           # 📋 文档索引
├── src/                    # 💻 源代码
│   ├── components/         # 🧩 React 组件
│   ├── pages/             # 📄 页面组件
│   ├── store/             # 🗄️ 状态管理
│   ├── utils/             # 🔧 工具函数
│   └── types/             # 📝 类型定义
├── server/                 # 🖥️ 服务端代码
├── public/                 # 🌐 静态资源
└── test-results/           # 🧪 测试结果
```

## 🎯 开发指南

### 启动开发服务器
```bash
pnpm dev
```

### 运行测试
```bash
pnpm test
```

### 构建生产版本
```bash
pnpm build
```

### 构建原生版本
```bash
pnpm build:native
```

## 📈 项目状态

- ✅ **Tailwind CSS v4**: 已升级到最新版本
- ✅ **测试覆盖**: 完整的测试基础设施
- ✅ **SSR 支持**: 自定义服务端渲染实现
- ✅ **性能优化**: 构建和运行时性能优化
- ✅ **文档完善**: 完整的技术文档

## 🔗 相关链接

- [项目根目录 README](../README.md)
- [Vite 配置](../vite.config.ts)
- [Tailwind 配置](../tailwind.config.ts)
- [测试配置](../vitest.config.ts)

---

*最后更新: 2025-01-03*
*维护者: AI Assistant*