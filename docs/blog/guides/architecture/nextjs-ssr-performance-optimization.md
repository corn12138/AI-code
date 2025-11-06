# Next.js SSR 博客项目性能优化指南

## 🎯 优化目标
基于您的 Next.js 14 + Prisma + PostgreSQL 博客项目，全面提升性能和用户体验。

## 📊 性能优化维度

### 1. 🗄️ 数据库层面优化

#### 1.1 数据库查询优化

**当前问题分析**：
- 文章列表查询包含大量关联数据（作者、标签、分类、评论数）
- 缺少数据库索引优化
- 查询结果未做分页限制

**优化策略**：

```typescript
// 优化前的查询 (apps/blog/src/app/api/articles/route.ts)
const articles = await prisma.article.findMany({
  include: {
    author: true,
    tags: true,
    category: true,
    _count: { select: { comments: true } }
  }
});

// 优化后的查询
const articles = await prisma.article.findMany({
  where: { published: true },
  select: {
    id: true,
    title: true,
    slug: true,
    summary: true,
    featuredImage: true,
    viewCount: true,
    publishedAt: true,
    author: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    },
    tags: {
      select: {
        id: true,
        name: true,
        slug: true
      }
    },
    _count: {
      select: { comments: true }
    }
  },
  orderBy: { publishedAt: 'desc' },
  take: limit,
  skip: (page - 1) * limit
});
```

#### 1.2 数据库索引优化

```sql
-- 为 Prisma schema 添加索引
model Article {
  // ... 其他字段
  
  @@index([published])
  @@index([publishedAt])
  @@index([authorId])
  @@index([slug])
  @@index([published, publishedAt])
}

model Tag {
  // ... 其他字段
  
  @@index([name])
  @@index([slug])
}

model Comment {
  // ... 其他字段
  
  @@index([articleId])
  @@index([authorId])
  @@index([parentId])
}
```

#### 1.3 连接池优化

```typescript
// apps/blog/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// 生产环境优化连接池
if (process.env.NODE_ENV === 'production') {
  prisma.$connect();
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 2. 🚀 缓存策略优化

#### 2.1 服务端缓存

```typescript
// apps/blog/src/lib/cache.ts
import { unstable_cache } from 'next/cache';

// 缓存热门文章
export const getCachedPopularArticles = unstable_cache(
  async () => {
    return await prisma.article.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        featuredImage: true,
        viewCount: true,
        publishedAt: true,
        author: {
          select: { username: true, avatar: true }
        }
      }
    });
  },
  ['popular-articles'],
  {
    revalidate: 3600, // 1小时缓存
    tags: ['articles', 'popular']
  }
);

// 缓存标签列表
export const getCachedTags = unstable_cache(
  async () => {
    return await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { articles: true }
        }
      },
      orderBy: { articles: { _count: 'desc' } }
    });
  },
  ['tags-list'],
  {
    revalidate: 1800, // 30分钟缓存
    tags: ['tags']
  }
);
```

#### 2.2 Next.js 缓存配置

```typescript
// apps/blog/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他配置
  
  // 启用实验性功能
  experimental: {
    staleTimes: {
      dynamic: 30, // 动态页面缓存30秒
      static: 180, // 静态页面缓存3分钟
    },
  },
  
  // 图片优化
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'avatars.githubusercontent.com',
      'res.cloudinary.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1年
  },
  
  // 启用 gzip 压缩
  compress: true,
  
  // 性能预算
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // 生产环境优化
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
```

### 3. 🎨 渲染策略优化

#### 3.1 Server Components vs Client Components

```typescript
// apps/blog/src/components/blog/ArticleList.tsx
// 优化：将数据获取移到服务端，交互逻辑放在客户端

// 服务端组件 - 负责数据获取
export async function ArticleListServer({ 
  searchParams 
}: { 
  searchParams: { page?: string; tag?: string; search?: string; }
}) {
  const page = Number(searchParams.page) || 1;
  const tag = searchParams.tag;
  const search = searchParams.search;

  // 并行获取数据
  const [articles, totalCount] = await Promise.all([
    getCachedArticles({ page, tag, search }),
    getCachedArticleCount({ tag, search })
  ]);

  return (
    <ArticleListClient 
      articles={articles} 
      totalCount={totalCount}
      currentPage={page}
      tag={tag}
      search={search}
    />
  );
}

// 客户端组件 - 负责交互逻辑
'use client';
export function ArticleListClient({ 
  articles, 
  totalCount, 
  currentPage, 
  tag, 
  search 
}: ArticleListClientProps) {
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [loading, setLoading] = useState(false);
  
  // 客户端交互逻辑
  const handleFilter = useCallback(async (filters: FilterOptions) => {
    setLoading(true);
    try {
      const newArticles = await fetchArticles(filters);
      setFilteredArticles(newArticles);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <FilterBar onFilter={handleFilter} />
      <ArticleGrid articles={filteredArticles} loading={loading} />
      <Pagination 
        currentPage={currentPage} 
        totalCount={totalCount} 
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

#### 3.2 静态生成优化

```typescript
// apps/blog/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';

// 生成静态参数
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
    take: 100 // 预生成热门文章
  });
  
  return articles.map(article => ({
    slug: article.slug
  }));
}

// 动态生成元数据
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getCachedArticle(params.slug);
  
  if (!article) {
    return { title: '文章未找到' };
  }
  
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.featuredImage ? [article.featuredImage] : [],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.username]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.featuredImage ? [article.featuredImage] : [],
    }
  };
}

// 页面组件
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getCachedArticle(params.slug);
  
  if (!article) {
    notFound();
  }
  
  // 并行获取相关数据
  const [relatedArticles, comments] = await Promise.all([
    getCachedRelatedArticles(article.id, article.tags),
    getCachedComments(article.id)
  ]);
  
  return (
    <article>
      <ArticleHeader article={article} />
      <ArticleContent content={article.content} />
      <RelatedArticles articles={relatedArticles} />
      <CommentSection articleId={article.id} initialComments={comments} />
    </article>
  );
}

// 启用 ISR
export const revalidate = 3600; // 1小时重新验证
```

### 4. 🖼️ 图片优化策略

#### 4.1 图片处理优化

```typescript
// apps/blog/src/components/common/OptimizedImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">图片加载失败</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}
```

#### 4.2 图片懒加载优化

```typescript
// apps/blog/src/components/blog/ArticleCard.tsx
import OptimizedImage from '@/components/common/OptimizedImage';

export default function ArticleCard({ article, priority = false }: ArticleCardProps) {
  return (
    <article className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <OptimizedImage
          src={article.featuredImage || '/images/default-article.jpg'}
          alt={article.title}
          width={400}
          height={225}
          priority={priority} // 首屏文章使用优先加载
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <OptimizedImage
              src={article.author.avatar || '/images/default-avatar.jpg'}
              alt={article.author.username}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-gray-500">
              {article.author.username}
            </span>
          </div>
          
          <time className="text-sm text-gray-500">
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
```

### 5. ⚡ 前端性能优化

#### 5.1 代码分割优化

```typescript
// apps/blog/src/app/layout.tsx
import dynamic from 'next/dynamic';

// 动态导入非关键组件
const ScrollToTop = dynamic(() => import('@/components/common/ScrollToTop'), {
  ssr: false
});

const NetworkStatus = dynamic(() => import('@/components/common/NetworkStatus'), {
  ssr: false
});

const Toast = dynamic(() => import('@/components/ui/Toast'), {
  ssr: false
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          
          {/* 非关键组件延迟加载 */}
          <ScrollToTop />
          <NetworkStatus />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
```

#### 5.2 Bundle 优化

```typescript
// apps/blog/src/lib/dynamic-imports.ts
import dynamic from 'next/dynamic';

// 编辑器组件延迟加载
export const MarkdownEditor = dynamic(() => import('@/components/editor/MarkdownEditor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded" />
});

// 图表组件延迟加载
export const Chart = dynamic(() => import('@/components/charts/Chart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
});

// 评论组件延迟加载
export const CommentSection = dynamic(() => import('@/components/blog/CommentSection'), {
  ssr: false,
  loading: () => <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
    ))}
  </div>
});
```

### 6. 📱 用户体验优化

#### 6.1 Loading States

```typescript
// apps/blog/src/components/common/LoadingStates.tsx
export function ArticleListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArticleContentSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```

#### 6.2 错误边界

```typescript
// apps/blog/src/components/common/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 可以集成错误监控服务
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            出现了一些问题
          </h2>
          <p className="text-gray-600 mb-6">
            我们已经收到错误报告，正在修复中。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            重新加载页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7. 📊 性能监控

#### 7.1 Performance API 集成

```typescript
// apps/blog/src/lib/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  startTimer(name: string) {
    this.metrics.set(`${name}_start`, performance.now());
  }
  
  endTimer(name: string) {
    const startTime = this.metrics.get(`${name}_start`);
    if (startTime) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.metrics.set(name, duration);
      
      // 开发环境输出性能信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }
  
  getMetric(name: string) {
    return this.metrics.get(name) || 0;
  }
  
  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }
  
  reportWebVitals() {
    // 集成 Web Vitals
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

#### 7.2 组件性能监控

```typescript
// apps/blog/src/hooks/usePerformance.ts
import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/lib/performance';

export function usePerformance(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    
    if (renderCount.current === 1) {
      mountTime.current = performance.now();
      performanceMonitor.startTimer(`${componentName}_mount`);
    }
    
    return () => {
      if (renderCount.current === 1) {
        performanceMonitor.endTimer(`${componentName}_mount`);
      }
    };
  }, [componentName]);
  
  return {
    renderCount: renderCount.current,
    measureFunction: (fn: () => void, name: string) => {
      performanceMonitor.startTimer(`${componentName}_${name}`);
      fn();
      performanceMonitor.endTimer(`${componentName}_${name}`);
    }
  };
}
```

### 8. 🔧 构建优化

#### 8.1 生产构建优化

```json
// apps/blog/package.json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:profile": "next build --profile",
    "start": "next start",
    "start:turbo": "next start --turbo"
  }
}
```

#### 8.2 Docker 优化

```dockerfile
# apps/blog/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# 依赖安装优化
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 构建优化
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行优化
FROM base AS runner
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["dumb-init", "node", "server.js"]
```

## 🚀 实施步骤

### 阶段一：基础优化 (1-2天)
1. ✅ 配置数据库索引
2. ✅ 实现基础缓存策略
3. ✅ 优化图片加载

### 阶段二：渲染优化 (2-3天)
1. ✅ 优化 Server/Client Components 分离
2. ✅ 实现 ISR 策略
3. ✅ 添加 Loading States

### 阶段三：高级优化 (3-4天)
1. ✅ 实现性能监控
2. ✅ 优化代码分割
3. ✅ 添加错误边界

### 阶段四：监控与调优 (持续)
1. ✅ 性能数据收集
2. ✅ 持续优化调整
3. ✅ 用户反馈整合

## 📈 性能指标

### 目标指标
- **首屏加载时间 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **累积布局偏移 (CLS)**: < 0.1
- **首次输入延迟 (FID)**: < 100ms
- **数据库查询时间**: < 200ms

### 监控工具
- Next.js Built-in Analytics
- Web Vitals
- Lighthouse CI
- 自定义性能监控

这个优化方案涵盖了从数据库到前端的全方位性能提升，可以根据项目实际情况分阶段实施。建议从基础优化开始，逐步推进到高级优化。 