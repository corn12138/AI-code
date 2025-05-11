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

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器：添加认证令牌
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
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

        toast.error(message);
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
    const response = await api.post('/articles', article);
    return response.data;
};

export const updateArticle = async (id: string, article: UpdateArticleDto): Promise<Article> => {
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
