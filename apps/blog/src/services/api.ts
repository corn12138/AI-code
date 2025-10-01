import { Article, Tag } from '@/types';
import axios from 'axios';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';

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

// 使用Next.js内部API routes
const getApiBaseUrl = (isServer: boolean) => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // 在服务端使用完整URL，在客户端使用相对URL
    if (isServer) {
        return 'http://localhost:3000/api';
    } else {
        return '/api';
    }
};

// 创建axios实例 - 服务端版本 (不使用Local Storage)
const createApiInstance = (isServer = true) => {
    const instance = axios.create({
        baseURL: getApiBaseUrl(isServer),
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
        withCredentials: true,
        xsrfCookieName: 'csrf_token',
        xsrfHeaderName: getCsrfHeaderName(),
    });

    // 只在客户端添加拦截器
    if (!isServer && typeof window !== 'undefined') {
        // 添加请求拦截器
        instance.interceptors.request.use(async (config) => {
            try {
                if ((config.method || 'GET').toUpperCase() !== 'GET') {
                    const csrfToken = await ensureCsrfToken();
                    if (csrfToken) {
                        config.headers = {
                            ...config.headers,
                            [getCsrfHeaderName()]: csrfToken,
                        };
                    }
                }
            } catch (error) {
                console.warn('Failed to attach CSRF token', error);
            }
            return config;
        });
    }

    return instance;
};

// 真实API调用方法，连接到后端服务
export async function fetchArticles(params?: {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    author?: string;
    sort?: 'newest' | 'popular';
}): Promise<{ articles: Article[], pagination?: any }> {
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

        const response = await api.get(`/articles?${queryParams.toString()}`);

        // Next.js API返回的格式：{ articles: [], pagination: {} }
        const articlesData = response.data.articles || response.data;

        // 数据转换：将后端格式转换为前端所需格式
        const articles = articlesData.map((article: any) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.summary || (article.content ? article.content.substring(0, 200) + '...' : '暂无摘要'),
            content: article.content,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.createdAt,
            coverImage: article.featuredImage,
            author: {
                id: article.author?.id || article.authorId,
                username: article.author?.username || '匿名用户',
                avatar: article.author?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80',
                bio: article.author?.bio,
                createdAt: article.author?.createdAt || new Date().toISOString()
            },
            tags: article.tags?.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                count: tag.articleCount
            })) || [],
            viewCount: article.viewCount || 0, // 修正字段名
            views: article.viewCount || 0, // 保持兼容性
            likeCount: Math.floor(Math.random() * 50), // 暂时随机生成，后续可添加真实点赞功能
            readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 200)) // 估算阅读时间，最少1分钟
        }));

        // 如果API返回了分页信息，一并返回
        return {
            articles,
            pagination: response.data.pagination
        };
    } catch (error) {
        console.error('Error fetching articles:', error);

        // 如果API调用失败，返回空数组而不是模拟数据
        return { articles: [], pagination: null };
    }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
    try {
        const api = createApiInstance(typeof window === 'undefined');
        // 使用公开的文章API端点，不需要认证
        const response = await api.get(`/articles/public/${id}`);

        const article = response.data;

        // 数据转换：将后端格式转换为前端所需格式
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || article.summary || (article.content ? article.content.substring(0, 200) + '...' : '暂无摘要'),
            content: article.content,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.publishedAt || article.createdAt,
            coverImage: article.coverImage || article.featuredImage,
            author: {
                id: article.author?.id || 'unknown',
                username: article.author?.username || '匿名用户',
                avatar: article.author?.avatar || '/default-avatar.svg',
                bio: article.author?.bio,
                createdAt: article.author?.createdAt || new Date().toISOString()
            },
            tags: article.tags?.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                count: tag.articleCount
            })) || [],
            viewCount: article.viewCount || 0,
            likeCount: Math.floor(Math.random() * 50), // 暂时随机生成，后续可添加真实点赞功能
            commentCount: article.commentCount || 0,
            readingTime: article.readingTime || Math.ceil((article.content?.length || 0) / 200) // 使用API返回的或计算
        };
    } catch (error) {
        console.error('Error fetching article by id:', error);
        return null;
    }
}

export async function fetchTags(): Promise<Tag[]> {
    try {
        const api = createApiInstance(typeof window === 'undefined');
        const response = await api.get('/tags?includeCount=true');

        // Next.js API返回格式：{ tags: Tag[] }
        const tagsData = response.data.tags || response.data;

        // 数据转换：将后端格式转换为前端所需格式
        return tagsData.map((tag: any) => ({
            id: tag.id,
            name: tag.name,
            count: tag._count?.articles || tag.articleCount || 0
        }));
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

export const api = {
    // 文章相关
    articles: {
        list: (params?: any) => createApiInstance(typeof window === 'undefined').get('/articles', { params }),
        get: (id: string) => createApiInstance(typeof window === 'undefined').get(`/articles/${id}`),
        create: (data: any) => createApiInstance(typeof window === 'undefined').post('/articles', data),
        update: (id: string, data: any) => createApiInstance(typeof window === 'undefined').put(`/articles/${id}`, data),
    },
    // 标签相关
    tags: {
        list: () => createApiInstance(typeof window === 'undefined').get('/tags'),
        articles: (tag: string) => createApiInstance(typeof window === 'undefined').get(`/tags/${tag}/articles`),
    },
};

// 图片上传函数
export const uploadImage = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await createApiInstance(false).post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.url || response.data.data?.url;
    } catch (error) {
        console.error('图片上传失败:', error);
        throw new Error('图片上传失败');
    }
};
