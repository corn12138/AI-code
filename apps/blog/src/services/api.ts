import { Article, Tag } from '@/types';
import axios from 'axios';

// 安全地使用DOMPurify (避免SSR问题)
const sanitizeHtml = async (html: string): Promise<string> => {
    if (typeof window === 'undefined') {
        return html; // 服务端环境下不处理，或使用服务端安全的替代方案
    }

    // 在客户端环境下动态导入并使用
    const DOMPurify = (await import('dompurify')).default;
    return DOMPurify.sanitize(html);
};

const escapeHtml = (text: string): string => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 创建axios实例 - 服务端版本 (不使用Local Storage)
const createApiInstance = (isServer = true) => {
    const instance = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    });

    // 只在客户端添加拦截器
    if (!isServer && typeof window !== 'undefined') {
        // 添加请求拦截器
        instance.interceptors.request.use((config) => {
            try {
                let token = localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
                if (token) {
                    config.headers = {
                        ...config.headers,
                        'Authorization': `Bearer ${token}`
                    };
                }
            } catch (error) {
                console.error('Error accessing localStorage:', error);
            }
            return config;
        });
    }

    return instance;
};

// 使用示例数据的API方法，适用于服务端和客户端
export async function fetchArticles(params?: {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    author?: string;
    sort?: 'newest' | 'popular';
}): Promise<Article[]> {
    try {
        // 使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 300)); // 模拟延迟

        const sampleArticles: Article[] = Array(10).fill(null).map((_, index) => ({
            id: `article-${index + 1}`,
            title: `示例文章标题 ${index + 1}`,
            slug: `sample-article-${index + 1}`,
            excerpt: '这是文章的摘要，简要介绍文章内容...',
            content: '# 文章标题\n\n这是文章的正文内容。\n\n## 小标题\n\n- 列表项1\n- 列表项2',
            createdAt: new Date(Date.now() - index * 86400000).toISOString(),
            coverImage: `https://images.unsplash.com/photo-${1500000000 + index}?auto=format&fit=crop&w=800&q=60`,
            author: {
                id: 'user-1',
                username: '示例用户',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80',
            },
            tags: [
                { id: 'tag-1', name: 'JavaScript' },
                { id: 'tag-2', name: 'React' }
            ],
            views: Math.floor(Math.random() * 1000),
            likesCount: Math.floor(Math.random() * 50),
            readingTime: Math.floor(Math.random() * 10) + 2,
        }));

        // 应用过滤
        let filteredArticles = [...sampleArticles];

        if (params?.tag) {
            filteredArticles = filteredArticles.filter(
                article => article.tags?.some(tag => tag.name.toLowerCase() === params.tag?.toLowerCase())
            );
        }

        if (params?.search) {
            const searchLower = params.search.toLowerCase();
            filteredArticles = filteredArticles.filter(
                article =>
                    article.title.toLowerCase().includes(searchLower) ||
                    article.excerpt?.toLowerCase().includes(searchLower) ||
                    article.content.toLowerCase().includes(searchLower)
            );
        }

        if (params?.author) {
            filteredArticles = filteredArticles.filter(
                article => article.author.id === params.author || article.author.username.toLowerCase() === params.author?.toLowerCase()
            );
        }

        // 排序
        if (params?.sort) {
            if (params.sort === 'newest') {
                filteredArticles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            } else if (params.sort === 'popular') {
                filteredArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
            }
        }

        // 分页
        if (params?.page && params?.limit) {
            const start = (params.page - 1) * params.limit;
            const end = start + params.limit;
            filteredArticles = filteredArticles.slice(start, end);
        }

        return filteredArticles;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
    try {
        // 模拟实现
        await new Promise(resolve => setTimeout(resolve, 300));

        // 创建一个详细的模拟文章
        const article: Article = {
            id: id,
            title: `详细的示例文章 ${id}`,
            slug: `detailed-article-${id}`,
            excerpt: '这是一个详细的文章摘要，包含了这篇文章的主要内容概述...',
            content: `# 这是详细文章的标题

这是文章的引言部分。这篇文章将讨论一些重要的技术概念和实践方法。

## 第一部分：基础概念

这里我们介绍一些基础概念，帮助读者更好地理解后面的内容。

- 首先，我们需要了解什么是前端开发
- 其次，我们将探讨现代JavaScript框架的优势
- 最后，我们会介绍一些常用的开发工具

### 代码示例

\`\`\`javascript
function example() {
  const greeting = "Hello World";
  console.log(greeting);
  return greeting;
}
\`\`\`

## 第二部分：进阶技巧

在这一部分，我们将讨论一些进阶的开发技巧，帮助你提升代码质量。

1. 使用TypeScript增强类型安全
2. 实践函数式编程范式
3. 采用组件化设计方法

> 引用：优秀的代码不仅是能够运行的代码，更是能够维护的代码。

![示例图片](https://via.placeholder.com/800x400)

## 总结

通过本文的学习，我们掌握了从基础到进阶的多种开发概念和技巧，希望对你的开发工作有所帮助。

如果你有任何问题或建议，欢迎在评论区留言讨论。`,
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            coverImage: `https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=1000&q=80`,
            author: {
                id: 'user-1',
                username: '张技术',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80',
                bio: '资深前端工程师，对JavaScript、React和性能优化有深入研究，喜欢分享技术经验和最佳实践。',
            },
            tags: [
                { id: 'tag-1', name: 'JavaScript' },
                { id: 'tag-2', name: 'React' },
                { id: 'tag-3', name: 'NextJS' },
                { id: 'tag-4', name: '前端开发' }
            ],
            views: 1253,
            likesCount: 47,
            readingTime: 8,
        };

        return article;
    } catch (error) {
        console.error(`Error fetching article ${id}:`, error);
        return null;
    }
}

export async function fetchTags(): Promise<Tag[]> {
    try {
        // 模拟实现
        await new Promise(resolve => setTimeout(resolve, 200));

        return [
            { id: 'tag-1', name: 'JavaScript', count: 12 },
            { id: 'tag-2', name: 'React', count: 8 },
            { id: 'tag-3', name: 'TypeScript', count: 6 },
            { id: 'tag-4', name: 'Next.js', count: 5 },
            { id: 'tag-5', name: 'Node.js', count: 4 },
            { id: 'tag-6', name: 'CSS', count: 3 },
            { id: 'tag-7', name: 'HTML', count: 3 },
            { id: 'tag-8', name: 'GraphQL', count: 2 },
            { id: 'tag-9', name: 'API', count: 2 },
            { id: 'tag-10', name: 'Docker', count: 1 },
            { id: 'tag-11', name: 'AWS', count: 1 },
            { id: 'tag-12', name: 'DevOps', count: 1 },
        ];
    } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
    }
}

// 客户端API函数
export function createClientApi() {
    const clientApi = createApiInstance(false);

    // 可以添加客户端特有的错误处理，例如使用 toast 通知
    clientApi.interceptors.response.use(
        (response) => response,
        (error) => {
            if (typeof window !== 'undefined') {
                const message = error.response?.data?.message || '请求失败，请稍后重试';
                console.error('API错误:', message);

                // 如果有toast库
                try {
                    const { toast } = require('react-hot-toast');
                    toast.error(message);
                } catch (e) {
                    // 忽略导入错误
                }
            }
            return Promise.reject(error);
        }
    );

    return {
        uploadImage: async (file: File): Promise<string> => {
            try {
                // 模拟实现
                await new Promise(resolve => setTimeout(resolve, 1000));

                const randomId = Math.floor(Math.random() * 1000);
                return `https://images.unsplash.com/photo-${1500000000 + randomId}?auto=format&fit=crop&w=800&q=60`;
            } catch (error) {
                console.error('Error uploading image:', error);
                throw new Error('图片上传失败');
            }
        }
    };
}
