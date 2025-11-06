# Next.js 全栈迁移指南

## 概述

本文档详细记录了从 **NestJS + Next.js** 分离架构迁移到 **Next.js 全栈应用** 的完整过程，包括遇到的问题、解决方案和最终成果。

### 迁移背景

- **迁移前架构**: Next.js (3000端口) + NestJS (3001端口)
- **迁移后架构**: Next.js 全栈应用 (3000端口，内置API)
- **迁移目标**: 简化架构，提高开发效率，减少部署复杂性

### 技术栈变化

| 组件 | 迁移前 | 迁移后 |
|------|--------|--------|
| 前端 | Next.js 14.2.30 | Next.js 14.2.30 |
| 后端 | NestJS + TypeORM | Next.js API Routes |
| 数据库 | PostgreSQL (华为云) | PostgreSQL (华为云) |
| ORM | TypeORM | Prisma |
| 认证 | NestJS Guards + JWT | Next.js Middleware + JWT |
| 端口 | 3000 (前端) + 3001 (后端) | 3000 (全栈) |

## 详细迁移步骤

### 第一阶段：数据库和ORM迁移 (✅ 完成)

#### 1.1 安装 Prisma
```bash
pnpm add prisma @prisma/client bcryptjs jsonwebtoken pg
pnpm add -D @types/bcryptjs @types/jsonwebtoken @types/pg
```

#### 1.2 创建 Prisma Schema
创建 `prisma/schema.prisma` 文件，定义数据模型：

```prisma
// 主要数据模型
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  fullName    String?
  bio         String?
  avatar      String?
  roles       String[] @default(["user"])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 关联关系
  articles     Article[]
  comments     Comment[]
  lowcodePages LowcodePage[]
  
  @@map("users")
}

model Article {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String
  summary       String?
  published     Boolean   @default(false)
  featuredImage String?
  viewCount     Int       @default(0)
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // 关联关系
  authorId   String
  author     User       @relation(fields: [authorId], references: [id])
  categoryId String?
  category   Category?  @relation(fields: [categoryId], references: [id])
  tags       Tag[]
  comments   Comment[]
  
  @@map("articles")
}

// 其他模型...
```

#### 1.3 配置数据库连接
创建 `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### 1.4 环境变量配置
创建 `.env.local` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://app_user:your_password@localhost:6543/blogdb?schema=public"

# JWT 密钥
JWT_SECRET="c1bfb20a5e1da3b8c8e03479a000c5febee75ae75bf69b888d0977519e0b9261"
NEXTAUTH_SECRET="58b713de7a0d94acd77d2c3856928c1ede0b4d7f95b6c92cdd6fb92c02aac1d2"

# CSRF 保护
CSRF_SECRET="b5f0899af04237b9b777ce4a30b641c2"

# 应用配置
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 第二阶段：认证系统迁移 (✅ 完成)

#### 2.1 创建认证工具库
创建 `src/lib/auth.ts`:

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, roles: string[]): string {
  return jwt.sign(
    { userId, roles },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
```

#### 2.2 创建API认证中间件
创建 `src/lib/api-auth.ts`:

```typescript
import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export async function getCurrentUser(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        roles: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireRole(request: NextRequest, requiredRole: string) {
  const user = await requireAuth(request);
  
  if (!user.roles.includes(requiredRole) && !user.roles.includes('admin')) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}
```

#### 2.3 创建 Next.js 中间件
创建 `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护的API路由
  const protectedApiRoutes = [
    '/api/articles',
    '/api/comments',
    '/api/uploads',
    '/api/user/profile'
  ];

  // 检查是否需要认证
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 第三阶段：API路由实现 (✅ 完成)

#### 3.1 认证API实现

**登录API** (`src/app/api/auth/login/route.ts`):
```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { createApiResponse, handleApiError, validateMethod, parseRequestBody } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    validateMethod(request, ['POST']);
    
    const { email, password } = await parseRequestBody<{
      email: string;
      password: string;
    }>(request);

    if (!email || !password) {
      return createApiResponse({ error: 'Email and password are required' }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !await verifyPassword(password, user.password)) {
      return createApiResponse({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user.id, user.roles);

    return createApiResponse({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        roles: user.roles
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
```

**注册API** (`src/app/api/auth/register/route.ts`):
```typescript
// 类似的实现模式，包含用户创建逻辑
```

#### 3.2 文章管理API实现

**文章列表和创建** (`src/app/api/articles/route.ts`):
```typescript
// GET - 获取文章列表（支持分页、搜索、过滤）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    
    // 构建查询条件
    const where: any = { published: true };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tag) {
      where.tags = {
        some: {
          OR: [
            { name: tag },
            { slug: tag }
          ]
        }
      };
    }
    
    // 执行查询
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, fullName: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.article.count({ where })
    ]);
    
    return createApiResponse({
      articles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - 创建文章
export async function POST(request: NextRequest) {
  // 实现文章创建逻辑
}
```

#### 3.3 其他API实现

完成了以下API的实现：

- **用户管理**: `/api/user/profile`, `/api/user/[id]`
- **标签管理**: `/api/tags`, `/api/tags/[id]`, `/api/tags/[id]/articles`
- **评论系统**: `/api/comments`, `/api/comments/[id]`, `/api/articles/[id]/comments`
- **文件上传**: `/api/uploads/images`
- **分类管理**: `/api/categories`
- **健康检查**: `/api/health`

### 第四阶段：问题排查和解决 (✅ 完成)

## 遇到的问题和解决方案

### 问题1: 数据库连接失败

**问题描述**: 
```
Invalid `prisma.user.findUnique()` invocation:
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "28P01", message: "password authentication failed for user \"app_user\"", severity: "FATAL", detail: None, column: None, hint: None }) })
```

**解决方案**:
1. 检查数据库连接字符串中的用户名和密码
2. 确认SSH隧道正常运行 (端口6543)
3. 验证PostgreSQL用户权限

**修复命令**:
```bash
# 检查SSH隧道
ssh -L 6543:localhost:5432 user@your-server

# 测试数据库连接
psql -h localhost -p 6543 -U app_user -d blogdb
```

### 问题2: Next.js 路由冲突

**问题描述**:
```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'name').
```

**问题原因**: 存在冲突的动态路由结构：
- `/api/tags/[name]/articles/route.ts` 
- `/api/tags/[id]/route.ts`

**解决方案**:
1. 删除冲突的 `/api/tags/[name]/articles/route.ts` 路由
2. 重新组织路由结构为：
   - `/api/tags/[id]/route.ts` (支持 ID/name/slug 访问)
   - `/api/tags/[id]/articles/route.ts` (支持 ID/name/slug 访问)
3. 修改API逻辑以支持多种参数类型：

```typescript
// 支持通过 ID、name 或 slug 查找标签
const tag = await prisma.tag.findFirst({
  where: {
    OR: [
      { id: id },
      { name: id },
      { slug: id }
    ]
  }
});
```

### 问题3: 标签页面数据格式错误

**问题描述**: 
标签页面显示"数据格式错误"，无法正常加载标签数据。

**问题原因**: 
前端代码期望API返回 `{ data: [...] }` 格式，但实际API返回的是 `{ tags: [...] }` 格式。

**解决方案**:
修改前端代码中的数据读取逻辑：

```typescript
// 修复前
if (Array.isArray(data.data)) {
    setTags(data.data);
}

// 修复后
if (Array.isArray(data.tags)) {
    setTags(data.tags);
}
```

### 问题4: 缺少测试数据

**问题描述**: 
API正常但页面显示为空，因为数据库中没有测试数据。

**解决方案**:
创建测试数据脚本：

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestData() {
  const tags = [
    { name: 'JavaScript', slug: 'javascript', description: 'JavaScript编程语言相关内容', color: '#f7df1e' },
    { name: 'React', slug: 'react', description: 'React前端框架相关内容', color: '#61dafb' },
    { name: 'Node.js', slug: 'nodejs', description: 'Node.js后端开发相关内容', color: '#339933' },
    { name: 'TypeScript', slug: 'typescript', description: 'TypeScript类型化编程语言', color: '#3178c6' },
    { name: 'Next.js', slug: 'nextjs', description: 'Next.js全栈框架相关内容', color: '#000000' }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: tag,
      create: tag
    });
  }
}

addTestData();
```

## 迁移成果

### 技术成果

✅ **完成的功能**:
- 完整的用户认证系统 (JWT + bcrypt)
- 文章管理系统 (CRUD + 分页 + 搜索)
- 标签管理系统 (CRUD + 文章关联)
- 评论系统 (嵌套评论 + 时间限制)
- 文件上传系统 (图片上传 + 验证)
- 分类管理系统
- 健康检查API
- 角色权限控制 (user/editor/admin)

✅ **API端点统计**:
- 认证相关: 3个 (`/api/auth/*`)
- 用户管理: 2个 (`/api/user/*`)
- 文章管理: 2个 (`/api/articles/*`)
- 标签管理: 3个 (`/api/tags/*`)
- 评论管理: 3个 (`/api/comments/*`)
- 其他功能: 3个 (`/api/uploads/*`, `/api/categories/*`, `/api/health`)

**总计**: 16个API端点

### 性能优化

✅ **实现的优化**:
- 数据库查询优化 (使用 Prisma 查询优化)
- 分页查询减少内存使用
- 选择性字段查询减少数据传输
- JWT Token 缓存和验证优化
- 错误处理和日志记录

### 代码质量

✅ **代码规范**:
- TypeScript 类型安全
- 统一的错误处理机制
- 一致的API响应格式
- 完善的参数验证
- 安全的认证和授权

## 部署指南

### 环境要求

- Node.js 18+
- PostgreSQL 12+
- pnpm 8+

### 部署步骤

1. **环境变量配置**:
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 文件，设置正确的环境变量
   ```

2. **数据库迁移**:
   ```bash
   npx prisma db push
   npx prisma db seed  # 如果有种子数据
   ```

3. **安装依赖**:
   ```bash
   pnpm install
   ```

4. **启动应用**:
   ```bash
   pnpm run dev      # 开发模式
   pnpm run build    # 构建生产版本
   pnpm run start    # 启动生产服务
   ```

5. **健康检查**:
   ```bash
   curl http://localhost:3000/api/health
   ```

## 经验总结

### 成功经验

1. **渐进式迁移**: 先迁移数据层，再迁移API层，最后调整前端
2. **充分测试**: 每个API都通过curl和前端双重验证
3. **错误处理**: 统一的错误处理机制大大减少了调试时间
4. **文档记录**: 详细记录每个问题和解决方案

### 遇到的挑战

1. **路由设计**: Next.js动态路由有一些限制需要注意
2. **类型安全**: 需要在前后端保持一致的类型定义
3. **认证机制**: 从NestJS Guards迁移到Next.js中间件需要适应
4. **数据库迁移**: 从TypeORM到Prisma的语法差异

### 改进建议

1. **添加单元测试**: 目前缺少自动化测试
2. **API文档**: 可以添加Swagger或类似的API文档
3. **缓存机制**: 可以添加Redis缓存提高性能
4. **监控告警**: 生产环境需要添加监控和日志

## 总结

本次迁移成功实现了从分离架构到全栈架构的转变，主要优势包括：

- **架构简化**: 从双服务器架构简化为单服务器架构
- **开发效率**: 统一的开发栈，减少上下文切换
- **部署简化**: 只需部署一个应用，降低运维复杂度
- **性能提升**: 减少网络请求，提高响应速度

整个迁移过程证明了Next.js作为全栈框架的可行性和优势，为后续的功能开发奠定了良好的基础。

---

*文档更新时间: 2025-01-13*  
*迁移状态: ✅ 完成* 