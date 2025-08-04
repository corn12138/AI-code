'use client';

import { ClientSearchProvider } from '@/components/ClientSearchProvider';
import { Article, Tag } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ClientBlogPageProps {
    articles: Article[];
    tags: Tag[];
    initialSearch?: string;
    currentTag?: string;
    currentPage: number;
}

export function ClientBlogPage({
    articles,
    tags,
    initialSearch,
    currentTag,
    currentPage
}: ClientBlogPageProps) {
    // 这里可以添加客户端交互逻辑

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">博客文章</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    {/* 搜索 */}
                    <div className="mb-8">
                        <ClientSearchProvider initialSearch={initialSearch} />
                    </div>

                    {/* 当前筛选条件 */}
                    {(currentTag || initialSearch) && (
                        <div className="mb-6 flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">当前筛选:</span>
                            {currentTag && (
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                                    <span>标签: {currentTag}</span>
                                    <Link href="/blog" className="ml-1 text-blue-800 hover:text-blue-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                            {initialSearch && (
                                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                                    <span>搜索: {initialSearch}</span>
                                    <Link href="/blog" className="ml-1 text-green-800 hover:text-green-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                            <Link href="/blog" className="ml-2 text-sm text-primary-600 hover:text-primary-800">
                                清除所有筛选
                            </Link>
                        </div>
                    )}

                    {/* 文章列表 */}
                    {articles.length > 0 ? (
                        <div className="space-y-8">
                            {articles.map(article => (
                                <article key={article.id} className="flex flex-col md:flex-row gap-6 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                    {article.coverImage && (
                                        <div className="md:w-1/3 relative h-48 md:h-auto rounded-lg overflow-hidden">
                                            <Image
                                                src={article.coverImage}
                                                alt={article.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className={article.coverImage ? "md:w-2/3" : "w-full"}>
                                        <h2 className="text-xl font-bold mb-2">
                                            <Link href={`/blog/${article.slug}`} className="hover:text-primary-600">
                                                {article.title}
                                            </Link>
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {article.tags?.map(tag => (
                                                <Link
                                                    key={tag.id}
                                                    href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900"
                                                >
                                                    {tag.name}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="relative w-5 h-5 rounded-full overflow-hidden">
                                                        <Image
                                                            src={article.author.avatar || '/default-avatar.svg'}
                                                            alt={article.author.username}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </span>
                                                    <span>{article.author.username}</span>
                                                </div>
                                                <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString('zh-CN') : '未知时间'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span>{article.readingTime || 0} 分钟</span>
                                                <span>{article.viewCount || 0} 浏览</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">未找到文章</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                尝试使用不同的搜索词或浏览其他标签。
                            </p>
                        </div>
                    )}
                </div>

                {/* 侧边栏 */}
                <aside className="space-y-8">
                    {/* 热门标签 */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold mb-4 pb-2 border-b">热门标签</h2>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <Link
                                    key={tag.id}
                                    href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900"
                                >
                                    {tag.name}
                                    {tag.count && <span className="ml-1 text-xs text-gray-500">({tag.count})</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
