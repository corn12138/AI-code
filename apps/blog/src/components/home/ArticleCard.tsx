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
        <article className="group relative bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 hover:border-cosmic-400/40 transition-all duration-500 ease-out p-6 hover:shadow-cosmic hover:scale-[1.02] animate-slide-up">
            {/* 渐变边框效果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cosmic-500/10 via-nebula-500/10 to-stardust-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 内容容器 */}
            <div className="relative z-10">
                {/* 作者信息 */}
                <div className="flex items-center mb-4">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-600 flex items-center justify-center text-white font-medium text-sm shadow-cosmic">
                            {article.author.name.charAt(0)}
                        </div>
                        {/* 在线状态指示器 */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-stardust-400 rounded-full border-2 border-space-900 animate-pulse-slow" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap">
                            <span className="text-sm font-medium text-space-200 truncate">{article.author.name}</span>
                            {article.author.company && (
                                <>
                                    <span className="mx-2 text-space-500 hidden sm:inline">•</span>
                                    <span className="text-sm text-space-400 truncate">{article.author.company}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center text-xs text-space-500 mt-1">
                            <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{article.publishedAt}</span>
                            <span className="mx-2">•</span>
                            <span>{article.readTime}分钟阅读</span>
                        </div>
                    </div>
                </div>

                {/* 文章内容 */}
                <Link href={`/article/${article.id}`} className="block group">
                    <h2 className="text-lg font-semibold text-space-100 mb-3 group-hover:text-cosmic-300 transition-all duration-300 line-clamp-2 leading-relaxed">
                        {article.title}
                    </h2>
                    <p className="text-space-400 text-sm mb-4 line-clamp-3 leading-relaxed group-hover:text-space-300 transition-colors duration-300">
                        {article.content}
                    </p>
                </Link>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag)}`}
                            className="px-3 py-1.5 bg-space-800/60 text-space-300 text-xs rounded-lg hover:bg-cosmic-600/20 hover:text-cosmic-300 hover:border hover:border-cosmic-500/30 transition-all duration-300 backdrop-blur-sm"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>

                {/* 互动数据 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 text-sm transition-all duration-300 group/btn ${article.isLiked
                                ? 'text-nebula-400'
                                : 'text-space-400 hover:text-nebula-400'
                                }`}
                        >
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${article.isLiked
                                ? 'bg-nebula-500/20 shadow-nebula'
                                : 'group-hover/btn:bg-space-800/60'
                                }`}>
                                {article.isLiked ? (
                                    <HeartSolidIcon className="h-4 w-4" />
                                ) : (
                                    <HeartIcon className="h-4 w-4" />
                                )}
                            </div>
                            <span className="hidden sm:inline font-medium">{article.likeCount}</span>
                            <span className="sm:hidden font-medium">{article.likeCount > 999 ? `${Math.floor(article.likeCount / 1000)}k` : article.likeCount}</span>
                        </button>

                        <Link
                            href={`/article/${article.id}#comments`}
                            className="flex items-center space-x-2 text-sm text-space-400 hover:text-cosmic-400 transition-all duration-300 group/btn"
                        >
                            <div className="p-1.5 rounded-lg transition-all duration-300 group-hover/btn:bg-space-800/60">
                                <ChatBubbleLeftIcon className="h-4 w-4" />
                            </div>
                            <span className="hidden sm:inline font-medium">{article.commentCount}</span>
                            <span className="sm:hidden font-medium">{article.commentCount > 999 ? `${Math.floor(article.commentCount / 1000)}k` : article.commentCount}</span>
                        </Link>

                        <div className="flex items-center space-x-2 text-sm text-space-400">
                            <div className="p-1.5 rounded-lg">
                                <EyeIcon className="h-4 w-4" />
                            </div>
                            <span className="hidden sm:inline font-medium">{article.viewCount}</span>
                            <span className="sm:hidden font-medium">{article.viewCount > 999 ? `${Math.floor(article.viewCount / 1000)}k` : article.viewCount}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBookmark}
                        className={`p-2 rounded-lg transition-all duration-300 group/btn ${article.isBookmarked
                            ? 'text-stardust-400 bg-stardust-500/20 shadow-stardust'
                            : 'text-space-400 hover:text-stardust-400 hover:bg-space-800/60'
                            }`}
                    >
                        <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
            </div>

            {/* 悬停时的光晕效果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cosmic-500/5 via-nebula-500/5 to-stardust-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </article>
    );
}
