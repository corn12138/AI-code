'use client';

import { Article } from '@/types';
import { formatDate } from '@/utils/clientUtils';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';
import MarkdownRenderer from './MarkdownRenderer';

interface ArticleDetailProps {
    article: Article;
}

export default function ArticleDetailClient({ article }: ArticleDetailProps) {
    const [likes, setLikes] = useState(article.likesCount || 0);
    const [hasLiked, setHasLiked] = useState(false);

    const handleLike = async () => {
        if (hasLiked) return;

        try {
            // 假设API调用在这里
            await new Promise(resolve => setTimeout(resolve, 500));
            setLikes(prev => prev + 1);
            setHasLiked(true);
            toast.success('感谢您的点赞！');
        } catch (error) {
            console.error('点赞失败:', error);
            toast.error('点赞失败，请重试');
        }
    };

    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                <article className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

                    {/* 文章元信息 */}
                    <div className="flex items-center mb-6 text-gray-600">
                        <div className="flex items-center mr-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-2">
                                <Image
                                    src={article.author.avatar || "https://via.placeholder.com/40"}
                                    alt={article.author.username}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <span>{article.author.username}</span>
                        </div>
                        <span className="mr-4">{formatDate(article.createdAt)}</span>
                        <span>{article.readingTime} 分钟阅读</span>
                    </div>

                    {/* 文章封面图 */}
                    {article.coverImage && (
                        <div className="relative h-80 w-full mb-8">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-lg"
                            />
                        </div>
                    )}

                    {/* 标签 */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {article.tags.map(tag => (
                                <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 文章内容 - 使用Markdown渲染器 */}
                    <div className="prose prose-lg max-w-none">
                        <MarkdownRenderer content={article.content} />
                    </div>

                    {/* 文章交互区域 */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full ${hasLiked ? 'bg-red-50 text-red-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span>{likes} 赞</span>
                            </button>

                            <div className="flex gap-4">
                                <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>{article.views || 0}</span>
                                </span>

                                <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span>{article.comments?.length || 0}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </ClientPageWrapper>
    );
}
