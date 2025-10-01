import { create } from 'zustand';
import { Article, ArticleCategory, PaginatedResponse } from '../types';

// 后端数据格式接口
interface BackendMobileDoc {
    id: string;
    title: string;
    summary?: string;
    content: string;
    imageUrl?: string | null;
    author: string;
    readTime: number;
    tags: string[];
    category: string;
    isHot: boolean;
    published: boolean;
    sortOrder: number;
    docType: string;
    filePath: string;
    createdAt: string;
    updatedAt: string;
}

// 数据转换函数：后端格式 -> 前端格式
function transformBackendToFrontend(backendDoc: BackendMobileDoc): Article {
    return {
        id: backendDoc.id,
        title: backendDoc.title,
        summary: backendDoc.summary || '',
        content: backendDoc.content,
        imageUrl: backendDoc.imageUrl || undefined,
        author: backendDoc.author,
        publishDate: backendDoc.createdAt, // 使用createdAt作为发布日期
        readTime: backendDoc.readTime,
        tags: backendDoc.tags,
        isHot: backendDoc.isHot,
        category: backendDoc.category as ArticleCategory,
    };
}

interface ArticleState {
    // 文章列表
    articles: Article[];
    // 当前分类
    currentCategory: ArticleCategory;
    // 加载状态
    loading: boolean;
    // 错误信息
    error: string | null;
    // 分页信息
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
    // 当前查看的文章
    currentArticle: Article | null;
}

interface ArticleActions {
    // 设置当前分类
    setCurrentCategory: (category: ArticleCategory) => void;
    // 加载文章列表
    loadArticles: (category?: ArticleCategory, page?: number) => Promise<void>;
    // 加载更多文章
    loadMoreArticles: () => Promise<void>;
    // 获取文章详情
    getArticleById: (id: string) => Promise<void>;
    // 设置当前文章
    setCurrentArticle: (article: Article | null) => void;
    // 重置状态
    reset: () => void;
}

type ArticleStore = ArticleState & ArticleActions;

const initialState: ArticleState = {
    articles: [],
    currentCategory: 'latest',
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        hasMore: true,
    },
    currentArticle: null,
};

export const useArticleStore = create<ArticleStore>((set, get) => ({
    ...initialState,

    setCurrentCategory: (category) => {
        set({ currentCategory: category });
        // 切换分类时重新加载文章
        get().loadArticles(category, 1);
    },

    loadArticles: async (category, page = 1) => {
        const { currentCategory } = get();
        const targetCategory = category || currentCategory;

        set({ loading: true, error: null });

        try {
            // API调用
            const response = await fetchArticles(targetCategory, page);

            set({
                articles: page === 1 ? response.items : [...get().articles, ...response.items],
                pagination: {
                    page: response.page,
                    pageSize: response.pageSize,
                    total: response.total,
                    hasMore: response.hasMore,
                },
                loading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : '加载文章失败',
                loading: false,
            });
        }
    },

    loadMoreArticles: async () => {
        const { pagination, currentCategory } = get();
        if (!pagination.hasMore || get().loading) return;

        await get().loadArticles(currentCategory, pagination.page + 1);
    },

    getArticleById: async (id) => {
        set({ loading: true, error: null });

        try {
            // 先从当前列表中查找
            const existingArticle = get().articles.find(article => article.id === id);
            if (existingArticle) {
                set({ currentArticle: existingArticle, loading: false });
                return;
            }

            // API调用获取文章详情
            const article = await fetchArticleById(id);
            set({ currentArticle: article, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : '加载文章详情失败',
                loading: false,
            });
        }
    },

    setCurrentArticle: (article) => {
        set({ currentArticle: article });
    },

    reset: () => {
        set(initialState);
    },
}));

// API函数 - 优先使用真实API，降级到模拟数据
async function fetchArticles(
    category: ArticleCategory,
    page: number,
    pageSize: number = 10
): Promise<PaginatedResponse<Article>> {
    // 在浏览器环境中，尝试调用API
    if (typeof window !== 'undefined') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
            });

            if (category !== 'latest') {
                params.append('category', category);
            }

            const response = await fetch(`/api/mobile/docs?${params}`);
            if (response.ok) {
                const result = await response.json();
                // 转换后端数据格式到前端格式
                const data = result.data || result;
                const items = data.items || [];
                return {
                    items: items.map(transformBackendToFrontend),
                    total: data.total || 0,
                    page: data.page || 1,
                    pageSize: data.pageSize || 10,
                    hasMore: data.hasMore || false,
                };
            }
        } catch (error) {
            console.warn('API调用失败，使用模拟数据:', error);
        }
    }

    // 降级到模拟数据
    return mockFetchArticles(category, page, pageSize);
}

// 获取单篇文章
async function fetchArticleById(id: string): Promise<Article> {
    // 在浏览器环境中，尝试调用API
    if (typeof window !== 'undefined') {
        try {
            const response = await fetch(`/api/mobile/docs/${id}`);
            if (response.ok) {
                const result = await response.json();
                const data = result.data || result;
                return transformBackendToFrontend(data);
            }
        } catch (error) {
            console.warn('API调用失败，使用模拟数据:', error);
        }
    }

    // 降级到模拟数据
    return mockFetchArticleById(id);
}

// 模拟API函数
async function mockFetchArticles(
    category: ArticleCategory,
    page: number,
    pageSize: number = 10
): Promise<PaginatedResponse<Article>> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 使用真实文档数据
    const { REAL_DOCS_DATA, DOCS_BY_CATEGORY } = await import('../data/mockDocsData');

    let mockArticles: Article[];
    if (category === 'latest') {
        // 最新分类显示所有文档，按时间排序
        mockArticles = [...REAL_DOCS_DATA].sort((a, b) =>
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
    } else {
        // 其他分类显示对应分类的文档
        mockArticles = DOCS_BY_CATEGORY[category] || [];
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = mockArticles.slice(startIndex, endIndex);

    return {
        items,
        total: mockArticles.length,
        page,
        pageSize,
        hasMore: endIndex < mockArticles.length,
    };
}

async function mockFetchArticleById(id: string): Promise<Article> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 使用真实文档数据
    const { REAL_DOCS_DATA } = await import('../data/mockDocsData');

    const article = REAL_DOCS_DATA.find(a => a.id === id);
    if (!article) {
        throw new Error('文章不存在');
    }

    return article;
}

// 生成模拟文章数据
function generateMockArticles(category: ArticleCategory): Article[] {
    const categoryData = {
        latest: {
            titles: [
                '2024年前端开发趋势预测',
                'React 19 新特性深度解析',
                'TypeScript 5.0 重大更新',
                'Vite 4.0 性能优化指南',
                '现代CSS布局技巧大全',
            ],
            prefix: '最新',
        },
        frontend: {
            titles: [
                'Vue 3 Composition API 最佳实践',
                'React Hooks 进阶使用技巧',
                'JavaScript ES2024 新特性',
                'Webpack 5 配置优化指南',
                'CSS Grid 布局完全指南',
            ],
            prefix: '前端',
        },
        backend: {
            titles: [
                'Node.js 性能优化实战',
                'Docker 容器化部署指南',
                'Redis 缓存策略详解',
                'MySQL 索引优化技巧',
                'RESTful API 设计规范',
            ],
            prefix: '后端',
        },
        ai: {
            titles: [
                'ChatGPT API 集成实战',
                '机器学习模型部署指南',
                'TensorFlow.js 入门教程',
                'AI 代码生成工具对比',
                '深度学习框架选择指南',
            ],
            prefix: 'AI',
        },
        mobile: {
            titles: [
                'React Native 跨平台开发',
                'Flutter 性能优化技巧',
                '移动端适配解决方案',
                'PWA 应用开发指南',
                '移动端手势交互设计',
            ],
            prefix: '移动端',
        },
        design: {
            titles: [
                'UI/UX 设计趋势分析',
                'Figma 设计系统构建',
                '色彩搭配理论与实践',
                '响应式设计最佳实践',
                '用户体验优化策略',
            ],
            prefix: '设计',
        },
    };

    const data = categoryData[category];

    return data.titles.map((title, index) => ({
        id: `${category}-${index + 1}`,
        title: `${data.prefix} - ${title}`,
        summary: `这是一篇关于${title}的详细文章，包含了最新的技术趋势和实践经验分享。文章深入浅出地介绍了相关概念和实际应用场景。`,
        content: generateMockContent(title),
        category,
        author: ['张三', '李四', '王五', '赵六', '钱七'][index % 5],
        publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: Math.floor(Math.random() * 10) + 3,
        tags: generateTags(category),
        imageUrl: `https://picsum.photos/400/240?random=${category}-${index}`,
        isHot: Math.random() > 0.7,
    }));
}

function generateMockContent(title: string): string {
    return `
# ${title}

## 概述

这是一篇关于${title}的详细技术文章。在当今快速发展的技术环境中，掌握最新的技术趋势和最佳实践变得越来越重要。

## 主要内容

### 1. 技术背景

随着技术的不断发展，我们需要深入了解相关的技术背景和发展历程。这有助于我们更好地理解当前的技术状况和未来的发展方向。

### 2. 核心概念

在深入学习之前，我们需要掌握一些核心概念：

- **概念一**：这是一个重要的基础概念，需要深入理解
- **概念二**：建立在概念一基础上的进阶概念
- **概念三**：实际应用中的关键概念

### 3. 实践应用

理论知识需要结合实践才能真正掌握。以下是一些实际应用场景：

\`\`\`javascript
// 示例代码
function example() {
  console.log('这是一个示例代码片段');
  return 'Hello World';
}
\`\`\`

### 4. 最佳实践

基于实际项目经验，我们总结了以下最佳实践：

1. **性能优化**：关注应用性能，及时优化瓶颈
2. **代码质量**：保持代码的可读性和可维护性
3. **团队协作**：建立良好的团队协作流程

## 总结

通过本文的学习，我们深入了解了${title}的相关知识。在实际工作中，我们应该将这些知识与具体项目相结合，不断提升自己的技术水平。

## 参考资料

- 官方文档
- 技术博客
- 开源项目
- 社区讨论

---

*本文持续更新中，欢迎关注最新动态。*
  `.trim();
}

function generateTags(category: ArticleCategory): string[] {
    const tagMap = {
        latest: ['最新', '趋势', '技术'],
        frontend: ['前端', 'JavaScript', 'React', 'Vue'],
        backend: ['后端', 'Node.js', '数据库', 'API'],
        ai: ['人工智能', '机器学习', 'ChatGPT', 'TensorFlow'],
        mobile: ['移动开发', 'React Native', 'Flutter', 'PWA'],
        design: ['UI设计', 'UX设计', 'Figma', '用户体验'],
    };

    return tagMap[category] || ['技术', '开发'];
}
