'use client';

import { formatDate } from '@/utils/date';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';
import { useAuth } from '@corn12138/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Article {
    id: string;
    title: string;
    slug?: string;
    summary?: string;
    published: boolean;
    status: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    author: {
        id: string;
        username: string;
    };
    category?: {
        id: string;
        name: string;
    };
    tags: Array<{
        id: string;
        name: string;
        color?: string;
    }>;
    _count: {
        comments: number;
    };
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchArticles();
    }, [isAuthenticated]);

    const fetchArticles = async () => {
        try {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/articles?published=true', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setArticles(data.articles || []);
            } else if (response.status === 401) {
                router.push('/login');
            } else {
                throw new Error('获取文章失败');
            }
        } catch (error) {
            console.error('获取文章失败:', error);
            setError('获取文章失败');
            toast.error('获取文章失败');
        } finally {
            setLoading(false);
        }
    };

    const handleUnpublish = async (articleId: string) => {
        if (!confirm('确定要取消发布这篇文章吗？')) return;

        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch(`/api/articles/${articleId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {}),
                },
                body: JSON.stringify({
                    published: false,
                    status: 'DRAFT'
                }),
            });

            if (response.ok) {
                toast.success('文章已取消发布');
                fetchArticles(); // 重新获取列表
            } else {
                throw new Error('取消发布失败');
            }
        } catch (error) {
            console.error('取消发布失败:', error);
            toast.error('取消发布失败');
        }
    };

    const handleDelete = async (articleId: string) => {
        if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return;

        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch(`/api/articles/${articleId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {},
            });

            if (response.ok) {
                toast.success('文章已删除');
                fetchArticles(); // 重新获取列表
            } else {
                throw new Error('删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            toast.error('删除失败');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchArticles}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 页面头部 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">已发布文章</h1>
                            <p className="mt-2 text-gray-600">
                                管理您已发布的文章
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                href="/dashboard/drafts"
                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                            >
                                查看草稿
                            </Link>
                            <Link
                                href="/editor"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                写新文章
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 文章列表 */}
                {articles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            还没有发布的文章
                        </h3>
                        <p className="text-gray-600 mb-6">
                            开始创作您的第一篇文章吧！
                        </p>
                        <Link
                            href="/editor"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            创建文章
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            文章
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            分类/标签
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            统计
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            发布时间
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {articles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {article.title}
                                                    </div>
                                                    {article.summary && (
                                                        <div className="text-sm text-gray-500 mt-1 max-w-md truncate">
                                                            {article.summary}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {article.category && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {article.category.name}
                                                        </span>
                                                    )}
                                                    <div className="flex flex-wrap gap-1">
                                                        {article.tags.slice(0, 2).map((tag) => (
                                                            <span
                                                                key={tag.id}
                                                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                        {article.tags.length > 2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{article.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    <div>浏览: {article.viewCount}</div>
                                                    <div>评论: {article._count.comments}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(article.publishedAt || article.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    {article.slug && (
                                                        <Link
                                                            href={`/blog/${article.slug}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            target="_blank"
                                                        >
                                                            查看
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={`/editor?id=${article.id}`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        编辑
                                                    </Link>
                                                    <button
                                                        onClick={() => handleUnpublish(article.id)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        取消发布
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
