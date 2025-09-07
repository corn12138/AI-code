// 'use client';

import { apiService } from '@/services/api';
import { useCallback, useState } from 'react';

interface Post {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    status: 'draft' | 'published' | 'archived';
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    viewCount: number;
    likeCount: number;
    commentCount: number;
    featuredImage?: string;
    slug: string;
}

interface PostFilters {
    status: 'all' | 'draft' | 'published' | 'archived';
    author: 'all' | string;
    tags: string[];
}

interface UsePostManagementReturn {
    posts: Post[];
    currentPost: Post | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    filters: PostFilters;
    selectedPost: Post | null;
    loadPosts: () => Promise<void>;
    loadPost: (id: string) => Promise<void>;
    createPost: (postData: Partial<Post>) => Promise<void>;
    updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    searchPosts: (query: string) => Promise<void>;
    publishPost: (id: string) => Promise<void>;
    unpublishPost: (id: string) => Promise<void>;
    selectPost: (post: Post) => void;
    clearSelection: () => void;
    setFilters: (filters: PostFilters) => void;
    clearFilters: () => void;
    setError: (error: string) => void;
    clearError: () => void;
}

export const usePostManagement = (): UsePostManagementReturn => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<PostFilters>({
        status: 'all',
        author: 'all',
        tags: [],
    });
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getPosts();
            setPosts(response.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载文章失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPost = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getPost(id);
            setCurrentPost(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载文章失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const createPost = useCallback(async (postData: Partial<Post>) => {
        try {
            setLoading(true);
            setError(null);

            // 验证文章数据
            if (!postData.title || !postData.content) {
                throw new Error('文章标题和内容为必填字段');
            }

            if (postData.title && postData.title.length > 100) {
                throw new Error('文章标题不能超过 100 字符');
            }

            if (postData.content && postData.content.length > 10000) {
                throw new Error('文章内容不能超过 10000 字符');
            }

            if (postData.tags && postData.tags.length > 10) {
                throw new Error('标签数量不能超过 10 个');
            }

            const response = await apiService.createPost(postData);
            const newPost = response.data;
            setPosts(prev => [...prev, newPost]);
        } catch (err) {
            setError(err instanceof Error ? err.message : '创建文章失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
        try {
            setLoading(true);
            setError(null);

            const postExists = posts.find(p => p.id === id);
            if (!postExists) {
                throw new Error('文章不存在');
            }

            const response = await apiService.updatePost(id, updates);
            const updatedPost = response.data;
            setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));

            if (selectedPost?.id === id) {
                setSelectedPost(updatedPost);
            }

            if (currentPost?.id === id) {
                setCurrentPost(updatedPost);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新文章失败');
        } finally {
            setLoading(false);
        }
    }, [posts, selectedPost, currentPost]);

    const deletePost = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const postExists = posts.find(p => p.id === id);
            if (!postExists) {
                throw new Error('文章不存在');
            }

            await apiService.deletePost(id);
            setPosts(prev => prev.filter(p => p.id !== id));

            if (selectedPost?.id === id) {
                setSelectedPost(null);
            }

            if (currentPost?.id === id) {
                setCurrentPost(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '删除文章失败');
        } finally {
            setLoading(false);
        }
    }, [posts, selectedPost, currentPost]);

    const publishPost = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.publishPost(id);
            const publishedPost = response.data;
            setPosts(prev => prev.map(p => p.id === id ? publishedPost : p));

            if (selectedPost?.id === id) {
                setSelectedPost(publishedPost);
            }

            if (currentPost?.id === id) {
                setCurrentPost(publishedPost);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '发布文章失败');
        } finally {
            setLoading(false);
        }
    }, [selectedPost, currentPost]);

    const unpublishPost = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.unpublishPost(id);
            const unpublishedPost = response.data;
            setPosts(prev => prev.map(p => p.id === id ? unpublishedPost : p));

            if (selectedPost?.id === id) {
                setSelectedPost(unpublishedPost);
            }

            if (currentPost?.id === id) {
                setCurrentPost(unpublishedPost);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '取消发布文章失败');
        } finally {
            setLoading(false);
        }
    }, [selectedPost, currentPost]);

    const searchPosts = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            setSearchQuery(query);

            if (!query.trim()) {
                await loadPosts();
                return;
            }

            const response = await apiService.searchPosts(query);
            setPosts(response.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '搜索文章失败');
        } finally {
            setLoading(false);
        }
    }, [loadPosts]);

    const selectPost = useCallback((post: Post) => {
        setSelectedPost(post);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedPost(null);
    }, []);

    const updateFilters = useCallback((newFilters: PostFilters) => {
        setFilters(newFilters);
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            status: 'all',
            author: 'all',
            tags: [],
        });
    }, []);

    const setErrorMessage = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    const clearErrorMessage = useCallback(() => {
        setError(null);
    }, []);

    return {
        posts,
        currentPost,
        loading,
        error,
        searchQuery,
        filters,
        selectedPost,
        loadPosts,
        loadPost,
        createPost,
        updatePost,
        deletePost,
        searchPosts,
        publishPost,
        unpublishPost,
        selectPost,
        clearSelection,
        setFilters: updateFilters,
        clearFilters: clearAllFilters,
        setError: setErrorMessage,
        clearError: clearErrorMessage,
    };
};
