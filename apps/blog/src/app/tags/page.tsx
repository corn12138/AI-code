'use client';

import ClientPageWrapper from '@/components/ClientPageWrapper';
import { useEffect, useState } from 'react';

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

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                console.log('API返回的标签数据:', data.data); // 调试日志

                // 确保data是数组
                if (Array.isArray(data.data)) {
                    setTags(data.data);
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
        } catch (err) {
            console.error('网络错误:', err);
            setError('网络错误');
        } finally {
            setLoading(false);
        }
    };

    const fetchArticlesByTag = async (tagSlug: string) => {
        try {
            const response = await fetch(`/api/articles?tag=${tagSlug}`);
            if (response.ok) {
                const data = await response.json();
                console.log('API返回的文章数据:', data); // 调试日志

                // 确保articles字段存在且是数组
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
        } catch (err) {
            console.error('获取文章失败:', err);
            setArticles([]);
        }
    };

    const handleTagSelect = (tagSlug: string) => {
        setSelectedTag(selectedTag === tagSlug ? null : tagSlug);
    };

    if (loading) {
        return (
            <ClientPageWrapper>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">正在加载标签...</div>
                </div>
            </ClientPageWrapper>
        );
    }

    if (error) {
        return (
            <ClientPageWrapper>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-red-600">{error}</div>
                </div>
            </ClientPageWrapper>
        );
    }

    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">文章标签</h1>
                    <p className="text-gray-600">浏览所有标签，点击标签查看相关文章</p>
                </div>

                {/* 标签云 */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">标签云</h2>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(tags) && tags.length > 0 ? (
                            tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagSelect(tag.slug)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTag === tag.slug
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            <div className="text-gray-500">暂无标签</div>
                        )}
                    </div>
                </div>

                {/* 标签列表 */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">所有标签</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(tags) && tags.length > 0 ? (
                            tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleTagSelect(tag.slug)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-medium text-gray-900">{tag.name}</h3>
                                        {tag.articleCount !== undefined && (
                                            <span className="text-sm text-gray-500">
                                                {tag.articleCount} 篇文章
                                            </span>
                                        )}
                                    </div>
                                    {tag.description && (
                                        <p className="text-gray-600 text-sm">{tag.description}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                暂无标签
                            </div>
                        )}
                    </div>
                </div>

                {/* 选中标签的文章 */}
                {selectedTag && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            标签 "{Array.isArray(tags) ? tags.find(t => t.slug === selectedTag)?.name : ''}" 的文章
                        </h2>
                        {Array.isArray(articles) && articles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {articles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            <a
                                                href={`/articles/${article.slug}`}
                                                className="hover:text-primary-600 transition-colors"
                                            >
                                                {article.title}
                                            </a>
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>作者: {article.author?.fullName || article.author?.username}</span>
                                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                        {Array.isArray(article.tags) && article.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {article.tags.map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
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
                            <div className="text-center text-gray-500 py-8">
                                该标签下暂无文章
                            </div>
                        )}
                    </div>
                )}

                {!Array.isArray(tags) || tags.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        {error || '暂无标签'}
                    </div>
                ) : null}
            </div>
        </ClientPageWrapper>
    );
}
