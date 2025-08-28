import { Article, Tag } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { InteractiveBlogSearch } from './InteractiveBlogSearch';

interface StaticBlogContentProps {
    articles: Article[];
    tags: Tag[];
    initialSearch?: string;
    currentTag?: string;
    currentPage: number;
    totalPages?: number;
}

export function StaticBlogContent({
    articles,
    tags,
    initialSearch,
    currentTag,
    currentPage,
    totalPages = 1
}: StaticBlogContentProps) {
    return (
        <div className="container mx-auto mobile-padding py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">博客文章</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                <div className="lg:col-span-3">
                    {/* 交互式搜索 - 仅此部分需要水合 */}
                    <div className="mb-8">
                        <InteractiveBlogSearch initialSearch={initialSearch} />
                    </div>

                    {/* 当前筛选条件 - 纯静态 */}
                    {(currentTag || initialSearch) && (
                        <div className="mb-6 flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">当前筛选:</span>
                            {currentTag && (
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                                    <span>标签: {currentTag}</span>
                                    <Link href="/blog" className="ml-1 text-blue-800 hover:text-blue-900">
                                        ✕
                                    </Link>
                                </div>
                            )}
                            {initialSearch && (
                                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                                    <span>搜索: {initialSearch}</span>
                                    <Link href="/blog" className="ml-1 text-green-800 hover:text-green-900">
                                        ✕
                                    </Link>
                                </div>
                            )}
                            <Link href="/blog" className="ml-2 text-sm text-primary-600 hover:text-primary-800">
                                清除所有筛选
                            </Link>
                        </div>
                    )}

                    {/* 文章列表 - 纯静态 */}
                    {articles.length > 0 ? (
                        <div className="mobile-space-y">
                            {articles.map(article => (
                                <article key={article.id} className="flex flex-col sm:flex-row mobile-gap p-3 sm:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                    {article.coverImage && (
                                        <div className="sm:w-1/3 relative h-40 sm:h-48 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={article.coverImage}
                                                alt={article.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    <div className={article.coverImage ? "sm:w-2/3" : "w-full"}>
                                        <h2 className="text-lg sm:text-xl font-bold mb-2">
                                            <Link
                                                href={article.slug ? `/blog/${article.slug}` : `/article/${article.id}`}
                                                className="hover:text-primary-600 line-clamp-2 sm:line-clamp-none"
                                            >
                                                {article.title}
                                            </Link>
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                            {article.tags?.slice(0, 3).map(tag => (
                                                <Link
                                                    key={tag.id}
                                                    href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 touch-target"
                                                >
                                                    {tag.name}
                                                </Link>
                                            ))}
                                            {article.tags && article.tags.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                                    +{article.tags.length - 3}
                                                </span>
                                            )}
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
                                                <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span>{article.readingTime} 分钟</span>
                                                <span>{article.viewCount} 浏览</span>
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

                    {/* 分页导航 - 纯静态 */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-2">
                            {currentPage > 1 && (
                                <Link
                                    href={`/blog?${new URLSearchParams({
                                        ...(currentTag && { tag: currentTag }),
                                        ...(initialSearch && { search: initialSearch }),
                                        page: (currentPage - 1).toString()
                                    }).toString()}`}
                                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    上一页
                                </Link>
                            )}

                            <span className="px-4 py-2 text-sm text-gray-700">
                                第 {currentPage} / {totalPages} 页
                            </span>

                            {currentPage < totalPages && (
                                <Link
                                    href={`/blog?${new URLSearchParams({
                                        ...(currentTag && { tag: currentTag }),
                                        ...(initialSearch && { search: initialSearch }),
                                        page: (currentPage + 1).toString()
                                    }).toString()}`}
                                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    下一页
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* 侧边栏 - 在移动端显示在底部 */}
                <aside className="mobile-space-y lg:space-y-8 mt-6 lg:mt-0">
                    <div className="block lg:hidden mb-4">
                        <h2 className="text-lg font-semibold mb-4">相关内容</h2>
                    </div>

                    {/* 热门标签 */}
                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 pb-2 border-b">热门标签</h2>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {tags.slice(0, 12).map(tag => (
                                <Link
                                    key={tag.id}
                                    href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                                    className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs sm:text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 touch-target"
                                >
                                    {tag.name}
                                    {tag.count && <span className="ml-1 text-xs text-gray-500 hidden sm:inline">({tag.count})</span>}
                                </Link>
                            ))}
                            {tags.length > 12 && (
                                <span className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs sm:text-sm rounded-full">
                                    +{tags.length - 12}
                                </span>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
} 