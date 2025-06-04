'use client';

import { Article } from '@/types';
import ArticleCard from './ArticleCard';
import { useState } from 'react';
import { fetchArticles } from '@/services/api';

interface ArticleListProps {
    initialArticles: Article[];
}

export default function ArticleList({ initialArticles }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadMoreArticles = async () => {
        setIsLoading(true);
        try {
            const nextPage = page + 1;
            const newArticles = await fetchArticles({ page: nextPage, limit: 10 });

            if (newArticles.length === 0) {
                setHasMore(false);
            } else {
                setArticles([...articles, ...newArticles]);
                setPage(nextPage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {articles.length > 0 ? (
                <>
                    <div className="grid md:grid-cols-2 gap-6">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>

                    {/* 加载更多按钮 */}
                    {hasMore && (
                        <div className="mt-10 text-center">
                            <LoadMoreButton onClick={loadMoreArticles} isLoading={isLoading} />
                        </div>
                    )}
                </>
            ) : (
                <div className="card p-12 text-center">
                    <div className="mb-4 text-secondary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-secondary-600 text-lg">暂无相关文章</p>
                    <p className="text-secondary-500 mt-2">
                        尝试使用不同的搜索词或浏览其他标签
                    </p>
                </div>
            )}
        </>
    );
}

// 分离出客户端按钮组件
interface LoadMoreButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

function LoadMoreButton({ onClick, isLoading }: LoadMoreButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors ${isLoading ? 'opacity-70' : ''}`}
        >
            {isLoading ? (
                <span className="flex items-center">
                    <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-secondary-500 rounded-full animate-spin"></span>
                    加载中...
                </span>
            ) : (
                '加载更多'
            )}
        </button>
    );
}
