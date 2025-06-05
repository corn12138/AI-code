# 博客应用文档

博客应用是一个现代化的技术博客平台，提供类似掘金的文章发布、阅读与创作体验，基于最新的Next.js App Router构建。

## 主要功能

- 文章创建和编辑（Markdown支持）
- 文章分类和标签管理
- 文章评论
- 用户认证
- 草稿保存
- SEO优化
- 图片上传与优化
- 代码语法高亮

## 技术栈

- Next.js (App Router, Server Components, SSG & ISR 支持)
- TypeScript
- Tailwind CSS
- React Hooks
- DOMPurify (XSS防护)
- React Markdown (Markdown渲染)
- Zustand (状态管理)
- NextAuth.js (认证)
- Next SEO (搜索引擎优化)

## 目录结构

由于迁移到Next.js App Router，目录结构遵循新的约定：

```
apps/blog/
├── src/
│   ├── app/                     # App Router核心目录
│   │   ├── (main)/              # 路由组 (示例：包含主要布局的页面)
│   │   │   ├── layout.tsx       # (main)路由组的布局
│   │   │   ├── page.tsx         # 首页 (e.g., /)
│   │   │   └── article/
│   │   │       ├── [slug]/      # 动态路由，文章详情页
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx # 可选：加载状态UI
│   │   ├── (auth)/              # 路由组 (示例：认证相关页面)
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── editor/                # 编辑器页面
│   │   │   ├── [[...slug]]/     # 可选的catch-all路由 (新建/编辑文章)
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                   # API路由 (Route Handlers)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts   # NextAuth.js的Route Handler
│   │   ├── layout.tsx             # 根布局
│   │   └── global.css             # 全局样式 (或通过Tailwind配置)
│   ├── components/            # UI组件 (客户端和服务端组件)
│   │   ├── common/              # 通用组件
│   │   ├── layout/              # 布局相关组件 (Header, Footer, Sidebar)
│   │   └── MarkdownEditor.tsx   # Markdown编辑器 (可能为客户端组件)
│   │   └── MarkdownRenderer.tsx # Markdown渲染器 (可能为服务端或客户端组件)
│   ├── services/              # API服务层/数据获取逻辑
│   ├── store/                 # 状态管理 (Zustand)
│   ├── lib/                   # 工具函数、常量、类型定义等
│   │   └── types.ts             # 类型定义
│   ├── hooks/                 # 自定义React Hooks
│   └── middleware.ts          # Next.js中间件 (可选)
```

## App Router架构与数据流

### 服务器组件与客户端组件分离

博客系统采用了明确的服务器组件与客户端组件分离策略：

1. **服务器组件(Server Components)**:
   - 负责数据获取、SEO优化和初始HTML渲染
   - 文件中不包含`'use client'`指令
   - 示例：`app/blog/[slug]/page.tsx` - 文章详情页面的主要架构

2. **客户端组件(Client Components)**:
   - 负责用户交互、状态管理和客户端效果
   - 文件顶部包含`'use client'`指令
   - 示例：`components/editor/Editor.tsx` - Markdown编辑器

3. **混合架构**:
   - 服务器组件可以导入和渲染客户端组件(但反之不行)
   - 页面通常采用以下模式：
     ```tsx
     // 服务器组件(page.tsx)
     import ClientComponent from '@/components/ClientComponent';
     
     export default async function Page() {
       // 服务器端数据获取
       const data = await fetchData();
       
       // 将数据传递给客户端组件
       return <ClientComponent initialData={data} />;
     }
     ```

### 页面渲染与缓存策略

博客根据不同页面类型采用不同的渲染和缓存策略：

1. **静态页面(Static)**:
   - `export const dynamic = 'force-static';` - 强制静态生成
   - 适用于不频繁变化的内容，如关于页面

2. **动态页面(Dynamic)**:
   - `export const dynamic = 'force-dynamic';` - 强制动态渲染
   - 适用于高度个性化或实时性内容，如用户仪表盘

3. **增量静态再生成(ISR)**:
   - 使用`export const revalidate = 60;` (秒)
   - 适用于定期更新的内容，如博客文章列表

4. **按需静态再生成**:
   - 使用`revalidatePath()`或`revalidateTag()`
   - 适用于内容变更后需要刷新的页面

### 路由拦截模式

为提供更流畅的UX，博客实现了路由拦截模式：

```tsx
// app/@modal/(.)article/[slug]/page.tsx
// 拦截/article/[slug]路由，呈现为模态框而非完整页面跳转
```

## UI/UX细节实现

### 响应式设计

博客使用Tailwind CSS实现了完整的响应式设计：

- 手机视图: <640px (默认)
- 平板视图: sm:640px, md:768px
- 桌面视图: lg:1024px, xl:1280px, 2xl:1536px

示例实现:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 卡片内容 */}
</div>
```

### 深色模式支持

系统实现了完整的深色模式支持：

1. **CSS变量系统**:
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 222.2 84% 4.9%;
     /* 其他亮色模式变量 */
   }
   
   .dark {
     --background: 222.2 84% 4.9%;
     --foreground: 210 40% 98%;
     /* 其他暗色模式变量 */
   }
   ```

2. **Tailwind集成**:
   ```tsx
   <div className="bg-background text-foreground">
     <h1 className="text-primary-600 dark:text-primary-400">标题</h1>
   </div>
   ```

3. **用户偏好检测与存储**:
   - 通过`localStorage`和`prefers-color-scheme`媒体查询检测和记忆用户偏好

### Markdown样式定制

文章内容使用了定制的Tailwind Typography (prose) 样式：

```css
@layer components {
  /* Markdown 内容样式 */
  .prose pre {
    @apply bg-gray-900 text-gray-100 rounded-lg shadow-md overflow-x-auto;
  }
  
  .prose code:not(pre code) {
    @apply bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded;
  }
  
  .prose blockquote {
    @apply border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20;
  }
  
  .prose a {
    @apply text-primary-600 dark:text-primary-400 hover:underline;
  }
}
```

## 数据获取与管理

### 静态数据获取模式

对于可预渲染内容，使用静态数据获取方式：

```typescript
// 从本地Markdown文件获取博客文章
export async function getPosts() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // 解析front-matter元数据和内容
    const matterResult = matter(fileContents);
    
    return {
      id,
      slug: id,
      ...matterResult.data,
    };
  });
  
  // 按日期排序
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}
```

### 动态数据获取与API集成

对于需要实时获取的数据，使用API集成：

1. **客户端获取**:
   - 使用自定义钩子管理API请求状态
   - 实现骨架屏、加载指示器等提升用户体验

2. **服务器端获取**:
   - 在服务器组件中直接获取数据，无需状态管理
   - 在Route Handlers中处理API逻辑

## 安全措施详解

### Markdown内容安全

使用多层安全措施确保Markdown内容安全：

1. **输入过滤**:
   - 在编辑器组件中实施基本过滤
   - 在API端点验证和清理用户输入

2. **DOMPurify集成**:
   ```tsx
   // 在MarkdownRenderer中净化内容
   const sanitizedContent = DOMPurify.sanitize(content, {
     ALLOWED_TAGS: ['p', 'b', 'i', /* 其他允许的标签 */],
     ALLOWED_ATTR: ['href', 'target', /* 其他允许的属性 */],
     FORBID_TAGS: ['script', 'iframe', /* 其他禁止的标签 */],
   });
   ```

3. **外部链接安全**:
   - 为所有外部链接添加`rel="noopener noreferrer"`
   - 使用`target="_blank"`在新窗口打开链接

### 图片上传安全

1. **客户端验证**:
   - 检查文件大小和类型
   - 图片预览和调整选项

2. **服务器端验证**:
   - 二次验证文件类型和大小
   - 生成安全文件名，避免路径遍历攻击
   - 限制上传目录权限

3. **存储与交付**:
   - 使用CDN或优化的静态资源交付
   - 支持WebP和响应式图像尺寸

## 组件交互模式

### 标签选择器(TagSelector)

标签选择器组件实现了以下功能：

- 标签搜索过滤
- 最大选择数量限制(5个)
- 已选标签可视化和删除
- 标签计数显示

### 主页内容(HomeContent)

主页内容组件实现了以下交互能力：

- 标签筛选
- 文章搜索
- 无限滚动/分页加载
- 空状态和加载状态处理

### 文章详情交互(ArticleDetailClient)

文章详情页面的客户端交互：

- 点赞功能
- 阅读统计
- 评论显示和交互

## 性能优化技术

1. **图像优化**:
   - 使用Next.js的`<Image>`组件实现自动优化
   - 延迟加载非关键图片

2. **代码分割**:
   - 使用`dynamic import`懒加载组件
   - 路由级代码分割

3. **静态生成与缓存**:
   - 适当的页面缓存策略
   - 增量静态再生成(ISR)

4. **字体优化**:
   - 使用`next/font`自动管理字体加载和优化
   - 防止布局偏移(CLS)
