'use client';

import { Article, Tag } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ClientTagPageProps {
    currentTag: Tag;
    articles: Article[];
    allTags: Tag[];
}

export function ClientTagPage({ currentTag, articles, allTags }: ClientTagPageProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-2">{currentTag.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {currentTag.count} 篇相关文章
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                    <article key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                        {article.coverImage && (
                            <div className="relative h-48">
                                <Image
                                    src={article.coverImage}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="p-5">
                            <h2 className="text-xl font-bold mb-2 line-clamp-2">
                                <Link href={`/blog/${article.slug}`} className="hover:text-primary-600">
                                    {article.title}
                                </Link>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">
                                {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <span className="relative w-6 h-6 rounded-full overflow-hidden">
                                        <Image
                                            src={article.author.avatar || 'https://via.placeholder.com/40'}
                                            alt={article.author.username}
                                            fill
                                            className="object-cover"
                                        />
                                    </span>
                                    <span>{article.author.username}</span>
                                </span>
                                <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {articles.length === 0 && (
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-2">没有找到相关文章</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        暂时没有与"{currentTag.name}"标签相关的文章，请浏览其他标签
                    </p>
                    <Link href="/blog" className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
                        返回博客
                    </Link>
                </div>
            )}

            <div className="mt-12">
                <h3 className="text-xl font-bold mb-4">其他热门标签</h3>
                <div className="flex flex-wrap gap-2">
                    {allTags
                        .filter(t => t.name.toLowerCase() !== currentTag.name.toLowerCase())
                        .slice(0, 10)
                        .map(tag => (
                            <Link
                                key={tag.id}
                                href={`/tags/${encodeURIComponent(tag.name.toLowerCase())}`}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                            >
                                {tag.name}
                                {tag.count && <span className="text-xs text-gray-500"> ({tag.count})</span>}
                            </Link>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
