'use client';

import ClientPageWrapper from '@/components/ClientPageWrapper';
import { useEffect, useRef, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    articleCount?: number;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    author: {
        username: string;
        fullName?: string;
    };
    tags: Tag[];
}

interface PerformanceMetrics {
    componentMountTime: number;
    tagsLoadTime: number;
    articlesLoadTime: number;
    totalRenderTime: number;
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 性能监控状态
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
    const [showMetrics, setShowMetrics] = useState(false);

    // 性能计时器引用
    const performanceTimers = useRef({
        componentStart: 0, // 组件开始挂载时间
        tagsLoadStart: 0, // 标签开始加载时间
        tagsLoadEnd: 0, // 标签加载完成时间
        articlesLoadStart: 0, // 文章开始加载时间
        articlesLoadEnd: 0, // 文章加载完成时间
        renderComplete: 0 // 渲染完成时间
    });

    // 组件挂载时开始计时
    useEffect(() => {
        performanceTimers.current.componentStart = performance.now();
        console.log('🚀 组件开始挂载:', performanceTimers.current.componentStart);

        // 页面可见性变化监听
        const handleVisibilityChange = () => {
            if (!document.hidden && performanceTimers.current.componentStart > 0) {
                const totalTime = performance.now() - performanceTimers.current.componentStart;
                console.log('📊 页面总加载时间:', totalTime.toFixed(2), 'ms');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        if (selectedTag) {
            fetchArticlesByTag(selectedTag);
        } else {
            setArticles([]);
        }
    }, [selectedTag]);

    // 渲染完成后的性能统计
    useEffect(() => {
        if (!loading && performanceTimers.current.componentStart > 0) {
            performanceTimers.current.renderComplete = performance.now();

            const metrics: PerformanceMetrics = {
                componentMountTime: performanceTimers.current.componentStart,
                tagsLoadTime: performanceTimers.current.tagsLoadEnd - performanceTimers.current.tagsLoadStart,
                articlesLoadTime: performanceTimers.current.articlesLoadEnd - performanceTimers.current.articlesLoadStart,
                totalRenderTime: performanceTimers.current.renderComplete - performanceTimers.current.componentStart
            };

            setPerformanceMetrics(metrics);

            // 控制台输出性能指标
            console.log('📈 性能指标:', {
                '标签加载时间': `${metrics.tagsLoadTime.toFixed(2)}ms`,
                '文章加载时间': `${metrics.articlesLoadTime.toFixed(2)}ms`,
                '总渲染时间': `${metrics.totalRenderTime.toFixed(2)}ms`,
                '页面性能评级': metrics.totalRenderTime < 1000 ? '优秀' : metrics.totalRenderTime < 2000 ? '良好' : '需要优化'
            });
        }
    }, [loading]);

    const fetchTags = async () => {
        try {
            performanceTimers.current.tagsLoadStart = performance.now();
            console.log('🏷️ 开始获取标签数据');

            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                console.log('API返回的标签数据:', data.tags);

                if (Array.isArray(data.tags)) {
                    setTags(data.tags);
                } else {
                    console.error('API返回的不是数组:', data);
                    setTags([]);
                    setError('数据格式错误');
                }
            } else {
                const errorText = await response.text();
                console.error('获取标签失败:', response.status, errorText);
                setError('获取标签失败');
            }

            performanceTimers.current.tagsLoadEnd = performance.now();
            const tagsLoadTime = performanceTimers.current.tagsLoadEnd - performanceTimers.current.tagsLoadStart;
            console.log('✅ 标签数据加载完成，耗时:', tagsLoadTime.toFixed(2), 'ms');

        } catch (err) {
            console.error('网络错误:', err);
            setError('网络错误');
            performanceTimers.current.tagsLoadEnd = performance.now();
        } finally {
            setLoading(false);
        }
    };

    const fetchArticlesByTag = async (tagSlug: string) => {
        try {
            performanceTimers.current.articlesLoadStart = performance.now();
            console.log('📄 开始获取文章数据');

            const response = await fetch(`/api/articles?tag=${tagSlug}`);
            if (response.ok) {
                const data = await response.json();
                console.log('API返回的文章数据:', data);

                if (data && Array.isArray(data.articles)) {
                    setArticles(data.articles);
                } else {
                    console.error('文章数据格式错误:', data);
                    setArticles([]);
                }
            } else {
                console.error('获取文章失败:', response.status);
                setArticles([]);
            }

            performanceTimers.current.articlesLoadEnd = performance.now();
            const articlesLoadTime = performanceTimers.current.articlesLoadEnd - performanceTimers.current.articlesLoadStart;
            console.log('✅ 文章数据加载完成，耗时:', articlesLoadTime.toFixed(2), 'ms');

        } catch (err) {
            console.error('获取文章失败:', err);
            setArticles([]);
            performanceTimers.current.articlesLoadEnd = performance.now();
        }
    };

    const handleTagSelect = (tagSlug: string) => {
        setSelectedTag(selectedTag === tagSlug ? null : tagSlug);
    };

    if (loading) {
        return (
            <ClientPageWrapper>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-space-400">正在加载标签...</div>
                </div>
            </ClientPageWrapper>
        );
    }

    if (error) {
        return (
            <ClientPageWrapper>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-nebula-400">{error}</div>
                </div>
            </ClientPageWrapper>
        );
    }

    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                {/* 性能指标显示 */}
                {performanceMetrics && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowMetrics(!showMetrics)}
                            className="text-sm bg-cosmic-600/20 text-cosmic-300 px-3 py-1 rounded-lg hover:bg-cosmic-600/30 transition-all duration-300 border border-cosmic-500/30"
                        >
                            📊 性能指标 {showMetrics ? '隐藏' : '显示'}
                        </button>

                        {showMetrics && (
                            <div className="mt-2 p-4 bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl text-sm">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-space-300">
                                    <div>标签加载: {performanceMetrics.tagsLoadTime.toFixed(0)}ms</div>
                                    <div>文章加载: {performanceMetrics.articlesLoadTime.toFixed(0)}ms</div>
                                    <div>总渲染时间: {performanceMetrics.totalRenderTime.toFixed(0)}ms</div>
                                    <div>性能评级: {
                                        performanceMetrics.totalRenderTime < 1000 ? '🟢优秀' :
                                            performanceMetrics.totalRenderTime < 2000 ? '🟡良好' : '🔴需要优化'
                                    }</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-space-200 mb-4">文章标签</h1>
                    <p className="text-space-400">浏览所有标签，点击标签查看相关文章</p>
                </div>

                {/* 标签云 */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-space-200 mb-4">标签云</h2>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(tags) && tags.length > 0 ? (
                            tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagSelect(tag.slug)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${selectedTag === tag.slug
                                        ? 'bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white shadow-cosmic'
                                        : 'bg-space-800/60 text-space-300 hover:bg-cosmic-600/20 hover:text-cosmic-300 hover:border hover:border-cosmic-500/30 backdrop-blur-sm'
                                        }`}
                                    style={{ backgroundColor: selectedTag === tag.slug ? undefined : tag.color }}
                                >
                                    {tag.name}
                                    {tag.articleCount && (
                                        <span className="ml-1 text-xs opacity-75">
                                            ({tag.articleCount})
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="text-space-500">暂无标签</div>
                        )}
                    </div>
                </div>

                {/* 标签列表 */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-space-200 mb-4">所有标签</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(tags) && tags.length > 0 ? (
                            tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl p-4 hover:shadow-cosmic transition-all duration-300 cursor-pointer group"
                                    onClick={() => handleTagSelect(tag.slug)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-medium text-space-200 group-hover:text-cosmic-300 transition-colors duration-300">{tag.name}</h3>
                                        {tag.articleCount !== undefined && (
                                            <span className="text-sm text-space-500">
                                                {tag.articleCount} 篇文章
                                            </span>
                                        )}
                                    </div>
                                    {tag.description && (
                                        <p className="text-space-400 text-sm">{tag.description}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-space-500 py-8">
                                暂无标签
                            </div>
                        )}
                    </div>
                </div>

                {/* 选中标签的文章 */}
                {selectedTag && (
                    <div>
                        <h2 className="text-xl font-semibold text-space-200 mb-4">
                            标签 "{Array.isArray(tags) ? tags.find(t => t.slug === selectedTag)?.name : ''}" 的文章
                        </h2>
                        {Array.isArray(articles) && articles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {articles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl p-6 hover:shadow-cosmic transition-all duration-300 group"
                                    >
                                        <h3 className="text-lg font-semibold text-space-200 mb-2">
                                            <a
                                                href={`/articles/${article.slug}`}
                                                className="hover:text-cosmic-300 transition-colors duration-300"
                                            >
                                                {article.title}
                                            </a>
                                        </h3>
                                        <p className="text-space-400 text-sm mb-3">{article.excerpt}</p>
                                        <div className="flex items-center justify-between text-sm text-space-500">
                                            <span>作者: {article.author?.fullName || article.author?.username}</span>
                                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                        {Array.isArray(article.tags) && article.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {article.tags.map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2 py-1 bg-space-800/60 text-space-300 text-xs rounded-lg backdrop-blur-sm"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-space-500 py-8 bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl">
                                该标签下暂无文章
                            </div>
                        )}
                    </div>
                )}

                {!Array.isArray(tags) || tags.length === 0 ? (
                    <div className="text-center text-space-500 py-8">
                        {error || '暂无标签'}
                    </div>
                ) : null}
            </div>
        </ClientPageWrapper>
    );
}
