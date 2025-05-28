import {
    Article,
    ArticleFilters,
    Comment,
    CreateArticleDto,
    CreateCommentDto,
    Tag,
    UpdateArticleDto
} from '@/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

// Define sanitization utilities
const sanitizeHtml = (html: string): string => {
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

// 安全地将Markdown转换为HTML
const markdownToSafeHtml = (markdown: string): string => {
    // 简单实现 - 在实际应用中应使用专门的Markdown解析库
    // 可以考虑使用 marked 或 remark 等库，并结合 sanitizeHtml
    return sanitizeHtml(markdown);
};

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 确保包含Cookie
});

// 请求拦截器：添加认证令牌
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // axios会自动从cookie中获取XSRF-TOKEN并设置为X-XSRF-TOKEN头
        // 这是标准行为，无需手动处理
    }
    return config;
});

// 响应拦截器：处理错误
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 处理常见错误
        const message =
            error.response?.data?.message ||
            '请求失败，请稍后重试';

        // 特殊处理CSRF错误
        if (error.response?.status === 401 && error.response?.data?.message?.includes('CSRF')) {
          console.error('CSRF token validation failed.');
          toast.error('安全验证失败，请刷新页面或重新登录');
        } else {
          toast.error(message);
        }

        return Promise.reject(error);
    }
);

// 文章相关API
export const fetchArticles = async (filters?: ArticleFilters): Promise<Article[]> => {
    try {
        const params = filters || {};
        const response = await api.get('/articles', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export const fetchArticleById = async (id: string): Promise<Article> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
};

export const createArticle = async (article: CreateArticleDto): Promise<Article> => {
    // 如果是Markdown格式，进行安全处理
    if ((article as any).contentFormat === 'markdown' && article.content) {
        article.content = markdownToSafeHtml(article.content);
    } else if (article.content) {
        // 纯HTML内容需要净化
        article.content = sanitizeHtml(article.content);
    }
    
    // 标题等其他文本字段进行XSS防护
    article.title = escapeHtml(article.title);
    if (article.summary) {
        article.summary = escapeHtml(article.summary);
    }
    
    const response = await api.post('/articles', article);
    return response.data;
};

export const updateArticle = async (id: string, article: UpdateArticleDto): Promise<Article> => {
    // 如果是Markdown格式，进行安全处理
    if ('contentFormat' in article && (article as any).contentFormat === 'markdown' && article.content) {
        article.content = markdownToSafeHtml(article.content);
    } else if (article.content) {
        // 纯HTML内容需要净化
        article.content = sanitizeHtml(article.content);
    }
    
    // 标题等其他文本字段进行XSS防护
    if (article.title) article.title = escapeHtml(article.title);
    if ('summary' in article && article.summary) article.summary = escapeHtml(article.summary);
    
    const response = await api.put(`/articles/${id}`, article);
    return response.data;
};

export const deleteArticle = async (id: string): Promise<void> => {
    await api.delete(`/articles/${id}`);
};

// 标签相关API
export const fetchTags = async (): Promise<Tag[]> => {
    try {
        const response = await api.get('/tags');
        return response.data;
    } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
    }
};

// 评论相关API
export const fetchComments = async (articleId: string): Promise<Comment[]> => {
    const response = await api.get(`/articles/${articleId}/comments`);
    return response.data;
};

export const createComment = async (comment: CreateCommentDto): Promise<Comment> => {
    const response = await api.post('/comments', comment);
    return response.data;
};

export const deleteComment = async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
};

// 图片上传API
export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.url;
};
