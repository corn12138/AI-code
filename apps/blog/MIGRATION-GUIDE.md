# Blog 项目全栈迁移指南

## 🎯 迁移目标
将当前的 blog 项目从调用外部 server 接口改为 Next.js 内部全栈实现。

## ✅ 已完成的步骤

### 1. 数据库设置
- ✅ 安装了 Prisma ORM
- ✅ 创建了完整的数据库模型
- ✅ 设置了 Prisma 客户端
- ✅ 创建了类型定义文件
- ✅ 创建了认证工具函数

### 2. 安装的依赖包
```bash
# 已安装的包
pnpm add prisma @prisma/client bcryptjs jsonwebtoken pg
pnpm add -D @types/bcryptjs @types/jsonwebtoken @types/pg
```

## 🔧 配置步骤

### 1. 环境变量配置
请创建 `.env.local` 文件并添加以下配置：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db?schema=public"

# 如果使用现有的 server 数据库
# DATABASE_URL="postgresql://app_user:password@localhost:6543/blogdb?schema=public"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# 安全配置
BCRYPT_SALT_ROUNDS="12"

# 文件上传配置
UPLOAD_MAX_SIZE="10485760"
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/gif,image/webp"

# 过渡期配置
SERVER_URL="http://localhost:3001"
```

### 2. 数据库迁移
```bash
# 生成 Prisma 客户端
npx prisma generate

# 如果是新数据库
npx prisma db push

# 如果要从现有数据库迁移
npx prisma db pull
npx prisma generate
```

## 📁 项目结构
```
apps/blog/
├── src/
│   ├── lib/
│   │   ├── prisma.ts        # Prisma 客户端
│   │   ├── auth.ts          # 认证工具
│   │   └── types.ts         # 类型定义
│   ├── app/
│   │   ├── api/             # API Routes
│   │   │   ├── auth/        # 认证 API
│   │   │   ├── articles/    # 文章 API
│   │   │   ├── tags/        # 标签 API
│   │   │   └── comments/    # 评论 API
│   │   └── ...
│   └── ...
├── prisma/
│   └── schema.prisma        # 数据库模型
└── ...
```

## 🚀 接下来的步骤

### 第3步：实现认证系统
- 创建 JWT 中间件
- 实现 `/api/auth/login` 
- 实现 `/api/auth/register`
- 实现 `/api/auth/refresh`

### 第4步：实现文章 API
- 创建 `/api/articles` (GET, POST)
- 创建 `/api/articles/[id]` (GET, PUT, DELETE)
- 实现搜索和分页功能

### 第5步：实现标签 API
- 创建 `/api/tags` (GET, POST)
- 创建 `/api/tags/[id]` (GET, PUT, DELETE)

### 第6步：实现评论 API
- 创建 `/api/comments` (GET, POST)
- 创建 `/api/comments/[id]` (GET, PUT, DELETE)

### 第7步：实现文件上传
- 创建 `/api/uploads/images`
- 配置文件存储

### 第8步：更新前端代码
- 修改 `api.ts` 和 `api-services.ts`
- 更新所有组件的 API 调用

### 第9步：数据迁移
- 从现有数据库迁移数据
- 验证数据完整性

### 第10步：测试和部署
- 全面测试所有功能
- 停用 NestJS 服务器
- 部署 Next.js 全栈应用

## 📊 数据库模型概述

### 主要模型
- **User**: 用户表
- **Article**: 文章表
- **Tag**: 标签表
- **Category**: 分类表
- **Comment**: 评论表
- **LowcodePage**: 低代码页面表

### 关系
- User 1:N Article (一个用户可以有多篇文章)
- Article N:N Tag (文章和标签多对多关系)
- Article N:1 Category (文章属于一个分类)
- Article 1:N Comment (一篇文章可以有多个评论)
- Comment 1:N Comment (评论可以有回复)

## 🔍 验证配置

运行以下命令验证设置是否正确：

```bash
# 验证 Prisma 配置
npx prisma validate

# 生成客户端
npx prisma generate

# 查看数据库状态
npx prisma migrate status
```

## 🆘 常见问题

### Q: 数据库连接失败
A: 请检查 DATABASE_URL 配置是否正确，确保数据库服务正在运行。

### Q: Prisma 生成失败
A: 请确保 schema.prisma 文件语法正确，运行 `npx prisma validate` 检查。

### Q: 类型错误
A: 重新运行 `npx prisma generate` 生成最新的类型定义。

## 📝 下一步行动

1. 配置环境变量
2. 运行数据库迁移
3. 开始实现认证 API

准备好继续下一步了吗？ 