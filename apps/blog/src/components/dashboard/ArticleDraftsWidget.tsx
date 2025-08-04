'use client';

import {
    DocumentTextIcon,
    EyeIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ArticleDraftsWidget() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const response = await fetch('/api/articles/drafts', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setDrafts((data.drafts || data).slice(0, 5)); // 只显示最近5篇
                }
            } catch (error) {
                console.error('Failed to fetch drafts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDrafts();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteDraft = async (id: string) => {
        if (!confirm('确定要删除这篇草稿吗？')) return;

        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setDrafts(drafts.filter((draft: any) => draft.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete draft:', error);
        }
    };

    return (
        <div className="bg-white overflow-hidden rounded-lg shadow">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">文章草稿</h3>
                    <Link
                        href="/dashboard/drafts"
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        查看全部
                    </Link>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : drafts.length > 0 ? (
                        <div className="space-y-4">
                            {drafts.map((draft: any) => (
                                <div key={draft.id} className="flex items-center space-x-3 group">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {draft.title || '无标题草稿'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(draft.lastSavedAt || draft.updatedAt)}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/editor/${draft.id}`}
                                            className="p-1 text-blue-600 hover:text-blue-500"
                                            title="编辑"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={`/article/${draft.id}`}
                                            className="p-1 text-green-600 hover:text-green-500"
                                            title="预览"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteDraft(draft.id)}
                                            className="p-1 text-red-600 hover:text-red-500"
                                            title="删除"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无草稿</h3>
                            <p className="mt-1 text-sm text-gray-500">开始创建您的第一篇文章吧</p>
                            <div className="mt-6">
                                <Link
                                    href="/editor"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    新建文章
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 