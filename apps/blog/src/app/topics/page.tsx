'use client';

import ClientPageWrapper from '@/components/ClientPageWrapper';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Topic {
    id: string;
    name: string;
    slug: string;
    description?: string;
    articleCount?: number;
    createdAt: string;
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
}

export default function TopicsPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            fetchArticlesByTopic(selectedTopic);
        } else {
            setArticles([]);
        }
    }, [selectedTopic]);

    const fetchTopics = async () => {
        try {
            // 模拟数据，实际应调用 API
            const mockTopics: Topic[] = [
                {
                    id: '1',
                    name: '前端开发',
                    slug: 'frontend',
                    description: '前端开发技术讨论，包括 React、Vue、Angular 等框架',
                    articleCount: 15,
                    createdAt: '2024-01-01'
                },
                {
                    id: '2',
                    name: '后端开发',
                    slug: 'backend',
                    description: '后端开发技术，包括 Node.js、Python、Java 等',
                    articleCount: 12,
                    createdAt: '2024-01-02'
                },
                {
                    id: '3',
                    name: '数据库',
                    slug: 'database',
                    description: '数据库设计与优化，SQL 和 NoSQL 数据库技术',
                    articleCount: 8,
                    createdAt: '2024-01-03'
                },
                {
                    id: '4',
                    name: '人工智能',
                    slug: 'ai',
                    description: 'AI、机器学习、深度学习相关技术讨论',
                    articleCount: 6,
                    createdAt: '2024-01-04'
                },
                {
                    id: '5',
                    name: '移动开发',
                    slug: 'mobile',
                    description: 'iOS、Android、React Native、Flutter 等移动开发技术',
                    articleCount: 10,
                    createdAt: '2024-01-05'
                }
            ];

            setTopics(mockTopics);
        } catch (err) {
            setError('获取话题失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchArticlesByTopic = async (topicSlug: string) => {
        try {
            // 模拟文章数据
            const mockArticles: Article[] = [
                {
                    id: '1',
                    title: `${topicSlug} 相关文章示例 1`,
                    slug: `${topicSlug}-article-1`,
                    excerpt: '这是一篇关于该话题的示例文章摘要...',
                    publishedAt: '2024-01-01',
                    author: {
                        username: 'admin',
                        fullName: '管理员'
                    }
                },
                {
                    id: '2',
                    title: `${topicSlug} 相关文章示例 2`,
                    slug: `${topicSlug}-article-2`,
                    excerpt: '另一篇关于该话题的示例文章摘要...',
                    publishedAt: '2024-01-02',
                    author: {
                        username: 'user',
                        fullName: '普通用户'
                    }
                }
            ];

            setArticles(mockArticles);
        } catch (err) {
            console.error('获取文章失败:', err);
        }
    };

    const handleTopicSelect = (topicSlug: string) => {
        setSelectedTopic(selectedTopic === topicSlug ? null : topicSlug);
    };

    if (loading) {
        return (
            <ClientPageWrapper>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">正在加载话题...</div>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">话题讨论</h1>
                    <p className="text-gray-600">浏览不同技术话题，参与社区讨论</p>
                </div>

                {/* 话题列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {topics.map((topic) => (
                        <div
                            key={topic.id}
                            className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${selectedTopic === topic.slug
                                    ? 'border-primary-500 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleTopicSelect(topic.slug)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-semibold text-gray-900">{topic.name}</h3>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {topic.articleCount} 篇
                                </span>
                            </div>
                            {topic.description && (
                                <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                            )}
                            <div className="text-xs text-gray-400">
                                创建于 {new Date(topic.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 选中话题的文章 */}
                {selectedTopic && (
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            话题 "{topics.find(t => t.slug === selectedTopic)?.name}" 的文章
                        </h2>
                        {articles.length > 0 ? (
                            <div className="space-y-4">
                                {articles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            <Link
                                                href={`/articles/${article.slug}`}
                                                className="hover:text-primary-600 transition-colors"
                                            >
                                                {article.title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>作者: {article.author.fullName || article.author.username}</span>
                                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                该话题下暂无文章
                            </div>
                        )}
                    </div>
                )}

                {topics.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        暂无话题
                    </div>
                )}
            </div>
        </ClientPageWrapper>
    );
}
