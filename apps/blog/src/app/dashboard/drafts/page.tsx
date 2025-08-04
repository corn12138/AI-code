'use client';

import { useAuth } from '@corn12138/hooks';
import {
    ArrowLeftIcon,
    ClockIcon,
    DocumentCheckIcon,
    DocumentTextIcon,
    EyeIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Draft {
    id: string;
    title: string;
    content: string;
    draftContent: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[] | string;
    lastSavedAt: string;
    updatedAt: string;
    createdAt: string;
    version: number;
    wordCount?: number;
}

export default function DraftsPage() {
    const { user } = useAuth();
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
    const [filterStatus, setFilterStatus] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            const response = await fetch('/api/articles/drafts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // 计算字数
                const draftsWithWordCount = (data.drafts || data).map((draft: Draft) => ({
                    ...draft,
                    wordCount: (draft.content || draft.draftContent || '').length
                }));
                setDrafts(draftsWithWordCount);
            } else {
                toast.error('加载草稿失败');
            }
        } catch (error) {
            console.error('加载草稿失败:', error);
            toast.error('加载草稿失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDraft = async (id: string, title: string) => {
        if (!confirm(`确定要删除草稿《${title}》吗？此操作不可撤销。`)) return;

        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setDrafts(prev => prev.filter(draft => draft.id !== id));
                toast.success('草稿已删除');
            } else {
                toast.error('删除失败');
            }
        } catch (error) {
            console.error('删除草稿失败:', error);
            toast.error('删除失败');
        }
    };

    const handlePublishDraft = async (id: string, title: string) => {
        if (!confirm(`确定要发布文章《${title}》吗？`)) return;

        try {
            const response = await fetch(`/api/articles/${id}/publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                await fetchDrafts(); // 重新加载列表
                toast.success('文章发布成功！');
            } else {
                toast.error('发布失败');
            }
        } catch (error) {
            console.error('发布失败:', error);
            toast.error('发布失败');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}分钟前`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}小时前`;
        } else if (diffInHours < 24 * 7) {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        草稿
                    </span>
                );
            case 'PUBLISHED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <DocumentCheckIcon className="w-3 h-3 mr-1" />
                        已发布
                    </span>
                );
            default:
                return null;
        }
    };

    // 过滤和排序
    const filteredDrafts = drafts
        .filter(draft => {
            if (filterStatus !== 'all' && draft.status !== filterStatus) return false;
            if (searchTerm && !draft.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'created':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'updated':
                default:
                    return new Date(b.lastSavedAt || b.updatedAt).getTime() - new Date(a.lastSavedAt || a.updatedAt).getTime();
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">加载草稿中...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                    返回仪表板
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">草稿管理</h1>
                            <p className="text-gray-600 mt-1">管理您的文章草稿，编辑和发布内容</p>
                        </div>
                        <Link
                            href="/editor"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            新建文章
                        </Link>
                    </div>
                </div>

                {/* 搜索和过滤 */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* 搜索框 */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索草稿..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 状态过滤 */}
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="h-5 w-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">全部状态</option>
                                <option value="DRAFT">草稿</option>
                                <option value="PUBLISHED">已发布</option>
                            </select>
                        </div>

                        {/* 排序 */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="updated">最近更新</option>
                            <option value="created">创建时间</option>
                            <option value="title">标题排序</option>
                        </select>
                    </div>
                </div>

                {/* 草稿列表 */}
                {filteredDrafts.length > 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {filteredDrafts.map((draft) => (
                                <div key={draft.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {draft.title || '无标题草稿'}
                                                </h3>
                                                {getStatusBadge(draft.status)}
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {draft.metaDescription ||
                                                    (draft.content || draft.draftContent)?.substring(0, 150) + '...' ||
                                                    '暂无内容'}
                                            </p>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>最后保存: {formatDate(draft.lastSavedAt || draft.updatedAt)}</span>
                                                <span>版本: v{draft.version}</span>
                                                <span>字数: {draft.wordCount?.toLocaleString()}</span>
                                                {draft.keywords && (
                                                    <span>关键词: {
                                                        Array.isArray(draft.keywords)
                                                            ? draft.keywords.slice(0, 2).join(', ')
                                                            : draft.keywords.split(',').slice(0, 2).map(k => k.trim()).join(', ')
                                                    }</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            <Link
                                                href={`/editor/${draft.id}`}
                                                className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                                title="编辑"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>

                                            <Link
                                                href={`/article/${draft.id}?preview=true`}
                                                target="_blank"
                                                className="p-2 text-green-600 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors"
                                                title="预览"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>

                                            {draft.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handlePublishDraft(draft.id, draft.title)}
                                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                    title="发布"
                                                >
                                                    发布
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteDraft(draft.id, draft.title)}
                                                className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="删除"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            {searchTerm || filterStatus !== 'all' ? '没有找到匹配的草稿' : '暂无草稿'}
                        </h3>
                        <p className="mt-2 text-gray-500">
                            {searchTerm || filterStatus !== 'all'
                                ? '尝试调整搜索条件或过滤器'
                                : '开始创建您的第一篇文章吧'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <div className="mt-6">
                                <Link
                                    href="/editor"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    新建文章
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* 统计信息 */}
                {drafts.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-md">
                                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {drafts.filter(d => d.status === 'DRAFT').length}
                                    </h4>
                                    <p className="text-sm text-gray-500">草稿文章</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-md">
                                    <DocumentCheckIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {drafts.filter(d => d.status === 'PUBLISHED').length}
                                    </h4>
                                    <p className="text-sm text-gray-500">已发布</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-md">
                                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {drafts.reduce((total, draft) => total + (draft.wordCount || 0), 0).toLocaleString()}
                                    </h4>
                                    <p className="text-sm text-gray-500">总字数</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 