'use client';

import {
    BookmarkIcon,
    ChatBubbleLeftIcon,
    ClockIcon,
    EyeIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState } from 'react';
import type { Article } from './HomeContent';

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article: initialArticle }: ArticleCardProps) {
    const [article, setArticle] = useState(initialArticle);

    const handleLike = () => {
        setArticle(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        }));
    };

    const handleBookmark = () => {
        setArticle(prev => ({
            ...prev,
            isBookmarked: !prev.isBookmarked
        }));
    };

    return (
        <article className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-4 sm:p-6">
            {/* 作者信息 */}
            <div className="flex items-center mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    {article.author.name.charAt(0)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap">
                        <span className="text-sm font-medium text-gray-900 truncate">{article.author.name}</span>
                        {article.author.company && (
                            <>
                                <span className="mx-1 text-gray-400 hidden sm:inline">·</span>
                                <span className="text-sm text-gray-600 truncate">{article.author.company}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{article.publishedAt}</span>
                        <span className="mx-1">·</span>
                        <span>{article.readTime}分钟阅读</span>
                    </div>
                </div>
            </div>

            {/* 文章内容 */}
            <Link href={`/article/${article.id}`} className="block group">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.content}
                </p>
            </Link>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {article.tags.map((tag) => (
                    <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors"
                    >
                        {tag}
                    </Link>
                ))}
            </div>

            {/* 互动数据 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 text-sm transition-colors ${article.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                    >
                        {article.isLiked ? (
                            <HeartSolidIcon className="h-4 w-4" />
                        ) : (
                            <HeartIcon className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{article.likeCount}</span>
                        <span className="sm:hidden">{article.likeCount > 999 ? `${Math.floor(article.likeCount / 1000)}k` : article.likeCount}</span>
                    </button>

                    <Link href={`/article/${article.id}#comments`} className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{article.commentCount}</span>
                        <span className="sm:hidden">{article.commentCount > 999 ? `${Math.floor(article.commentCount / 1000)}k` : article.commentCount}</span>
                    </Link>

                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <EyeIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{article.viewCount}</span>
                        <span className="sm:hidden">{article.viewCount > 999 ? `${Math.floor(article.viewCount / 1000)}k` : article.viewCount}</span>
                    </div>
                </div>

                <button
                    onClick={handleBookmark}
                    className={`p-2 rounded transition-colors ${article.isBookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>
        </article>
    );
}
