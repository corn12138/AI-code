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

## 性能优化

### 页面渲染策略

博客系统根据内容类型采用不同的渲染策略：

| 页面类型 | 渲染策略 | 更新频率 | 实现方法 |
|--------|--------|--------|--------|
| 首页 | SSG + ISR | 10分钟 | `getStaticProps` + `revalidate: 600` |
| 文章详情 | SSG + ISR | 1小时 | `getStaticProps` + `revalidate: 3600` |
| 热门文章 | SSG | 每次部署 | `getStaticProps` |
| 用户页面 | SSR | 实时 | `getServerSideProps` |
| 搜索结果 | CSR | 实时 | React客户端渲染 + API |

### 图片处理流水线

1. **上传阶段**:
   - 客户端压缩预处理
   - 服务器端验证文件类型和大小
   - 生成多种尺寸变体

2. **存储策略**:
   - 原图存储在安全位置
   - 公开访问优化后的变体
   - CDN分发

3. **加载优化**:
   - 使用`next/image`自动选择最佳格式(WebP/AVIF)
   - 响应式尺寸变体
   - 延迟加载非关键图片

### JS优化

- **代码拆分**: 基于路由的自动代码拆分
- **预加载**: 智能预取可能访问的页面
- **组件懒加载**: 对初始渲染非必需组件使用`dynamic import`
- **再导出优化**: 避免不必要的重渲染

## API接口

博客前端调用以下后端接口：

- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取单篇文章
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `GET /api/tags` - 获取标签列表
- `POST /api/comments` - 发表评论

## 内容安全策略

博客实现了严格的内容安全策略(CSP)：

```typescript
// 在Next.js中设置CSP头
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.yoursite.com;
  font-src 'self';
  connect-src 'self' https://*.yoursite.com;
  media-src 'self';
  frame-src 'self';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // 更多安全头...
];
```

## Markdown高级功能

博客的Markdown支持丰富的扩展功能：

- **代码块语法高亮**: 支持超过100种编程语言
- **数学公式**: 通过KaTeX渲染LaTeX公式
- **任务列表**: 支持GitHub风格的任务列表
- **表格**: 支持标准Markdown表格
- **脚注**: 支持学术风格脚注
- **图表**: 通过Mermaid集成生成图表

```typescript
// Markdown渲染配置
const markdownOptions = {
  remarkPlugins: [
    remarkGfm,       // GitHub风格Markdown
    remarkMath,      // 数学公式
    remarkFootnotes, // 脚注
    [remarkToc, { tight: true }], // 目录生成
  ],
  rehypePlugins: [
    rehypeSlug,       // 添加标题锚点
    rehypePrism,      // 代码高亮
    rehypeKatex,      // 渲染数学公式
    [rehypeAutolinkHeadings, { behavior: 'wrap' }], // 标题链接
  ],
};
```

## 用户体验优化

### 阅读进度跟踪

- 文章页面显示阅读进度条
- 自动保存阅读位置
- 返回时恢复上次阅读位置

### 自适应布局

- 基于设备类型自动调整布局
- 针对平板设备的中间布局
- 移动端优化的操作界面

### 阅读模式

- 提供专注阅读模式
- 可调整字号和行高
- 自动跟随系统深色/浅色模式

## 状态管理

使用Zustand管理博客前端状态：

```typescript
// 文章状态管理
interface ArticleState {
  articles: Article[];
  currentArticle: Article | null;
  isLoading: boolean;
  error: string | null;
  
  // 操作
  fetchArticles: (params?: ArticleQueryParams) => Promise<void>;
  fetchArticleById: (id: string) => Promise<void>;
  createArticle: (data: CreateArticleDto) => Promise<Article>;
  updateArticle: (id: string, data: UpdateArticleDto) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
}

const useArticleStore = create<ArticleState>((set) => ({
  articles: [],
  currentArticle: null,
  isLoading: false,
  error: null,
  
  fetchArticles: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const articles = await articleService.getArticles(params);
      set({ articles, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // 其他操作实现...
}));
```

## 国际化支持

博客支持多语言内容：

- 使用next-i18next实现国际化
- 支持按用户偏好自动切换语言
- URL路径中包含语言代码(如 /en/article/123)
- 允许用户在同一文章的不同语言版本间切换

## 排版系统

博客实现了精心设计的排版系统：

- 基于黄金比例的标题层级
- 最佳阅读行长(65-75字符)
- 响应式字体大小
- 优化的行高和段落间距

## 交互分析

集成Google Analytics和自定义事件跟踪：

- 页面访问统计
- 文章阅读深度
- 用户互动行为(点赞、评论、分享)
- 转化路径分析

## 测试策略

博客系统采用多层测试策略：

1. **单元测试**: 使用Jest测试独立函数和组件
2. **集成测试**: 使用React Testing Library测试组件交互
3. **E2E测试**: 使用Cypress测试关键用户流程
4. **视觉回归测试**: 使用Percy确保UI一致性

## 部署流程

博客应用推荐使用支持Next.js的现代化托管平台（如Vercel, Netlify）进行部署，以充分利用其SSG/ISR和CDN能力。

### 1. 构建应用

在部署前，需要构建生产版本的应用：

```bash
# 在项目根目录
npm run build:blog
# 或 yarn build:blog

# 构建产物将位于 apps/blog/.next 和 apps/blog/out (如果配置了静态导出)
```

### 2. 环境变量配置

确保在托管平台上配置了所有必要的生产环境变量，例如：

- `DATABASE_URL` (如果博客需要直接访问数据库，通常通过API层)
- `NEXT_PUBLIC_API_URL` (后端API的公开地址)
- `AUTH_SECRET` (用于NextAuth.js的密钥)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (如果使用Google OAuth)
- 其他API密钥或服务配置

### 3. 持续集成与持续部署 (CI/CD)

推荐设置CI/CD流水线自动化部署流程：

1.  **代码推送**: 开发者将代码推送到Git仓库（如GitHub, GitLab）。
2.  **触发构建**: CI服务（如GitHub Actions, Vercel CI, Netlify CI）检测到代码变更，自动触发构建流程。
    -   安装依赖 (`npm ci` 或 `yarn install --frozen-lockfile`)
    -   运行代码检查和测试 (`npm run lint`, `npm run test`)
    -   构建应用 (`npm run build:blog`)
3.  **部署**:
    -   **Vercel/Netlify**: 这些平台通常会自动从Git仓库拉取代码、构建并部署。只需在平台UI上连接您的Git仓库并配置构建命令 (`next build`) 和输出目录 (`apps/blog/.next` 通常是自动检测的，如果是monorepo可能需要指定工作目录 `apps/blog`)。
    -   **自定义服务器/Docker**:
        -   将构建产物 (`apps/blog/.next`, `apps/blog/public`, `apps/blog/package.json`, `apps/blog/next.config.js`) 打包。
        -   在服务器上运行 `npm start --prefix apps/blog` 或使用PM2等进程管理器。
        -   对于Docker，创建一个Dockerfile来复制构建产物并运行Next.js应用。

### 4. 域名和HTTPS

- 配置自定义域名。
- 确保启用HTTPS，大多数现代托管平台会自动提供免费的SSL证书。

### 5. 监控与回滚

- 配置应用监控和错误跟踪（如Sentry）。
- 熟悉托管平台的回滚机制，以便在部署出现问题时快速恢复到上一个稳定版本。

### 示例：Vercel部署配置

- **项目设置**: 连接到您的Git仓库。
- **构建命令**: `cd ../../ && npm run build:blog` (如果从根目录构建) 或 `npm run build` (如果在`apps/blog`为根目录)。
- **输出目录**: 通常Vercel会自动检测为 `.next`。
- **工作目录**: `apps/blog` (对于Monorepo结构)。
- **环境变量**: 在Vercel项目设置中添加生产环境变量。

### 预览部署 (Pull Request Previews)

Vercel和Netlify等平台通常会自动为每个Pull Request创建预览部署，方便在合并前审查更改。

## 认证与用户管理

### 认证集成

博客系统集成了共享的Auth模块，实现了无缝的用户认证体验：

1. **登录流程**:
   - 使用共享的AuthContext管理认证状态
   - 支持jwt令牌存储和刷新机制
   - 登录状态持久化，页面刷新不丢失

2. **登录页面实现**:
   ```tsx
   // Blog系统登录页面
   const Login = () => {
     const [usernameOrEmail, setUsernameOrEmail] = useState('');
     const [password, setPassword] = useState('');
     const { login } = useAuth();
     const navigate = useNavigate();
     
     // 处理表单提交
     const handleSubmit = async (e) => {
       e.preventDefault();
       try {
         await login(usernameOrEmail, password);
         navigate('/dashboard');
       } catch (error) {
         // 显示错误信息
       }
     };
     
     return (
       // 登录表单UI
     );
   };
   ```

3. **导航栏用户状态**:
   - 根据认证状态动态显示登录/登出选项
   - 登录后显示用户信息和下拉菜单
   - 提供快捷访问个人中心和创作中心的链接

4. **权限控制**:
   - 特定操作(如发布文章)需要用户登录
   - 管理操作(如删除评论)需要特定权限
   - 使用路由守卫保护需要认证的页面

### 内容权限级别

博客系统实现了不同级别的内容权限控制：

1. **公开内容**: 无需登录即可访问，如公开文章列表

2. **登录可见**: 需用户登录后访问，如全文阅读和评论

3. **作者专属**: 仅内容作者可访问，如草稿和编辑功能

4. **管理员权限**: 仅管理员可访问，如内容审核功能

```tsx
// 内容权限控制示例
export function ArticleActions({ article }) {
  const { user } = useAuth();
  
  const isAuthor = user && article.authorId === user.id;
  const isAdmin = user && user.roles.includes('admin');
  
  return (
    <div className="article-actions">
      {/* 所有登录用户可见 */}
      {user && (
        <button className="like-button">点赞</button>
      )}
      
      {/* 作者或管理员可见 */}
      {(isAuthor || isAdmin) && (
        <>
          <button className="edit-button">编辑</button>
          <button className="delete-button">删除</button>
        </>
      )}
    </div>
  );
}
```
