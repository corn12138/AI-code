import clsx from 'clsx';
import { Clock, TrendingUp } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticleStore } from '../../store/articleStore';
import { Article } from '../../types';

interface ArticleListProps {
    className?: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({ className }) => {
    const navigate = useNavigate();
    const {
        articles,
        loading,
        error,
        pagination,
        currentCategory,
        loadArticles,
        loadMoreArticles
    } = useArticleStore();

    useEffect(() => {
        if (articles.length === 0) {
            loadArticles(currentCategory);
        }
    }, [currentCategory, loadArticles, articles.length]);

    const handleArticleClick = (article: Article) => {
        navigate(`/article/${article.id}`);
    };

    const handleLoadMore = () => {
        if (!loading && pagination.hasMore) {
            loadMoreArticles();
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-red-500 text-center">
                    <p className="text-lg font-medium mb-2">加载失败</p>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
                <button
                    onClick={() => loadArticles(currentCategory)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    重试
                </button>
            </div>
        );
    }

    return (
        <div className={clsx('pb-4', className)}>
            {/* 文章列表 */}
            <div className="space-y-4">
                {articles.map((article) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        onClick={() => handleArticleClick(article)}
                    />
                ))}
            </div>

            {/* 加载更多 */}
            {pagination.hasMore && (
                <div className="mt-6 text-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className={clsx(
                            'px-6 py-3 rounded-lg font-medium transition-colors',
                            loading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        )}
                    >
                        {loading ? '加载中...' : '加载更多'}
                    </button>
                </div>
            )}

            {/* 没有更多内容 */}
            {!pagination.hasMore && articles.length > 0 && (
                <div className="mt-6 text-center text-gray-500 text-sm">
                    没有更多内容了
                </div>
            )}

            {/* 初始加载状态 */}
            {loading && articles.length === 0 && (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <ArticleCardSkeleton key={index} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ArticleCardProps {
    article: Article;
    onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50"
        >
            <div className="flex gap-3">
                {/* 文章图片 */}
                {article.imageUrl && (
                    <div className="flex-shrink-0">
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-20 h-20 rounded-lg object-cover"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* 文章内容 */}
                <div className="flex-1 min-w-0">
                    {/* 标题和热门标签 */}
                    <div className="flex items-start gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                            {article.title}
                        </h3>
                        {article.isHot && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                <TrendingUp size={12} />
                                热门
                            </span>
                        )}
                    </div>

                    {/* 摘要 */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {article.summary}
                    </p>

                    {/* 元信息 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            <span>{article.author}</span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {article.readTime}分钟
                            </span>
                        </div>
                        <span>
                            {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                        </span>
                    </div>

                    {/* 标签 */}
                    {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ArticleCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex gap-3">
                {/* 图片骨架 */}
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />

                {/* 内容骨架 */}
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    <div className="flex gap-2">
                        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};
