# 博客与低代码平台项目文档

这是一个全栈应用项目，包含博客系统和低代码开发平台两个主要子应用，以及一个公共服务器端应用。

## 项目结构

项目采用Monorepo结构，包含以下应用：

- `apps/server`: NestJS后端服务，为博客和低代码平台提供API支持
- `apps/blog`: Next.js实现的博客前端应用
- `apps/lowcode`: React实现的低代码开发平台应用

## 技术栈

- **后端**: NestJS, TypeScript, PostgreSQL
- **前端**: React, Next.js, TypeScript, Tailwind CSS
- **状态管理**: Zustand
- **API文档**: Swagger
- **安全措施**: 
  - XSS防护
  - CSRF保护
  - 安全HTTP头部
  - 内容安全策略(CSP)

## 文档导航

- [服务器应用文档](./server/README.md) - 后端API和服务实现
- [博客应用文档](./blog/README.md) - 博客系统功能和实现
- [低代码平台文档](./lowcode/README.md) - 低代码平台功能和实现
- [安全最佳实践](./security.md) - 项目安全措施和最佳实践

## 开发人员指南

- [开发环境设置](./setup.md)
- [代码规范](./code-standards.md)
- [贡献指南](./contributing.md)
