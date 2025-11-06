# Next.js 全栈架构详解

## 概述

本文档详细说明了基于 Next.js 的全栈应用架构，包括后端逻辑的实现方式、前后端交互机制，以及具体的代码实现模式。

## 🏗️ 整体架构

### 架构图

```mermaid
graph TB
    Client[客户端浏览器] --> NextJS[Next.js 应用]
    NextJS --> Pages[页面组件]
    NextJS --> API[API Routes]
    NextJS --> Middleware[中间件]
    
    Pages --> ServerComp[服务器组件]
    Pages --> ClientComp[客户端组件]
    
    API --> Auth[认证API]
    API --> Articles[文章API]
    API --> Users[用户API]
    API --> Tags[标签API]
    
    API --> Prisma[Prisma ORM]
    Prisma --> Database[(PostgreSQL)]
    
    Middleware --> JWT[JWT验证]
    Middleware --> CORS[CORS处理]
```

### 技术栈组成

| 层级 | 技术 | 作用 |
|------|------|------|
| **前端渲染** | Next.js 14.2.30 | 服务器端渲染 + 客户端渲染 |
| **客户端** | React 18.3.1 | 用户界面和交互 |
| **后端API** | Next.js API Routes | RESTful API 服务 |
| **数据库ORM** | Prisma 5.x | 数据库操作和类型安全 |
| **数据库** | PostgreSQL | 数据持久化 |
| **认证** | JWT + bcrypt | 用户认证和密码加密 |
| **类型系统** | TypeScript | 全栈类型安全 |

## 🔧 后端逻辑实现

### 1. API Routes 结构

Next.js 使用文件系统路由来创建 API 端点：

```
src/app/api/
├── auth/
│   ├── login/route.ts          # POST /api/auth/login
│   ├── register/route.ts       # POST /api/auth/register
│   └── refresh/route.ts        # POST /api/auth/refresh
├── user/
│   ├── profile/route.ts        # GET/PATCH /api/user/profile
│   └── [id]/route.ts          # GET /api/user/[id]
├── articles/
│   ├── route.ts               # GET/POST /api/articles
│   ├── [id]/route.ts          # GET/PATCH/DELETE /api/articles/[id]
│   └── [id]/comments/route.ts # GET/POST /api/articles/[id]/comments
├── tags/
│   ├── route.ts               # GET/POST /api/tags
│   ├── [id]/route.ts          # GET/PATCH/DELETE /api/tags/[id]
│   └── [id]/articles/route.ts # GET /api/tags/[id]/articles
├── comments/
│   ├── route.ts               # GET/POST /api/comments
│   └── [id]/route.ts          # GET/PATCH/DELETE /api/comments/[id]
├── uploads/
│   └── images/route.ts        # POST /api/uploads/images
├── categories/route.ts        # GET/POST /api/categories
└── health/route.ts           # GET /api/health
```

### 2. API Route 实现模式

#### 基础结构

每个 API Route 文件都导出 HTTP 方法对应的函数：

```typescript
// src/app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createApiResponse, 
  handleApiError, 
  validateMethod, 
  getCurrentUser 
} from '@/lib/api-auth';

// GET /api/articles - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    // 1. 验证请求方法
    validateMethod(request, ['GET']);
    
    // 2. 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    
    // 3. 构建数据库查询条件
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
    
    // 4. 执行数据库查询
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { 
            select: { 
              id: true, 
              username: true, 
              fullName: true, 
              avatar: true 
            } 
          },
          category: { 
            select: { 
              id: true, 
              name: true, 
              slug: true 
            } 
          },
          tags: { 
            select: { 
              id: true, 
              name: true, 
              slug: true, 
              color: true 
            } 
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.article.count({ where })
    ]);
    
    // 5. 返回标准化响应
    return createApiResponse({
      articles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/articles - 创建文章
export async function POST(request: NextRequest) {
  try {
    validateMethod(request, ['POST']);
    
    // 1. 认证检查
    const user = await requireAuth(request);
    
    // 2. 解析请求体
    const body = await parseRequestBody<{
      title: string;
      content: string;
      summary?: string;
      published?: boolean;
      categoryId?: string;
      tagIds?: string[];
    }>(request);
    
    // 3. 数据验证
    if (!body.title || body.title.length < 5) {
      return createApiResponse(
        { error: 'Title must be at least 5 characters' }, 
        400
      );
    }
    
    if (!body.content || body.content.length < 50) {
      return createApiResponse(
        { error: 'Content must be at least 50 characters' }, 
        400
      );
    }
    
    // 4. 生成唯一 slug
    let slug = body.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    let slugCounter = 0;
    let uniqueSlug = slug;
    
    while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
      slugCounter++;
      uniqueSlug = `${slug}-${slugCounter}`;
    }
    
    // 5. 创建文章
    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: uniqueSlug,
        content: body.content,
        summary: body.summary,
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
        authorId: user.id,
        categoryId: body.categoryId,
        tags: body.tagIds ? {
          connect: body.tagIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        author: { 
          select: { 
            id: true, 
            username: true, 
            fullName: true 
          } 
        },
        category: true,
        tags: true
      }
    });
    
    // 6. 返回创建结果
    return createApiResponse({
      message: 'Article created successfully',
      article
    }, 201);
    
  } catch (error) {
    return handleApiError(error);
  }
}

// 处理 CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### 3. 认证和授权系统

#### JWT 认证实现

```typescript
// src/lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 密码验证
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 生成 JWT Token
export function generateToken(userId: string, roles: string[]): string {
  return jwt.sign(
    { 
      userId, 
      roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天
    },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  );
}

// 验证 JWT Token
export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

// 刷新 Token
export function refreshToken(token: string): string {
  const decoded = verifyToken(token);
  return generateToken(decoded.userId, decoded.roles);
}
```

#### API 认证中间件

```typescript
// src/lib/api-auth.ts
import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { prisma } from './prisma';

// 获取当前用户
export async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
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
    console.error('Token verification failed:', error);
    return null;
  }
}

// 要求认证
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// 要求特定角色
export async function requireRole(request: NextRequest, requiredRole: string) {
  const user = await requireAuth(request);
  
  if (!user.roles.includes(requiredRole) && !user.roles.includes('admin')) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

// 检查资源所有权
export async function checkResourceOwnership(
  request: NextRequest, 
  resourceUserId: string, 
  allowedRoles: string[] = ['admin']
) {
  const user = await requireAuth(request);
  
  // 如果是资源所有者或有特殊权限
  if (user.id === resourceUserId || 
      allowedRoles.some(role => user.roles.includes(role))) {
    return user;
  }
  
  throw new Error('Access denied');
}
```

### 4. 数据库层 (Prisma)

#### Prisma 客户端配置

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

#### 数据模型定义

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  fullName    String?
  bio         String?
  avatar      String?
  password    String
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
  
  // 外键关系
  authorId   String
  author     User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categoryId String?
  category   Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // 多对多关系
  tags     Tag[]
  comments Comment[]
  
  @@map("articles")
}

model Tag {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 多对多关系
  articles Article[]
  
  @@map("tags")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 外键关系
  authorId  String
  author    User    @relation(fields: [authorId], references: [id], onDelete: Cascade)
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  // 自引用关系（嵌套评论）
  parentId String?
  parent   Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies  Comment[] @relation("CommentReplies")
  
  @@map("comments")
}
```

### 5. 中间件系统

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静态资源和 Next.js 内部路径跳过处理
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 需要认证的 API 路由
  const protectedApiRoutes = [
    '/api/articles',
    '/api/comments', 
    '/api/uploads',
    '/api/user/profile'
  ];

  // 需要管理员权限的路由
  const adminRoutes = [
    '/api/tags',
    '/api/categories'
  ];

  // 检查是否是受保护的 API 路由
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyToken(token);
      
      // 检查 token 是否过期
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { error: 'Token expired', code: 'TOKEN_EXPIRED' },
          { status: 401 }
        );
      }
      
      // 将用户信息添加到请求头中，供 API 路由使用
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-roles', JSON.stringify(decoded.roles));
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
  }

  // 检查管理员路由
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }

    try {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded.roles.includes('admin')) {
        return NextResponse.json(
          { error: 'Admin access required', code: 'ADMIN_REQUIRED' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图像优化文件)
     * - favicon.ico (favicon 文件)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## 🖥️ 前端逻辑实现

### 1. 页面组件结构

#### 服务器组件 (Server Component)

```typescript
// src/app/articles/page.tsx
import { Metadata } from 'next';
import { ClientArticlesPage } from '@/components/articles/ClientArticlesPage';
import { fetchArticles, fetchTags } from '@/services/api';

export const metadata: Metadata = {
  title: '技术文章 - TechBlog',
  description: '浏览最新的技术文章和教程',
};

export default async function ArticlesPage() {
  // 服务器端数据预取
  const [initialArticles, tags] = await Promise.all([
    fetchArticles({ page: 1, limit: 10 }),
    fetchTags()
  ]);

  // 将数据传递给客户端组件
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientArticlesPage 
        initialArticles={initialArticles}
        availableTags={tags}
      />
    </div>
  );
}
```

#### 客户端组件 (Client Component)

```typescript
// src/components/articles/ClientArticlesPage.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, Tag } from '@/types';
import { ArticleCard } from './ArticleCard';
import { TagFilter } from './TagFilter';
import { SearchBox } from './SearchBox';
import { Pagination } from './Pagination';
import { useDebounce } from '@/hooks/useDebounce';

interface ClientArticlesPageProps {
  initialArticles: {
    articles: Article[];
    pagination: {
      page: number;
      totalPages: number;
      totalCount: number;
    };
  };
  availableTags: Tag[];
}

export function ClientArticlesPage({ 
  initialArticles, 
  availableTags 
}: ClientArticlesPageProps) {
  // 状态管理
  const [articles, setArticles] = useState(initialArticles.articles);
  const [pagination, setPagination] = useState(initialArticles.pagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选条件
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 防抖搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 获取文章数据
  const fetchArticles = useCallback(async (
    page: number = 1,
    search: string = '',
    tags: string[] = []
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) params.append('search', search);
      if (tags.length > 0) params.append('tags', tags.join(','));
      
      const response = await fetch(`/api/articles?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 监听搜索条件变化
  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1, debouncedSearchTerm, selectedTags);
  }, [debouncedSearchTerm, selectedTags, fetchArticles]);

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page, debouncedSearchTerm, selectedTags);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 处理标签筛选
  const handleTagToggle = (tagSlug: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagSlug)
        ? prev.filter(t => t !== tagSlug)
        : [...prev, tagSlug];
      return newTags;
    });
  };

  return (
    <>
      {/* 搜索和筛选 */}
      <div className="mb-8 space-y-4">
        <SearchBox 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="搜索文章..."
        />
        
        <TagFilter
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2">加载中...</span>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 文章列表 */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article}
                onTagClick={handleTagToggle}
              />
            ))}
          </div>

          {/* 空状态 */}
          {articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无文章</p>
            </div>
          )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </>
  );
}
```

### 2. API 服务层

```typescript
// src/services/api.ts
interface ApiResponse<T> {
  data?: T;
  articles?: T;
  tags?: T;
  user?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    // 从 localStorage 获取 token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // 设置认证 token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  // 获取认证 token
  getToken(): string | null {
    return this.token;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // 处理认证失败
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET 请求
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    
    return this.request<T>(url, { method: 'GET' });
  }

  // POST 请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 请求
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH 请求
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 文件上传
  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // === 具体的 API 方法 ===

  // 认证相关
  async login(email: string, password: string) {
    const response = await this.post<{
      token: string;
      user: any;
      message: string;
    }>('/auth/login', { email, password });
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) {
    return this.post<{
      token: string;
      user: any;
      message: string;
    }>('/auth/register', userData);
  }

  async logout() {
    this.setToken(null);
    // 可以调用后端的 logout 端点来撤销 token
  }

  // 用户相关
  async getCurrentUser() {
    return this.get<{ user: any }>('/user/profile');
  }

  async updateProfile(data: {
    fullName?: string;
    bio?: string;
    avatar?: string;
  }) {
    return this.patch<{ user: any; message: string }>('/user/profile', data);
  }

  // 文章相关
  async getArticles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    category?: string;
    author?: string;
  }) {
    const queryParams: Record<string, string> = {};
    
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.search) queryParams.search = params.search;
    if (params?.tag) queryParams.tag = params.tag;
    if (params?.category) queryParams.category = params.category;
    if (params?.author) queryParams.author = params.author;
    
    return this.get<{
      articles: any[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>('/articles', queryParams);
  }

  async getArticle(id: string) {
    return this.get<{ article: any }>(`/articles/${id}`);
  }

  async createArticle(data: {
    title: string;
    content: string;
    summary?: string;
    published?: boolean;
    categoryId?: string;
    tagIds?: string[];
  }) {
    return this.post<{ article: any; message: string }>('/articles', data);
  }

  async updateArticle(id: string, data: {
    title?: string;
    content?: string;
    summary?: string;
    published?: boolean;
    categoryId?: string;
    tagIds?: string[];
  }) {
    return this.patch<{ article: any; message: string }>(`/articles/${id}`, data);
  }

  async deleteArticle(id: string) {
    return this.delete<{ message: string }>(`/articles/${id}`);
  }

  // 标签相关
  async getTags() {
    return this.get<{ tags: any[] }>('/tags');
  }

  async getTagArticles(tagId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    
    return this.get<{
      tag: any;
      articles: any[];
      pagination: any;
    }>(`/tags/${tagId}/articles`, queryParams);
  }

  // 评论相关
  async getArticleComments(articleId: string) {
    return this.get<{ comments: any[] }>(`/articles/${articleId}/comments`);
  }

  async createComment(articleId: string, data: {
    content: string;
    parentId?: string;
  }) {
    return this.post<{ comment: any; message: string }>(
      `/articles/${articleId}/comments`, 
      data
    );
  }

  async updateComment(commentId: string, data: { content: string }) {
    return this.patch<{ comment: any; message: string }>(
      `/comments/${commentId}`, 
      data
    );
  }

  async deleteComment(commentId: string) {
    return this.delete<{ message: string }>(`/comments/${commentId}`);
  }

  // 文件上传
  async uploadImage(file: File) {
    return this.upload<{
      url: string;
      filename: string;
      message: string;
    }>('/uploads/images', file);
  }
}

// 导出单例实例
export const apiService = new ApiService();

// 导出便捷方法
export const {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getTags,
  getTagArticles,
  getArticleComments,
  createComment,
  updateComment,
  deleteComment,
  uploadImage,
} = apiService;
```

### 3. 状态管理

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/services/api';

interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login(email, password);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiService.logout();
        set({
          user: null,
          token: null,
          error: null,
        });
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const response = await apiService.getCurrentUser();
          set({
            user: response.user,
            isLoading: false,
          });
        } catch (error) {
          // Token 可能已过期
          set({
            user: null,
            token: null,
            isLoading: false,
          });
          apiService.setToken(null);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
```

## 🔄 前后端交互流程

### 1. 用户认证流程

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant API as API Routes
    participant DB as 数据库
    participant Store as 状态管理

    Client->>API: POST /api/auth/login
    Note over Client,API: { email, password }
    
    API->>DB: 查询用户
    DB-->>API: 用户数据
    
    API->>API: 验证密码
    API->>API: 生成 JWT
    
    API-->>Client: { token, user }
    
    Client->>Store: 存储 token 和用户信息
    Store->>Client: 更新 UI 状态
    
    Note over Client: 后续请求携带 token
    Client->>API: GET /api/user/profile
    Note over Client,API: Authorization: Bearer <token>
    
    API->>API: 验证 token
    API->>DB: 查询用户信息
    DB-->>API: 用户数据
    API-->>Client: 用户信息
```

### 2. 文章创建流程

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Middleware as 中间件
    participant API as API Routes
    participant DB as 数据库

    Client->>Middleware: POST /api/articles
    Note over Client,Middleware: Authorization: Bearer <token>
    
    Middleware->>Middleware: 验证 token
    Middleware->>API: 转发请求
    
    API->>API: 解析请求体
    API->>API: 数据验证
    API->>API: 生成唯一 slug
    
    API->>DB: 创建文章记录
    DB-->>API: 文章数据
    
    API-->>Client: { article, message }
    
    Client->>Client: 更新本地状态
    Client->>Client: 跳转到文章页面
```

### 3. 实时搜索流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Input as 搜索框
    participant Hook as useDebounce
    participant API as API Routes
    participant DB as 数据库

    User->>Input: 输入搜索词
    Input->>Hook: 触发防抖
    
    Note over Hook: 等待 500ms
    Hook->>API: GET /api/articles?search=...
    
    API->>DB: 执行搜索查询
    DB-->>API: 匹配的文章
    
    API-->>Hook: { articles, pagination }
    Hook->>Input: 更新搜索结果
    Input->>User: 显示搜索结果
```

## 🛡️ 安全机制

### 1. 认证安全

- **JWT Token**: 使用 HS256 算法签名
- **Token 过期**: 7天自动过期
- **密码加密**: bcrypt 12轮加密
- **Token 刷新**: 支持 token 刷新机制

### 2. 授权控制

- **角色权限**: user/editor/admin 三级权限
- **资源所有权**: 用户只能操作自己的资源
- **API 保护**: 中间件统一验证

### 3. 数据安全

- **输入验证**: 前后端双重验证
- **SQL 注入防护**: Prisma ORM 参数化查询
- **XSS 防护**: DOMPurify 内容净化
- **CORS 配置**: 严格的跨域控制

## 📊 性能优化

### 1. 数据库优化

- **查询优化**: 使用 Prisma 的 include/select
- **分页查询**: 避免大量数据传输
- **索引优化**: 在经常查询的字段上创建索引

### 2. 前端优化

- **防抖搜索**: 减少 API 请求频率
- **虚拟化**: 大列表使用虚拟滚动
- **缓存策略**: React Query 或 SWR
- **代码分割**: 懒加载组件

### 3. 网络优化

- **HTTP/2**: 多路复用
- **压缩**: Gzip/Brotli 压缩
- **CDN**: 静态资源加速
- **缓存**: 适当的缓存策略

## 🔧 开发工具

### 1. 调试工具

```typescript
// 开发环境下的 API 调试
if (process.env.NODE_ENV === 'development') {
  // 启用 Prisma 查询日志
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  // API 响应时间记录
  console.time(`API ${request.method} ${pathname}`);
  const response = await handler(request);
  console.timeEnd(`API ${request.method} ${pathname}`);
}
```

### 2. 类型安全

```typescript
// 自动生成的 Prisma 类型
import type { User, Article, Tag } from '@prisma/client';

// 自定义 API 响应类型
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// 前端组件 Props 类型
export interface ArticleCardProps {
  article: Article & {
    author: Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>;
    tags: Pick<Tag, 'id' | 'name' | 'slug' | 'color'>[];
  };
  onTagClick?: (tagSlug: string) => void;
}
```

## 📈 监控和日志

### 1. API 监控

```typescript
// API 性能监控
export function withMonitoring(handler: Function) {
  return async (request: NextRequest) => {
    const start = Date.now();
    const { pathname, searchParams } = new URL(request.url);
    
    try {
      const response = await handler(request);
      const duration = Date.now() - start;
      
      console.log(`API ${request.method} ${pathname} - ${response.status} - ${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`API ${request.method} ${pathname} - ERROR - ${duration}ms`, error);
      throw error;
    }
  };
}
```

### 2. 错误处理

```typescript
// 统一错误处理
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // 数据库错误
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists', code: 'DUPLICATE_ERROR' },
        { status: 409 }
      );
    }
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error', code: 'UNKNOWN_ERROR' },
    { status: 500 }
  );
}
```

## 🚀 部署考虑

### 1. 环境变量

```bash
# 生产环境变量
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your-production-secret
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
REDIS_URL=redis://localhost:6379  # 可选的缓存
```

### 2. Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

*最后更新: 2025-01-13*  
*文档状态: 完整版本* 🎯 