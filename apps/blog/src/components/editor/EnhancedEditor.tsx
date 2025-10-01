'use client';

import MarkdownEditor from '@/components/MarkdownEditor';
import { useAuth } from '@corn12138/hooks';
import {
    ArrowLeftIcon,
    ClockIcon,
    CloudArrowUpIcon,
    DocumentCheckIcon,
    EyeIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';
import { toast } from 'react-hot-toast';

// 动态导入写作助手组件
const WritingAssistant = dynamic(
    () => import('@/modules/chat/components/WritingAssistant'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }
);

interface ArticleDraft {
    id?: string;
    title: string;
    content: string;
    draftContent: string;
    summary?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    featuredImage?: string;
    categoryId?: string;
    tags?: Array<{ id: string; name: string; }>;
    lastSavedAt?: string;
    version?: number;
}

interface EnhancedEditorProps {
    draftId?: string; // 编辑现有草稿时传入
}

export default function EnhancedEditor({ draftId }: EnhancedEditorProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [article, setArticle] = useState<ArticleDraft>({
        title: '',
        content: '',
        draftContent: '',
        status: 'DRAFT',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        version: 1
    });

    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showAIChat, setShowAIChat] = useState(true);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    // 自动保存相关
    const autoSaveTimeout = useRef<NodeJS.Timeout>();
    const AUTO_SAVE_DELAY = 3000; // 3秒后自动保存

    // 添加状态来跟踪上次保存的内容
    const [lastSavedContent, setLastSavedContent] = useState<{ title: string, content: string }>({
        title: '',
        content: ''
    });

    // 加载现有草稿
    useEffect(() => {
        if (draftId) {
            loadDraft(draftId);
        }
    }, [draftId]);

    const loadDraft = async (id: string) => {
        try {
            const response = await fetch(`/api/articles/${id}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setArticle(data);
                setLastSavedAt(new Date(data.lastSavedAt || data.updatedAt));
                // 设置初始保存状态
                setLastSavedContent({
                    title: data.title || '',
                    content: data.content || data.draftContent || ''
                });
            } else {
                toast.error('加载草稿失败');
            }
        } catch (error) {
            console.error('加载草稿失败:', error);
            toast.error('加载草稿失败');
        }
    };

    // 检查是否需要自动保存
    const shouldAutoSave = useCallback(() => {
        // 检查是否有最小内容要求
        const hasMinimumContent = article.title.trim().length > 0 || article.content.trim().length > 2;

        // 检查内容是否有实际变化
        const titleChanged = article.title !== lastSavedContent.title;
        const contentChanged = article.content !== lastSavedContent.content;
        const hasChanges = titleChanged || contentChanged;

        // 检查是否是有意义的变化（避免只是空格或换行的变化）
        const meaningfulChange =
            Math.abs(article.title.trim().length - lastSavedContent.title.trim().length) > 0 ||
            Math.abs(article.content.trim().length - lastSavedContent.content.trim().length) > 2;

        return hasMinimumContent && hasChanges && meaningfulChange;
    }, [article.title, article.content, lastSavedContent]);

    // 自动保存函数
    const autoSave = useCallback(async () => {
        if (!shouldAutoSave()) return;

        setAutoSaveStatus('saving');
        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch('/api/articles/drafts', {
                method: article.id ? 'PUT' : 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {}),
                },
                body: JSON.stringify({
                    id: article.id,
                    ...article,
                    draftContent: article.content, // 保存到草稿内容
                    lastSavedAt: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const savedArticle = responseData.draft || responseData;
                setArticle(prev => ({ ...prev, id: savedArticle.id }));
                setAutoSaveStatus('saved');
                setLastSavedAt(new Date());

                // 更新上次保存的内容状态
                setLastSavedContent({
                    title: article.title,
                    content: article.content
                });

                // 3秒后重置状态
                setTimeout(() => setAutoSaveStatus('idle'), 3000);
            } else {
                setAutoSaveStatus('error');
            }
        } catch (error) {
            console.error('自动保存失败:', error);
            setAutoSaveStatus('error');
        }
    }, [article, shouldAutoSave]);

    // 内容变化时触发自动保存（优化后的逻辑）
    useEffect(() => {
        // 清除之前的定时器
        if (autoSaveTimeout.current) {
            clearTimeout(autoSaveTimeout.current);
        }

        // 只有当确实需要保存时才设置定时器
        if (shouldAutoSave()) {
            autoSaveTimeout.current = setTimeout(() => {
                autoSave();
            }, AUTO_SAVE_DELAY);
        }

        return () => {
            if (autoSaveTimeout.current) {
                clearTimeout(autoSaveTimeout.current);
            }
        };
    }, [article.title, article.content, autoSave, shouldAutoSave]);

    const handleFieldChange = (field: keyof ArticleDraft, value: any) => {
        setArticle(prev => ({ ...prev, [field]: value }));
    };

    const handleManualSave = async () => {
        if (!article.title.trim()) {
            toast.error('请输入文章标题');
            return;
        }

        setIsSaving(true);
        try {
            await autoSave();
            toast.success('草稿保存成功！');
        } catch (error) {
            toast.error('保存失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!article.title.trim()) {
            toast.error('请输入文章标题');
            return;
        }

        if (!article.content.trim()) {
            toast.error('请输入文章内容');
            return;
        }

        setIsSaving(true);
        try {
            if (!article.id) {
                // 新文章：直接创建并发布
                const csrfToken = await ensureCsrfToken();
                const response = await fetch('/api/articles', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        title: article.title,
                        content: article.content,
                        summary: article.summary,
                        metaTitle: article.metaTitle,
                        metaDescription: article.metaDescription,
                        keywords: article.keywords,
                        featuredImage: article.featuredImage,
                        categoryId: article.categoryId,
                        tagIds: article.tags?.map(tag => tag.id),
                        published: true, // 直接设置为已发布
                    }),
                });

                if (response.ok) {
                    toast.success('文章发布成功！');
                    router.push('/dashboard/articles');
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.error || '发布失败，请重试');
                }
            } else {
                // 已存在的文章：使用发布端点
                const csrfToken = await ensureCsrfToken();
                const response = await fetch(`/api/articles/${article.id}/publish`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        title: article.title,
                        content: article.content,
                        metaTitle: article.metaTitle,
                        metaDescription: article.metaDescription,
                        keywords: article.keywords,
                    }),
                });

                if (response.ok) {
                    toast.success('文章发布成功！');
                    router.push('/dashboard/articles');
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.error || '发布失败，请重试');
                }
            }
        } catch (error) {
            console.error('发布文章失败:', error);
            toast.error('发布失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        if (article.id) {
            window.open(`/article/${article.id}?preview=true`, '_blank');
        } else {
            toast.error('请先保存草稿再预览');
        }
    };

    const getAutoSaveStatusIcon = () => {
        switch (autoSaveStatus) {
            case 'saving':
                return <CloudArrowUpIcon className="h-4 w-4 animate-spin text-blue-500" />;
            case 'saved':
                return <DocumentCheckIcon className="h-4 w-4 text-green-500" />;
            case 'error':
                return <CloudArrowUpIcon className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getAutoSaveStatusText = () => {
        switch (autoSaveStatus) {
            case 'saving':
                return '保存中...';
            case 'saved':
                return `已保存 · ${lastSavedAt?.toLocaleTimeString()}`;
            case 'error':
                return '保存失败';
            default:
                return lastSavedAt ? `上次保存 · ${lastSavedAt.toLocaleTimeString()}` : '';
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* 顶部工具栏 */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/drafts"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        返回草稿
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {article.id ? '编辑文章' : '创建新文章'}
                    </h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {getAutoSaveStatusIcon()}
                        <span>{getAutoSaveStatusText()}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowAIChat(!showAIChat)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${showAIChat
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {showAIChat ? 'AI助手' : '显示AI'}
                    </button>

                    <button
                        onClick={handlePreview}
                        disabled={!article.id}
                        className="flex items-center space-x-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        <EyeIcon className="h-4 w-4" />
                        <span>预览</span>
                    </button>

                    <button
                        onClick={handleManualSave}
                        disabled={isSaving}
                        className="flex items-center space-x-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                    >
                        <ClockIcon className="h-4 w-4" />
                        <span>保存草稿</span>
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                    >
                        取消
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={isSaving || !article.title.trim() || !article.content.trim()}
                        className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        <ShareIcon className="h-4 w-4" />
                        <span>{isSaving ? '发布中...' : '发布文章'}</span>
                    </button>
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左侧编辑区域 */}
                <div className={`flex flex-col transition-all duration-300 ${showAIChat ? 'w-2/3' : 'w-full'}`}>
                    {/* 标题输入区域 */}
                    <div className="p-6 bg-white border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="输入文章标题..."
                            value={article.title}
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            className="w-full px-0 py-3 text-3xl font-bold border-none focus:outline-none placeholder-gray-400"
                        />
                    </div>

                    {/* SEO信息区域 */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SEO标题
                                </label>
                                <input
                                    type="text"
                                    value={article.metaTitle || ''}
                                    onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                                    placeholder="搜索引擎显示的标题"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    描述
                                </label>
                                <input
                                    type="text"
                                    value={article.metaDescription || ''}
                                    onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                                    placeholder="文章描述（160字以内）"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    关键词
                                </label>
                                <input
                                    type="text"
                                    value={(article.keywords || []).join(', ')}
                                    onChange={(e) => handleFieldChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                                    placeholder="用逗号分隔关键词"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 内容编辑区域 */}
                    <div className="flex-1 p-6 bg-white overflow-hidden">
                        <MarkdownEditor
                            value={article.content}
                            onChange={(value) => handleFieldChange('content', value)}
                        />
                    </div>
                </div>

                {/* 右侧AI Chat区域 */}
                {showAIChat && (
                    <div className="w-1/3 border-l border-gray-200 bg-white">
                        <div className="h-full flex flex-col">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <h3 className="font-semibold text-gray-800">AI 写作助手</h3>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">获取写作灵感和技术建议</p>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <WritingAssistant />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
