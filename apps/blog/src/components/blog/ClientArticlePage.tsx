'use client';

import ClientOnly from '@/components/ClientOnly';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Article } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ClientArticlePageProps {
    article: Article;
}

export function ClientArticlePage({ article }: ClientArticlePageProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <article className="max-w-3xl mx-auto">
                {/* 文章头部 */}
                <header className="mb-8">
                    <div className="mb-4 text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Link href="/blog" className="hover:text-primary-600">博客</Link>
                        <span>/</span>
                        {article.tags && article.tags.length > 0 && (
                            <>
                                <Link href={`/tags/${article.tags[0].name.toLowerCase()}`} className="hover:text-primary-600">
                                    {article.tags[0].name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image
                                    src={article.author.avatar || '/default-avatar.svg'}
                                    alt={article.author.username}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <Link href={`/author/${article.author.id}`} className="text-sm font-medium hover:text-primary-600">
                                    {article.author.username}
                                </Link>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {article.readingTime} 分钟阅读
                        </div>
                    </div>

                    {/* 封面图片 */}
                    {article.coverImage && (
                        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-8">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                </header>

                {/* 文章内容 */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ClientOnly>
                        <MarkdownRenderer content={article.content} />
                    </ClientOnly>
                </div>

                {/* 文章底部 */}
                <footer className="mt-12 pt-6 border-t">
                    <div className="flex flex-wrap gap-2">
                        {article.tags && article.tags.map(tag => (
                            <Link
                                key={tag.id}
                                href={`/tags/${tag.name.toLowerCase()}`}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                </footer>
            </article>
        </div>
    );
}
