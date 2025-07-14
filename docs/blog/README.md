# 博客模块文档

## 概述

本目录包含了博客模块的完整文档，包括使用指南、功能介绍、迁移记录和问题排查等。

## 📚 文档目录

### 核心文档
- [**README.md**](./README.md) - 本文档，博客模块概述
- [**使用指南**](./usage-guide.md) - 博客功能使用指南
- [**Markdown 功能**](./markdown-features.md) - 博客支持的 Markdown 功能
- [**主题定制**](./theming.md) - 博客主题和样式定制

### 迁移相关 🚀
- [**Next.js 全栈迁移指南**](./nextjs-fullstack-migration-guide.md) - 完整的迁移过程记录
- [**迁移问题排查手册**](./migration-troubleshooting.md) - 迁移过程中遇到的问题和解决方案

### 架构技术 🎯
- [**Next.js 全栈架构详解**](./nextjs-fullstack-architecture.md) - 后端逻辑实现和前后端交互机制

## 🏗️ 架构变化

### 迁移前后对比

| 项目 | 迁移前 | 迁移后 |
|------|--------|--------|
| **架构** | Next.js (前端) + NestJS (后端) | Next.js 全栈应用 |
| **端口** | 3000 (前端) + 3001 (后端) | 3000 (全栈) |
| **数据库** | TypeORM + PostgreSQL | Prisma + PostgreSQL |
| **认证** | NestJS Guards | Next.js Middleware |
| **API** | RESTful API (NestJS) | Next.js API Routes |

### 技术栈
- **前端**: Next.js 14.2.30, React 18.3.1, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: PostgreSQL (华为云)
- **认证**: JWT + bcrypt
- **部署**: Docker, Nginx

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 12+
- pnpm 8+

### 安装步骤

1. **克隆项目**:
   ```bash
   git clone <repository-url>
   cd AI-code/apps/blog
   ```

2. **安装依赖**:
   ```bash
   pnpm install
   ```

3. **环境配置**:
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 文件，配置数据库连接等
   ```

4. **数据库迁移**:
   ```bash
   npx prisma db push
   ```

5. **启动开发服务器**:
   ```bash
   pnpm run dev
   ```

6. **访问应用**:
   - 博客首页: http://localhost:3000
   - API 健康检查: http://localhost:3000/api/health

## 📖 功能特性

### 已实现功能 ✅
- **用户系统**: 注册、登录、个人资料管理
- **文章管理**: 创建、编辑、删除、发布文章
- **标签系统**: 标签管理和文章分类
- **评论系统**: 嵌套评论和回复
- **搜索功能**: 全文搜索和过滤
- **文件上传**: 图片上传和管理
- **角色权限**: 用户、编辑、管理员权限
- **响应式设计**: 移动端适配

### API 端点
- **认证**: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- **用户**: `/api/user/profile`, `/api/user/[id]`
- **文章**: `/api/articles`, `/api/articles/[id]`
- **标签**: `/api/tags`, `/api/tags/[id]`, `/api/tags/[id]/articles`
- **评论**: `/api/comments`, `/api/comments/[id]`, `/api/articles/[id]/comments`
- **上传**: `/api/uploads/images`
- **其他**: `/api/categories`, `/api/health`

## 🔧 开发指南

### 目录结构
```
apps/blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── (pages)/        # 页面路由
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   ├── lib/               # 工具库
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
├── prisma/                # Prisma 数据库
│   └── schema.prisma      # 数据库模型
├── public/                # 静态资源
└── docs/                  # 文档
```

### 开发命令
```bash
# 开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run type-check

# 代码格式检查
pnpm run lint

# 数据库相关
npx prisma studio          # 数据库可视化工具
npx prisma db push         # 推送数据库模式
npx prisma generate        # 生成 Prisma 客户端
```

## 🐛 问题排查

如果遇到问题，请参考：
1. [**迁移问题排查手册**](./migration-troubleshooting.md) - 详细的问题解决方案
2. [**迁移指南**](./nextjs-fullstack-migration-guide.md) - 完整的迁移过程

### 常见问题

#### 数据库连接失败
```bash
# 检查 SSH 隧道
ssh -L 6543:localhost:5432 user@your-server

# 测试连接
curl -s http://localhost:3000/api/health | jq .
```

#### 路由冲突
确保动态路由参数名称一致，避免在同一层级使用不同参数名。

#### 环境变量未加载
检查 `.env.local` 文件位置和变量名称，重启开发服务器。

## 📊 性能优化

### 已实现的优化
- **数据库查询优化**: 使用 Prisma 查询优化
- **分页查询**: 减少内存使用
- **选择性字段查询**: 减少数据传输
- **JWT 缓存**: 认证性能优化

### 建议的优化
- **Redis 缓存**: 添加缓存层
- **CDN**: 静态资源加速
- **图片优化**: 压缩和懒加载
- **代码分割**: 按需加载组件

## 🚢 部署指南

### Docker 部署
```bash
# 构建镜像
docker build -t blog-app .

# 运行容器
docker run -p 3000:3000 blog-app
```

### 生产环境配置
- 设置正确的环境变量
- 配置数据库连接池
- 启用 HTTPS
- 配置反向代理 (Nginx)

## 📈 监控和日志

### 健康检查
```bash
curl -s http://localhost:3000/api/health
```

### 日志配置
```typescript
// 启用 Prisma 查询日志
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## 🤝 贡献指南

1. **Fork 项目**
2. **创建功能分支**: `git checkout -b feature/new-feature`
3. **提交更改**: `git commit -m 'Add new feature'`
4. **推送到分支**: `git push origin feature/new-feature`
5. **创建 Pull Request**

## 📝 更新日志

### v2.0.0 - 2025-01-13
- ✅ 完成 Next.js 全栈迁移
- ✅ 实现 Prisma 数据库集成
- ✅ 添加 JWT 认证系统
- ✅ 重构 API 路由结构
- ✅ 修复路由冲突问题
- ✅ 优化数据格式处理

### v1.0.0 - 2024-12-01
- ✅ 初始版本 (NestJS + Next.js)
- ✅ 基础博客功能
- ✅ 用户认证系统
- ✅ 文章管理功能

## 📞 支持

如果需要帮助或有问题，请：
1. 查看 [问题排查手册](./migration-troubleshooting.md)
2. 查看 [迁移指南](./nextjs-fullstack-migration-guide.md)
3. 创建 GitHub Issue
4. 联系开发团队

---

*最后更新: 2025-01-13*  
*维护状态: 活跃维护中* 🚀
