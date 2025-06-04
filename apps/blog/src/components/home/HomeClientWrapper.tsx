'use client';

import SearchBar from '@/components/SearchBar';
import { Article, Tag } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface HomeClientWrapperProps {
    articles: Article[];
    tags: Tag[];
}

export function HomeClientWrapper({ articles, tags }: HomeClientWrapperProps) {
    const [featuredArticles, setFeaturedArticles] = useState(articles.slice(0, 3));
    const [latestArticles, setLatestArticles] = useState(articles.slice(0, 5));

    const handleSearch = (query: string) => {
        if (query.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <section className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">探索<span className="text-primary-600">技术</span>的世界</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                    发现最新技术趋势、深入解析和实用教程，提升你的开发技能
                </p>
                <div className="max-w-md mx-auto">
                    <SearchBar onSearch={handleSearch} placeholder="搜索文章、标签或作者..." />
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">精选文章</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredArticles.map((article) => (
                        <article key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-transform hover:shadow-md hover:translate-y-[-2px]">
                            <div className="relative h-48">
                                <Image
                                    src={article.coverImage || 'https://via.placeholder.com/800x450?text=TechBlog'}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                                    <Link href={`/blog/${article.slug}`} className="hover:text-primary-600">
                                        {article.title}
                                    </Link>
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                                    <span className="flex items-center">
                                        <span className="mr-2">📅</span> {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                                    </span>
                                    <span className="flex items-center">
                                        <span className="mr-1">👁️</span> {article.views}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* 其余内容与之前相同，但确保使用ClientButton替代普通button */}
            <div className="mt-8 text-center">
                <Link href="/blog" className="btn-primary">
                    查看全部文章
                </Link>
            </div>

            {/* 其他内容... */}
        </div>
    );
}
