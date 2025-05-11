# 博客模块

## 功能概述

博客模块使用 Next.js 开发，提供类似掘金的阅读与创作体验。

### 主要功能

- **首页**: 展示文章列表，支持分类、标签筛选和搜索
- **详情页**: 展示文章全文，支持评论互动
- **创作中心**: 提供Markdown编辑器，支持图片上传、实时预览和草稿自动保存
- **用户中心**: 管理个人文章、收藏和关注

## 路由设计

- `/` - 首页（公开访问）
- `/article/:id` - 文章详情页（需登录查看全文）
- `/editor` - 创作中心（需登录）
- `/editor/:id` - 编辑现有文章（需登录+权限）
- `/user/:id` - 用户主页
- `/tags/:tag` - 标签页
- `/search` - 搜索结果页

## 技术实现

- **SSG & ISR**: 利用Next.js的Static Generation和Incremental Static Regeneration优化性能
- **认证**: 与共享的Auth模块集成，实现JWT认证
- **SEO**: 使用结构化数据、动态meta标签、sitemap.xml提升SEO表现
- **组件**: 复用shared/ui库中的UI组件

## API接口

博客前端调用以下后端接口：

- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取单篇文章
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `GET /api/tags` - 获取标签列表
- `POST /api/comments` - 发表评论
