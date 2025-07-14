# Article API 前后端完整交互流程详解

## 🎯 概述
以 article（文章）为例，详细展示 Next.js 全栈项目中从前端请求到后端处理，再到前端接收响应的完整数据流程。

## 🚀 完整数据流程图

```
前端页面 → API 服务层 → HTTP 请求 → Next.js API Routes → 数据库 → 响应返回
```

## 🔧 后端 API 实现

### 1. **API 路由文件结构**

```
src/app/api/articles/
├── route.ts                    # GET /api/articles, POST /api/articles
└── [id]/
    ├── route.ts               # GET /api/articles/{id}, PATCH /api/articles/{id}, DELETE /api/articles/{id}
    └── comments/
        └── route.ts           # GET /api/articles/{id}/comments, POST /api/articles/{id}/comments
```

### 2. **获取文章列表 API (GET /api/articles)**

```typescript
// apps/blog/src/app/api/articles/route.ts
export async function GET(request: NextRequest) {
    try {
        // 1. 验证请求方法
        validateMethod(request, ['GET']);

        // 2. 解析 URL 查询参数
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const tagId = searchParams.get('tagId') || '';
        const published = searchParams.get('published');

        // 3. 参数验证
        if (page < 1 || limit < 1 || limit > 100) {
            return createApiResponse({ error: 'Invalid pagination parameters' }, 400);
        }

        // 4. 构建数据库查询条件
        const where: any = {};
        
        // 搜索条件
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        // 标签过滤
        if (tagId) {
            where.tags = {
                some: { id: tagId }
            };
        }

        // 发布状态过滤
        if (published !== null) {
            where.published = published === 'true';
        }

        // 5. 并行执行数据库查询
        const [articles, totalCount] = await Promise.all([
            // 查询文章列表
            prisma.article.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    summary: true,
                    published: true,
                    featuredImage: true,
                    viewCount: true,
                    createdAt: true,
                    updatedAt: true,
                    publishedAt: true,
                    // 关联查询作者信息
                    author: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatar: true
                        }
                    },
                    // 关联查询分类信息
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                    // 关联查询标签信息
                    tags: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            color: true
                        }
                    },
                    // 统计评论数量
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            }),
            // 查询总数量
            prisma.article.count({ where })
        ]);

        // 6. 格式化响应数据
        return createApiResponse({
            articles,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}
```

### 3. **创建文章 API (POST /api/articles)**

```typescript
export async function POST(request: NextRequest) {
    try {
        // 1. 验证请求方法
        validateMethod(request, ['POST']);

        // 2. 验证用户认证
        const user = await requireAuth(request);

        // 3. 解析请求体
        const body = await parseRequestBody(request);

        // 4. 验证必填字段
        validateFields(body, ['title', 'content']);

        const { title, content, summary, published, categoryId, tagIds } = body;

        // 5. 创建文章
        const article = await prisma.article.create({
            data: {
                title,
                content,
                summary,
                published: published || false,
                slug: generateSlug(title), // 生成 URL 友好的 slug
                authorId: user.id,
                categoryId,
                // 关联标签
                tags: tagIds ? {
                    connect: tagIds.map((id: string) => ({ id }))
                } : undefined
            },
            // 返回完整数据包括关联信息
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                category: true,
                tags: true
            }
        });

        // 6. 返回创建的文章
        return createApiResponse({ article }, 201);

    } catch (error) {
        return handleApiError(error);
    }
}
```

### 4. **获取单篇文章 API (GET /api/articles/[id])**

```typescript
// apps/blog/src/app/api/articles/[id]/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Article ID is required' }, 400);
        }

        const currentUser = await getCurrentUser(request);

        // 查找文章
        const article = await prisma.article.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                summary: true,
                published: true,
                featuredImage: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
                publishedAt: true,
                authorId: true,
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
                        slug: true,
                        description: true
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true,
                        description: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: {
                                username: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        if (!article) {
            return createApiResponse({ error: 'Article not found' }, 404);
        }

        // 增加浏览量（如果不是作者本人）
        if (currentUser?.id !== article.authorId) {
            await prisma.article.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });
        }

        return createApiResponse({ article });

    } catch (error) {
        return handleApiError(error);
    }
}
```

## 🎨 前端 API 服务层

### 1. **API 服务函数**

```typescript
// apps/blog/src/services/api.ts

// 创建 axios 实例
const createApiInstance = (isServer = true) => {
    const instance = axios.create({
        baseURL: API_BASE_URL, // 现在指向内部 API: /api
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    });

    // 客户端添加认证拦截器
    if (!isServer && typeof window !== 'undefined') {
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    return instance;
};

// 获取文章列表
export async function fetchArticles(params?: {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    author?: string;
    sort?: 'newest' | 'popular';
}): Promise<Article[]> {
    try {
        const api = createApiInstance(typeof window === 'undefined');

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params?.tag) queryParams.set('tag', params.tag);
        if (params?.search) queryParams.set('search', params.search);
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.author) queryParams.set('author', params.author);
        if (params?.sort) queryParams.set('sort', params.sort);

        // 发送 HTTP GET 请求
        const response = await api.get(`/articles?${queryParams.toString()}`);

        // 解析响应数据
        const { articles } = response.data;

        // 数据转换：将后端格式转换为前端所需格式
        return articles.map((article: any) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.summary || article.content?.substring(0, 200) + '...',
            content: article.content,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.publishedAt || article.createdAt,
            coverImage: article.featuredImage,
            author: {
                id: article.author?.id,
                username: article.author?.username || '匿名用户',
                avatar: article.author?.avatar || 'https://via.placeholder.com/40',
                bio: article.author?.bio
            },
            tags: article.tags?.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
                color: tag.color
            })) || [],
            views: article.viewCount || 0,
            likesCount: Math.floor(Math.random() * 50),
            readingTime: Math.ceil((article.content?.length || 0) / 200)
        }));

    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

// 获取单篇文章
export async function fetchArticleById(id: string): Promise<Article | null> {
    try {
        const api = createApiInstance(typeof window === 'undefined');
        
        // 发送 HTTP GET 请求
        const response = await api.get(`/articles/${id}`);

        const { article } = response.data;

        // 数据转换
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.summary,
            content: article.content,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.publishedAt,
            coverImage: article.featuredImage,
            author: {
                id: article.author.id,
                username: article.author.username,
                avatar: article.author.avatar,
                bio: article.author.bio
            },
            tags: article.tags?.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
                color: tag.color
            })) || [],
            views: article.viewCount || 0,
            likesCount: Math.floor(Math.random() * 50),
            readingTime: Math.ceil((article.content?.length || 0) / 200)
        };

    } catch (error) {
        console.error(`Error fetching article ${id}:`, error);
        return null;
    }
}
```

## 🌐 前端页面调用

### 1. **服务端组件调用 (SSR)**

```typescript
// apps/blog/src/app/blog/page.tsx
import { fetchArticles, fetchTags } from '@/services/api';

export default async function BlogPage({
    searchParams
}: {
    searchParams: { tag?: string; search?: string; page?: string; }
}) {
    const tag = searchParams.tag;
    const search = searchParams.search;
    const page = searchParams.page ? parseInt(searchParams.page) : 1;

    // 在服务端并行获取数据
    const [articles, tags] = await Promise.all([
        fetchArticles({
            tag,
            search,
            page,
            limit: 10,
        }),
        fetchTags()
    ]);

    // 将数据传递给客户端组件
    return (
        <div className="container mx-auto px-4 py-8">
            <ArticleList 
                articles={articles} 
                tags={tags}
                currentPage={page}
                currentTag={tag}
                currentSearch={search}
            />
        </div>
    );
}
```

### 2. **客户端组件调用**

```typescript
// apps/blog/src/components/blog/ArticleList.tsx
'use client';

import { fetchArticles } from '@/services/api';
import { useState, useEffect } from 'react';

interface ArticleListProps {
    articles: Article[];
    tags: Tag[];
    currentPage: number;
    currentTag?: string;
    currentSearch?: string;
}

export default function ArticleList({ 
    articles: initialArticles, 
    tags, 
    currentPage,
    currentTag,
    currentSearch 
}: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(currentPage);
    const [selectedTag, setSelectedTag] = useState(currentTag);
    const [searchQuery, setSearchQuery] = useState(currentSearch);

    // 客户端数据获取函数
    const loadArticles = async (params: {
        page?: number;
        tag?: string;
        search?: string;
    }) => {
        setLoading(true);
        try {
            const newArticles = await fetchArticles({
                page: params.page || 1,
                tag: params.tag,
                search: params.search,
                limit: 10
            });
            setArticles(newArticles);
        } catch (error) {
            console.error('Failed to load articles:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理分页
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadArticles({ page: newPage, tag: selectedTag, search: searchQuery });
    };

    // 处理标签筛选
    const handleTagFilter = (tagSlug: string) => {
        setSelectedTag(tagSlug);
        setPage(1);
        loadArticles({ page: 1, tag: tagSlug, search: searchQuery });
    };

    // 处理搜索
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
        loadArticles({ page: 1, tag: selectedTag, search: query });
    };

    return (
        <div className="space-y-8">
            {/* 搜索和筛选 */}
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="搜索文章..."
                    value={searchQuery || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                />
                
                <select
                    value={selectedTag || ''}
                    onChange={(e) => handleTagFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="">所有标签</option>
                    {tags.map(tag => (
                        <option key={tag.id} value={tag.slug}>
                            {tag.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 文章列表 */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">加载中...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}

            {/* 分页 */}
            <div className="flex justify-center space-x-2">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    上一页
                </button>
                <span className="px-4 py-2">第 {page} 页</span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    下一页
                </button>
            </div>
        </div>
    );
}
```

## 🔄 完整请求响应示例

### 1. **请求示例**

```bash
# 获取文章列表
GET /api/articles?page=1&limit=10&search=Next.js&tag=javascript

# 请求头
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **响应示例**

```json
{
  "articles": [
    {
      "id": "article-123",
      "title": "Next.js 全栈开发指南",
      "slug": "nextjs-fullstack-guide",
      "summary": "学习如何使用 Next.js 进行全栈开发",
      "published": true,
      "featuredImage": "https://example.com/image.jpg",
      "viewCount": 1250,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "author": {
        "id": "user-456",
        "username": "developer",
        "fullName": "张开发",
        "avatar": "https://example.com/avatar.jpg"
      },
      "category": {
        "id": "cat-789",
        "name": "前端开发",
        "slug": "frontend"
      },
      "tags": [
        {
          "id": "tag-001",
          "name": "Next.js",
          "slug": "nextjs",
          "color": "#000000"
        },
        {
          "id": "tag-002",
          "name": "React",
          "slug": "react",
          "color": "#61dafb"
        }
      ],
      "_count": {
        "comments": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 📊 数据流程时序图

```
前端页面 → API服务 → HTTP请求 → Next.js路由 → API处理器 → 数据库 → 响应 → 前端显示

1. 用户访问 /blog 页面
2. BlogPage 组件调用 fetchArticles()
3. fetchArticles() 发送 GET /api/articles 请求
4. Next.js 路由匹配到 src/app/api/articles/route.ts
5. GET 函数被调用，解析查询参数
6. Prisma 查询数据库
7. 数据库返回文章数据
8. API 格式化响应数据
9. HTTP 响应返回给前端
10. 前端接收数据并渲染页面
```

## 🎯 关键优势

### 1. **类型安全**
- 前后端共享 TypeScript 类型定义
- 编译时错误检查
- IDE 智能提示

### 2. **统一架构**
- 同一个项目包含前后端代码
- 共享工具函数和类型
- 简化部署流程

### 3. **性能优化**
- SSR 服务端渲染
- 自动代码分割
- 内置缓存机制

### 4. **开发体验**
- 热重载支持
- 统一的错误处理
- 现代化的开发工具链

这种架构让您可以在一个项目中同时开发前端界面和后端 API，实现真正的全栈开发体验！ 


