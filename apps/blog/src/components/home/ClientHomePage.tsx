'use client';

import ArticleCard from '@/components/blog/ArticleCard';
import TagList from '@/components/blog/TagList';
import SearchBar from '@/components/ui/SearchBar';
import { fetchArticles } from '@/services/api';
import { Article, Tag } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

interface ClientHomePageProps {
  initialArticles: Article[];
  tags: Tag[];
}

export default function ClientHomePage({ initialArticles, tags }: ClientHomePageProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setArticles(initialArticles);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await fetchArticles({ search: query });
      setArticles(Array.isArray(searchResults) ? searchResults : searchResults.articles);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await fetchArticles({ page: nextPage, limit: 10 });
      const moreArticles = Array.isArray(result) ? result : result.articles;

      if (moreArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles([...articles, ...moreArticles]);
        setCurrentPage(nextPage);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      {/* 英雄区域 */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 -mt-6 mb-8 py-16 text-white">
        <div className="container-content">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">探索技术世界的无限可能</h1>
            <p className="text-primary-100 mb-8 text-lg">
              深入了解前沿技术，分享开发经验，提升编程技能
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar onSearch={handleSearch} placeholder="搜索文章、标签或关键词..." />
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container-content">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-8">
              <div className="card p-5">
                <h3 className="text-lg font-bold mb-4 text-secondary-800">热门标签</h3>
                <TagList tags={tags} selectedTag={selectedTag} onTagSelect={(tag) => setSelectedTag(tag)} />
              </div>

              <div className="card p-5">
                <h3 className="text-lg font-bold mb-4 text-secondary-800">社区推荐</h3>
                <div className="space-y-4">
                  <Link href="#" className="block group">
                    <p className="font-medium group-hover:text-primary-600 transition-colors">开发者论坛</p>
                    <p className="text-sm text-secondary-600">加入技术讨论，解决开发难题</p>
                  </Link>
                  <Link href="#" className="block group">
                    <p className="font-medium group-hover:text-primary-600 transition-colors">贡献社区</p>
                    <p className="text-sm text-secondary-600">参与开源项目，提升个人影响力</p>
                  </Link>
                  <Link href="#" className="block group">
                    <p className="font-medium group-hover:text-primary-600 transition-colors">技术活动</p>
                    <p className="text-sm text-secondary-600">参加线上/线下技术分享会</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 文章列表 */}
          <div className="lg:w-3/4">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              {selectedTag ? `${selectedTag} 相关文章` : '最新文章'}
              {isSearching && (
                <div className="ml-3 animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              )}
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
                      disabled={isLoadingMore}
                      className={`border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors ${isLoadingMore ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoadingMore ? (
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
          </div>
        </div>
      </div>
    </>
  );
}
