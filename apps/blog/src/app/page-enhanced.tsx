'use client';

import {
    useApi,
    useAuthSecure,
    useFormEnhanced,
    usePageState,
    useSmoothRouter,
    useUIInteraction,
} from '@corn12138/hooks';
import {
    BookmarkIcon,
    ChatBubbleLeftIcon,
    ClockIcon,
    EyeIcon,
    FireIcon,
    HeartIcon,
    PlusIcon,
    ShareIcon,
    TrophyIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import MainLayoutEnhanced from '../components/layout/MainLayoutEnhanced';
import TopNavbar from '../components/layout/TopNavbar';

// ==================== 类型定义 ====================

interface Article {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        company?: string;
        verified?: boolean;
    };
    tags: string[];
    likeCount: number;
    commentCount: number;
    viewCount: number;
    shareCount: number;
    publishedAt: string;
    updatedAt: string;
    readTime: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    isPinned?: boolean;
    isFeatured?: boolean;
    coverImage?: string;
}

interface FilterOptions {
    type: 'recommended' | 'latest' | 'hot' | 'following';
    timeRange?: 'today' | 'week' | 'month' | 'all';
    tags?: string[];
}

// ==================== 模拟数据 ====================

const mockArticles: Article[] = [
    {
        id: '1',
        title: 'Next.js 14 全栈开发实战：从零到生产部署的完整指南',
        content: 'Next.js 14 带来了许多激动人心的新特性，包括 App Router、Server Components、Streaming 等...',
        excerpt: 'Next.js 14 带来了许多激动人心的新特性，本文将带你从零开始构建一个完整的全栈应用，并部署到生产环境。',
        author: {
            id: 'user1',
            name: '前端小王',
            company: '字节跳动',
            verified: true,
        },
        tags: ['Next.js', 'React', '全栈开发', 'TypeScript'],
        likeCount: 1284,
        commentCount: 123,
        viewCount: 15678,
        shareCount: 89,
        publishedAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        readTime: 12,
        isLiked: true,
        isBookmarked: true,
        isFeatured: true,
        coverImage: '/images/nextjs-guide.jpg',
    },
    {
        id: '2',
        title: 'AI 驱动的代码生成：如何用 ChatGPT 和 GitHub Copilot 提升开发效率',
        content: '在这个 AI 飞速发展的时代，ChatGPT 和 GitHub Copilot 等工具正在改变我们的开发方式...',
        excerpt: '探索如何有效利用 AI 工具来提升编程效率，包括最佳实践、技巧和注意事项。',
        author: {
            id: 'user2',
            name: 'AI开发者',
            company: 'OpenAI',
            verified: true,
        },
        tags: ['AI', 'ChatGPT', 'GitHub Copilot', '开发效率'],
        likeCount: 892,
        commentCount: 67,
        viewCount: 8934,
        shareCount: 156,
        publishedAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-14T09:15:00Z',
        readTime: 8,
        isLiked: false,
        isBookmarked: false,
        isPinned: true,
        coverImage: '/images/ai-coding.jpg',
    },
    {
        id: '3',
        title: 'TypeScript 5.3 新特性深度解析：Import Attributes 和性能优化',
        content: 'TypeScript 5.3 正式发布！新版本带来了 Import Attributes、性能优化等重要更新...',
        excerpt: 'TypeScript 5.3 带来了 Import Attributes、更好的性能优化和开发体验改进。',
        author: {
            id: 'user3',
            name: 'TS专家',
            company: 'Microsoft',
            verified: true,
        },
        tags: ['TypeScript', 'JavaScript', '新特性', '性能优化'],
        likeCount: 567,
        commentCount: 89,
        viewCount: 6789,
        shareCount: 45,
        publishedAt: '2024-01-13T16:45:00Z',
        updatedAt: '2024-01-13T17:30:00Z',
        readTime: 15,
        isLiked: false,
        isBookmarked: true,
        coverImage: '/images/typescript-update.jpg',
    },
];

const trendingTopics = [
    { topic: 'Next.js 14 新特性', count: '2.1k 讨论', trend: 'up' },
    { topic: 'AI 编程助手', count: '1.8k 讨论', trend: 'up' },
    { topic: 'React Server Components', count: '1.2k 讨论', trend: 'stable' },
    { topic: 'TypeScript 最佳实践', count: '934 讨论', trend: 'down' },
    { topic: 'Web3 开发入门', count: '756 讨论', trend: 'up' },
];

const weeklyRanking = [
    { rank: 1, author: '前端大师', score: '2.1k', avatar: '/avatars/master.jpg' },
    { rank: 2, author: 'React专家', score: '1.8k', avatar: '/avatars/react.jpg' },
    { rank: 3, author: 'Vue开发者', score: '1.5k', avatar: '/avatars/vue.jpg' },
    { rank: 4, author: 'Node.js高手', score: '1.2k', avatar: '/avatars/node.jpg' },
    { rank: 5, author: 'TypeScript忍者', score: '987', avatar: '/avatars/ts.jpg' },
];

// ==================== 主组件 ====================

export default function HomePageEnhanced() {
    const { isAuthenticated, user } = useAuthSecure();
    const { push, preload } = useSmoothRouter();
    const { saveCustomData, getCustomData } = usePageState();
    const {
        ripple,
        hapticFeedback,
        fadeIn,
        isReducedMotion,
        isTouchDevice,
        smoothScrollTo,
    } = useUIInteraction();

    // 状态管理
    const [articles, setArticles] = useState<Article[]>(mockArticles);
    const [currentFilter, setCurrentFilter] = useState<FilterOptions>(() => {
        return getCustomData('homeFilter') || { type: 'recommended' };
    });
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // 引用管理
    const articleRefs = useRef<Map<string, HTMLElement>>(new Map());
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // API hooks
    const {
        request: likeArticle,
        loading: likingArticle,
    } = useApi({
        url: '/api/articles/{id}/like',
        method: 'POST',
    });

    const {
        request: bookmarkArticle,
        loading: bookmarkingArticle,
    } = useApi({
        url: '/api/articles/{id}/bookmark',
        method: 'POST',
    });

    // 表单管理 - 快速发布
    const quickPostForm = useFormEnhanced({
        content: {
            defaultValue: '',
            validation: {
                required: true,
                minLength: 10,
                maxLength: 280,
            },
            validateOnChange: true,
            debounceMs: 300,
        },
        $form: {
            onSubmit: async (data: any) => {
                if (!isAuthenticated) {
                    toast.error('请先登录');
                    await push('/login');
                    return;
                }

                try {
                    // 模拟发布
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    toast.success('发布成功！');
                    quickPostForm.reset();
                } catch (error) {
                    toast.error('发布失败，请重试');
                }
            },
        },
    }, 'quickPost');

    // ==================== 事件处理 ====================

    const handleFilterChange = useCallback(async (filter: FilterOptions) => {
        setCurrentFilter(filter);
        saveCustomData('homeFilter', filter);

        setIsLoading(true);
        setPage(1);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 重置文章列表
        setArticles(mockArticles);
        setIsLoading(false);
        setHasMore(true);

        // 滚动到顶部
        smoothScrollTo(document.body);
    }, [saveCustomData, smoothScrollTo]);

    const handleLikeArticle = useCallback(async (article: Article, event: React.MouseEvent) => {
        if (!isReducedMotion) {
            const target = event.currentTarget as HTMLElement;
            ripple(target, event);
        }

        if (isTouchDevice) {
            hapticFeedback('light');
        }

        if (!isAuthenticated) {
            toast.error('请先登录');
            await push('/login');
            return;
        }

        try {
            const newLikedState = !article.isLiked;

            // 乐观更新
            setArticles(prev => prev.map(a =>
                a.id === article.id
                    ? {
                        ...a,
                        isLiked: newLikedState,
                        likeCount: newLikedState ? a.likeCount + 1 : a.likeCount - 1,
                    }
                    : a
            ));

            // API调用
            await likeArticle({
                params: { id: article.id },
                data: { liked: newLikedState },
            });

            toast.success(newLikedState ? '已点赞' : '已取消点赞');
        } catch (error) {
            // 回滚乐观更新
            setArticles(prev => prev.map(a =>
                a.id === article.id
                    ? {
                        ...a,
                        isLiked: article.isLiked,
                        likeCount: article.likeCount,
                    }
                    : a
            ));
            toast.error('操作失败，请重试');
        }
    }, [isAuthenticated, isReducedMotion, isTouchDevice, ripple, hapticFeedback, push, likeArticle]);

    const handleBookmarkArticle = useCallback(async (article: Article, event: React.MouseEvent) => {
        if (!isReducedMotion) {
            const target = event.currentTarget as HTMLElement;
            ripple(target, event);
        }

        if (isTouchDevice) {
            hapticFeedback('light');
        }

        if (!isAuthenticated) {
            toast.error('请先登录');
            await push('/login');
            return;
        }

        try {
            const newBookmarkedState = !article.isBookmarked;

            // 乐观更新
            setArticles(prev => prev.map(a =>
                a.id === article.id
                    ? { ...a, isBookmarked: newBookmarkedState }
                    : a
            ));

            // API调用
            await bookmarkArticle({
                params: { id: article.id },
                data: { bookmarked: newBookmarkedState },
            });

            toast.success(newBookmarkedState ? '已收藏' : '已取消收藏');
        } catch (error) {
            // 回滚乐观更新
            setArticles(prev => prev.map(a =>
                a.id === article.id
                    ? { ...a, isBookmarked: article.isBookmarked }
                    : a
            ));
            toast.error('操作失败，请重试');
        }
    }, [isAuthenticated, isReducedMotion, isTouchDevice, ripple, hapticFeedback, push, bookmarkArticle]);

    const handleShareArticle = useCallback(async (article: Article, event: React.MouseEvent) => {
        if (!isReducedMotion) {
            const target = event.currentTarget as HTMLElement;
            ripple(target, event);
        }

        if (isTouchDevice) {
            hapticFeedback('light');
        }

        const shareData = {
            title: article.title,
            text: article.excerpt,
            url: `${window.location.origin}/article/${article.id}`,
        };

        try {
            if (navigator.share && isTouchDevice) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.success('链接已复制到剪贴板');
            }
        } catch (error) {
            toast.error('分享失败');
        }
    }, [isReducedMotion, isTouchDevice, ripple, hapticFeedback]);

    const loadMoreArticles = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模拟加载更多数据
        const newArticles = mockArticles.map(article => ({
            ...article,
            id: `${article.id}_${page + 1}`,
        }));

        setArticles(prev => [...prev, ...newArticles]);
        setPage(prev => prev + 1);
        setIsLoading(false);

        // 模拟数据加载完毕
        if (page >= 3) {
            setHasMore(false);
        }
    }, [isLoading, hasMore, page]);

    // ==================== 组件 ====================

    const ArticleCard: React.FC<{ article: Article; index: number }> = ({ article, index }) => {
        const cardRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (cardRef.current && !isReducedMotion) {
                // 入场动画
                const delay = index * 100;
                setTimeout(() => {
                    if (cardRef.current) {
                        fadeIn(cardRef.current, { delay });
                    }
                }, delay);
            }
        }, [index]);

        return (
            <article
                ref={cardRef}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 p-6 mb-6 group"
                style={{ opacity: isReducedMotion ? 1 : 0 }}
            >
                {/* 特色标签 */}
                {(article.isFeatured || article.isPinned) && (
                    <div className="flex items-center space-x-2 mb-4">
                        {article.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                <FireIcon className="h-3 w-3 mr-1" />
                                精选
                            </span>
                        )}
                        {article.isPinned && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                📌 置顶
                            </span>
                        )}
                    </div>
                )}

                {/* 作者信息 */}
                <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-md">
                        {article.author.name.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                        <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-900">
                                {article.author.name}
                            </span>
                            {article.author.verified && (
                                <svg className="ml-1 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            {article.author.company && (
                                <>
                                    <span className="mx-2 text-gray-400">·</span>
                                    <span className="text-sm text-gray-600">{article.author.company}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                            <span className="mx-2">·</span>
                            <span>{article.readTime}分钟阅读</span>
                        </div>
                    </div>
                </div>

                {/* 文章内容 */}
                <Link
                    href={`/article/${article.id}`}
                    onMouseEnter={() => preload(`/article/${article.id}`)}
                    className="block group-hover:text-blue-600 transition-colors"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                        {article.title}
                    </h2>
                    <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                    </p>
                </Link>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag)}`}
                            onMouseEnter={() => preload(`/tags/${encodeURIComponent(tag)}`)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-sm rounded-full transition-colors"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>

                {/* 互动区域 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={(e) => handleLikeArticle(article, e)}
                            disabled={likingArticle}
                            className={`flex items-center space-x-2 text-sm transition-colors ${article.isLiked
                                ? 'text-red-500'
                                : 'text-gray-500 hover:text-red-500'
                                } ${likingArticle ? 'opacity-50' : ''}`}
                        >
                            {article.isLiked ? (
                                <HeartSolidIcon className="h-5 w-5" />
                            ) : (
                                <HeartIcon className="h-5 w-5" />
                            )}
                            <span>{article.likeCount.toLocaleString()}</span>
                        </button>

                        <Link
                            href={`/article/${article.id}#comments`}
                            onMouseEnter={() => preload(`/article/${article.id}`)}
                            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span>{article.commentCount}</span>
                        </Link>

                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <EyeIcon className="h-5 w-5" />
                            <span>{article.viewCount.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={(e) => handleShareArticle(article, e)}
                            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ShareIcon className="h-5 w-5" />
                            <span>{article.shareCount}</span>
                        </button>
                    </div>

                    <button
                        onClick={(e) => handleBookmarkArticle(article, e)}
                        disabled={bookmarkingArticle}
                        className={`p-2 rounded-lg transition-colors ${article.isBookmarked
                            ? 'text-blue-500 bg-blue-50'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            } ${bookmarkingArticle ? 'opacity-50' : ''}`}
                    >
                        {article.isBookmarked ? (
                            <BookmarkSolidIcon className="h-5 w-5" />
                        ) : (
                            <BookmarkIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </article>
        );
    };

    const FilterTabs: React.FC = () => (
        <div className="flex items-center space-x-1 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
            {[
                { type: 'recommended' as const, label: '推荐', icon: FireIcon },
                { type: 'latest' as const, label: '最新', icon: ClockIcon },
                { type: 'hot' as const, label: '热门', icon: TrophyIcon },
                { type: 'following' as const, label: '关注', icon: HeartIcon, requireAuth: true },
            ].map((tab) => (
                <button
                    key={tab.type}
                    onClick={() => handleFilterChange({ type: tab.type })}
                    disabled={tab.requireAuth && !isAuthenticated}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${currentFilter.type === tab.type
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        } ${tab.requireAuth && !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );

    // 快速发布组件
    const QuickPost: React.FC = () => {
        if (!isAuthenticated) return null;

        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-md">
                        {(user as any)?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <form {...quickPostForm.getFormProps()} className="space-y-3">
                            <textarea
                                {...quickPostForm.getFieldProps('content')}
                                placeholder="分享你的想法..."
                                rows={3}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    {quickPostForm.getFieldState('content').value?.length || 0}/280
                                </div>
                                <button
                                    type="submit"
                                    disabled={quickPostForm.state.isSubmitting || !quickPostForm.state.isValid}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {quickPostForm.state.isSubmitting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <PlusIcon className="h-4 w-4" />
                                    )}
                                    <span>发布</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== 返回JSX ====================

    return (
        <div>
            <TopNavbar />
            <MainLayoutEnhanced>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 主内容区域 */}
                    <div className="flex-1">
                        <QuickPost />
                        <FilterTabs />

                        {/* 文章列表 */}
                        <div>
                            {articles.map((article, index) => (
                                <ArticleCard key={article.id} article={article} index={index} />
                            ))}
                        </div>

                        {/* 加载更多 */}
                        <div ref={loadMoreRef} className="text-center py-8">
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-600">加载中...</span>
                                </div>
                            ) : hasMore ? (
                                <button
                                    onClick={loadMoreArticles}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
                                >
                                    加载更多文章
                                </button>
                            ) : (
                                <p className="text-gray-500">没有更多文章了</p>
                            )}
                        </div>
                    </div>

                    {/* 右侧边栏内容保持原样... */}
                </div>
            </MainLayoutEnhanced>
        </div>
    );
}
