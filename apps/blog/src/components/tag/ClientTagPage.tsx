'use client';

import ArticleCard from '@/components/blog/ArticleCard';
import TagList from '@/components/blog/TagList';
import { fetchArticles } from '@/services/api';
import { Article, Tag } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

interface ClientTagPageProps {
  tag: string;
  initialArticles: Article[];
  tags: Tag[];
}

export default function ClientTagPage({ tag, initialArticles, tags }: ClientTagPageProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await fetchArticles({ tag, page: nextPage, limit: 10 });
      const moreArticles = Array.isArray(result) ? result : result.articles;

      if (moreArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles([...articles, ...moreArticles]);
        setPage(nextPage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-content mt-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 侧边栏 */}
        <div className="lg:w-1/4">
          <div className="sticky top-24 space-y-8">
            <div className="card p-5">
              <h3 className="text-lg font-bold mb-4 text-secondary-800">热门标签</h3>
              <TagList tags={tags} selectedTag={tag} onTagSelect={(selectedTag) => console.log('选择标签:', selectedTag)} />
            </div>

            <div className="card p-5">
              <h3 className="text-lg font-bold mb-4 text-secondary-800">社区推荐</h3>
              <div className="space-y-4">
                <Link href="#" className="block group">
                  <p className="font-medium group-hover:text-primary-600 transition-colors">开发者论坛</p>
                  <p className="text-sm text-secondary-600">加入技术讨论，解决开发难题</p>
                </Link>
                {/* ...existing code... */}
              </div>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="lg:w-3/4">
          <h2 className="text-2xl font-bold mb-6">
            {tag} 相关文章 ({articles.length})
          </h2>

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
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className={`border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                        加载中...
                      </span>
                    ) : (
                      '加载更多'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              {/* ...existing code... */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}