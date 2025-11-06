# Next.js API Routes 工作原理详解

## 📂 API 文件夹结构

基于您的 blog 项目，API 文件夹的结构如下：

```
src/app/api/
├── articles/
│   ├── route.ts              # GET /api/articles, POST /api/articles
│   └── [id]/
│       ├── route.ts          # GET /api/articles/{id}, PATCH /api/articles/{id}, DELETE /api/articles/{id}
│       └── comments/
│           └── route.ts      # GET /api/articles/{id}/comments, POST /api/articles/{id}/comments
├── auth/
│   ├── login/
│   │   └── route.ts          # POST /api/auth/login
│   ├── register/
│   │   └── route.ts          # POST /api/auth/register
│   └── refresh/
│       └── route.ts          # POST /api/auth/refresh
├── tags/
│   ├── route.ts              # GET /api/tags, POST /api/tags
│   └── [id]/
│       ├── route.ts          # GET /api/tags/{id}, PATCH /api/tags/{id}, DELETE /api/tags/{id}
│       └── articles/
│           └── route.ts      # GET /api/tags/{id}/articles
├── comments/
│   ├── route.ts              # GET /api/comments, POST /api/comments
│   └── [id]/
│       └── route.ts          # GET /api/comments/{id}, PATCH /api/comments/{id}, DELETE /api/comments/{id}
├── uploads/
│   └── images/
│       └── route.ts          # POST /api/uploads/images
├── user/
│   ├── profile/
│   │   └── route.ts          # GET /api/user/profile, PATCH /api/user/profile
│   └── [id]/
│       └── route.ts          # GET /api/user/{id}
├── categories/
│   └── route.ts              # GET /api/categories, POST /api/categories
└── health/
    └── route.ts              # GET /api/health
```

## 🚀 核心工作原理

### 1. **文件路由映射**

Next.js App Router 使用**基于文件系统的路由**：

```typescript
// 文件路径                    →  API 路由
src/app/api/articles/route.ts  →  GET/POST /api/articles
src/app/api/articles/[id]/route.ts  →  GET/PATCH/DELETE /api/articles/{id}
src/app/api/auth/login/route.ts  →  POST /api/auth/login
```

### 2. **HTTP 方法处理**

每个 `route.ts` 文件可以导出不同的 HTTP 方法函数：

```typescript
// src/app/api/articles/route.ts
export async function GET(request: NextRequest) {
  // 处理 GET 请求 - 获取文章列表
  return Response.json({ articles: [] });
}

export async function POST(request: NextRequest) {
  // 处理 POST 请求 - 创建新文章
  return Response.json({ message: 'Article created' });
}

export async function OPTIONS(request: NextRequest) {
  // 处理 OPTIONS 请求 - CORS 预检
  return new Response(null, { status: 200 });
}
```

### 3. **动态路由参数**

使用 `[参数名]` 文件夹创建动态路由：

```typescript
// src/app/api/articles/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;  // 获取URL中的动态参数
  
  // 根据 ID 获取文章
  const article = await prisma.article.findUnique({
    where: { id }
  });
  
  return Response.json({ article });
}
```

### 4. **嵌套路由**

可以创建多层嵌套的 API 路由：

```typescript
// src/app/api/articles/[id]/comments/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;  // 文章 ID
  
  // 获取特定文章的评论
  const comments = await prisma.comment.findMany({
    where: { articleId: id }
  });
  
  return Response.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;  // 文章 ID
  const body = await request.json();
  
  // 为特定文章创建评论
  const comment = await prisma.comment.create({
    data: {
      ...body,
      articleId: id
    }
  });
  
  return Response.json({ comment });
}
```

## 🔧 请求处理流程

### 1. **请求验证**

```typescript
// src/lib/api-auth.ts
export function validateMethod(request: NextRequest, allowedMethods: string[]) {
  const method = request.method;
  if (!allowedMethods.includes(method)) {
    throw new Error(`Method ${method} not allowed`);
  }
}

// 在 API 路由中使用
export async function GET(request: NextRequest) {
  validateMethod(request, ['GET']);  // 只允许 GET 方法
  // ... 处理逻辑
}
```

### 2. **参数解析**

```typescript
// URL 参数解析
const { searchParams } = new URL(request.url);
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '10');
const search = searchParams.get('search') || '';

// 请求体解析
const body = await request.json();
```

### 3. **数据库查询**

```typescript
// 使用 Prisma 进行数据库操作
const articles = await prisma.article.findMany({
  where: { published: true },
  select: {
    id: true,
    title: true,
    summary: true,
    author: {
      select: {
        username: true,
        avatar: true
      }
    }
  },
  orderBy: { publishedAt: 'desc' },
  take: limit,
  skip: (page - 1) * limit
});
```

### 4. **响应处理**

```typescript
// 成功响应
return createApiResponse({
  articles,
  pagination: {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit)
  }
});

// 错误响应
return createApiResponse(
  { error: 'Invalid parameters' },
  400
);
```

## 🛡️ 认证和授权

### 1. **认证中间件**

```typescript
// src/lib/api-auth.ts
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new AuthError('No token provided', 401);
  }
  
  const payload = JWTUtils.verifyToken(token);
  if (!payload) {
    throw new AuthError('Invalid token', 401);
  }
  
  // 从数据库获取用户信息
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });
  
  if (!user) {
    throw new AuthError('User not found', 401);
  }
  
  return user;
}
```

### 2. **权限检查**

```typescript
// 检查资源所有权
export async function checkResourceOwnership(
  request: NextRequest,
  resourceId: string,
  resourceType: 'article' | 'comment'
) {
  const user = await getCurrentUser(request);
  
  let resource;
  if (resourceType === 'article') {
    resource = await prisma.article.findUnique({
      where: { id: resourceId },
      select: { authorId: true }
    });
  }
  
  if (!resource || resource.authorId !== user.id) {
    throw new AuthError('Unauthorized', 403);
  }
}
```

## 🔄 实际请求示例

### 1. **GET 请求 - 获取文章列表**

```bash
GET /api/articles?page=1&limit=10&search=React&tag=javascript
```

```typescript
// src/app/api/articles/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  
  // 构建查询条件
  const where: any = { published: true };
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (tag) {
    where.tags = {
      some: { slug: tag }
    };
  }
  
  const articles = await prisma.article.findMany({
    where,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { publishedAt: 'desc' }
  });
  
  return Response.json({ articles });
}
```

### 2. **POST 请求 - 创建文章**

```bash
POST /api/articles
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Next.js 性能优化",
  "content": "# 性能优化技巧...",
  "summary": "介绍 Next.js 性能优化的最佳实践",
  "tags": ["nextjs", "performance"]
}
```

```typescript
// src/app/api/articles/route.ts
export async function POST(request: NextRequest) {
  // 验证用户登录
  const user = await requireAuth(request);
  
  // 解析请求体
  const body = await request.json();
  
  // 验证必填字段
  validateFields(body, ['title', 'content']);
  
  // 创建文章
  const article = await prisma.article.create({
    data: {
      ...body,
      authorId: user.id,
      published: false
    }
  });
  
  return Response.json({ article }, { status: 201 });
}
```

### 3. **PATCH 请求 - 更新文章**

```bash
PATCH /api/articles/article-id-123
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Updated Title",
  "published": true
}
```

```typescript
// src/app/api/articles/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // 验证用户登录
  const user = await requireAuth(request);
  
  // 检查文章所有权
  await checkResourceOwnership(request, id, 'article');
  
  // 解析请求体
  const body = await request.json();
  
  // 更新文章
  const article = await prisma.article.update({
    where: { id },
    data: body
  });
  
  return Response.json({ article });
}
```

### 4. **DELETE 请求 - 删除文章**

```bash
DELETE /api/articles/article-id-123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```typescript
// src/app/api/articles/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // 验证用户登录
  const user = await requireAuth(request);
  
  // 检查文章所有权
  await checkResourceOwnership(request, id, 'article');
  
  // 删除文章
  await prisma.article.delete({
    where: { id }
  });
  
  return Response.json({ message: 'Article deleted' });
}
```

## 🔍 与传统 Express API 的区别

### **传统 Express API**
```javascript
// Express 方式
app.get('/api/articles', (req, res) => {
  // 处理逻辑
});

app.post('/api/articles', (req, res) => {
  // 处理逻辑
});

app.get('/api/articles/:id', (req, res) => {
  // 处理逻辑
});
```

### **Next.js App Router API**
```typescript
// Next.js 方式 - 基于文件系统
// src/app/api/articles/route.ts
export async function GET(request: NextRequest) {
  // 处理逻辑
}

export async function POST(request: NextRequest) {
  // 处理逻辑
}

// src/app/api/articles/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 处理逻辑
}
```

## 🎯 核心优势

### 1. **类型安全**
- 完全的 TypeScript 支持
- 自动的类型推断
- 编译时错误检查

### 2. **文件系统路由**
- 直观的文件组织结构
- 自动路由生成
- 易于维护和扩展

### 3. **现代化特性**
- 原生支持 `async/await`
- 内置的 `Request` 和 `Response` 对象
- 更好的错误处理

### 4. **性能优化**
- 自动代码分割
- 边缘运行时支持
- 内置缓存机制

## 🚀 最佳实践

### 1. **错误处理**
```typescript
export async function GET(request: NextRequest) {
  try {
    validateMethod(request, ['GET']);
    // 业务逻辑
    return createApiResponse({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 2. **输入验证**
```typescript
// 验证请求体
const body = await parseRequestBody(request);
validateFields(body, ['title', 'content']);

// 验证邮箱格式
if (!validateEmail(email)) {
  throw new ValidationError('Invalid email format');
}
```

### 3. **响应标准化**
```typescript
// 统一的响应格式
export function createApiResponse(data: any, status = 200) {
  return Response.json({
    success: status < 400,
    data,
    timestamp: new Date().toISOString()
  }, { status });
}
```

### 4. **CORS 处理**
```typescript
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

通过这种方式，Next.js App Router 提供了一个现代化、类型安全且高性能的 API 开发体验，让全栈开发变得更加简单和高效。 