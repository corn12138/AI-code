# 博客与低代码平台项目文档

这是一个全栈应用项目，包含博客系统和低代码开发平台两个主要子应用，以及一个公共服务器端应用。

## 项目目标

- **提供现代化博客体验**: 打造一个功能丰富、高性能、易于使用的博客平台，支持Markdown编辑、分类标签、评论互动和良好的SEO。
- **实现可视化低代码构建**: 开发一个低代码平台，允许用户通过拖拽组件快速构建和发布页面，支持离线编辑和数据同步。
- **模块化与可扩展性**: 构建一个结构清晰、模块化的系统，易于维护、扩展新功能和集成第三方服务。
- **安全性与稳定性**: 确保应用的安全性和稳定性，采用行业最佳实践进行开发和部署。
- **提升开发效率**: 通过Monorepo结构、统一的代码规范和工具链，提高团队协作和开发效率。

## 项目结构

项目采用Monorepo结构，包含以下应用：

- `apps/server`: NestJS后端服务，为博客和低代码平台提供API支持
- `apps/blog`: Next.js实现的博客前端应用
- `apps/lowcode`: React实现的低代码开发平台应用，支持离线编辑功能
- `shared/hooks`: 通用React Hooks库 (**已发布到NPM**: [`@corn12138/hooks`](https://www.npmjs.com/package/@corn12138/hooks))

## 技术栈

- **后端**: NestJS, TypeScript, PostgreSQL
- **前端**: React, Next.js, TypeScript, Tailwind CSS
- **状态管理**: Zustand
- **API文档**: Swagger
- **离线支持**: Service Worker, IndexedDB
- **安全措施**: 
  - XSS防护
  - CSRF保护
  - 安全HTTP头部
  - 内容安全策略(CSP)
  - 输入净化

## 核心功能

- **博客系统**：
  - Markdown文章编辑与发布
  - 评论互动
  - 标签管理
  
- **低代码平台**：
  - 可视化页面构建
  - 组件库与属性编辑
  - 离线编辑与自动同步
  - 页面发布与预览

## 文档导航

- **概览与设置**
  - [开发环境设置](./setup.md) - 如何配置和运行项目。
  - [代码规范](./code-standards.md) - 项目遵循的编码标准。
  - [贡献指南](./contributing.md) - 如何参与项目贡献。
- **核心模块详解**
  - [服务器应用文档](./server/README.md) - 后端API和服务实现细节。
  - [博客应用文档](./blog/README.md) - 博客系统功能和前端实现。
  - [低代码平台文档](./lowcode/README.md) - 低代码平台功能和前端实现。
- **专题文档**
  - [安全最佳实践](./security.md) - 项目实施的安全措施。
  - [离线功能实现](./offline-features.md) - Service Worker与离线功能详解。
  - [华为云数据库创建指南](./modules/华为云数据库创建.md) - 在华为云上部署PostgreSQL的教程。
- **Hooks独立化文档** 🎉 **已成功发布**: [`@corn12138/hooks`](https://www.npmjs.com/package/@corn12138/hooks)
  - [📦 NPM发包完整流程总结](./npm-publishing-complete-guide.md) - **最详细**的发包流程记录，包含所有问题和解决方案。
  - [📋 Hooks项目总结](./hooks-project-summary.md) - 完整项目成果、技术架构和未来规划总结。
  - [📚 Hooks独立化指南](./hooks-independence-guide.md) - Hooks提取和Dumi文档化完整流程。
  - [🔧 Hooks独立化实现总结](./hooks-independence-implementation.md) - 技术实现细节和项目集成情况。
  - [🚨 Hooks迁移问题与解决方案](./hooks-migration-issues-solutions.md) - 迁移过程中遇到的问题和解决方案。
  - [🔍 Hooks问题快速索引](./hooks-troubleshooting-index.md) - 快速定位和解决hooks相关问题的索引。
- **详细模块文档**
  - [服务端模块细化](./modules/server.md)
  - [博客模块细化](./modules/blog.md)
  - [低代码模块细化](./modules/lowcode.md)

## 快速链接

- [后端API文档 (Swagger)](http://localhost:3001/api/docs) - (服务启动后访问)
- [GitHub仓库](https://github.com/yourusername/AI-code) - (请替换为实际链接)
- [NPM包: @corn12138/hooks](https://www.npmjs.com/package/@corn12138/hooks) - 已发布的通用React Hooks库
- [Hooks文档站点](https://corn12138.github.io/ai-code-hooks) - 在线Hooks使用文档

## 开发人员指南

- [开发环境设置](./setup.md)
- [代码规范](./code-standards.md)
- [贡献指南](./contributing.md)
