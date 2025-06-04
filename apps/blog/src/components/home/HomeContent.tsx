'use client';

import SearchBar from '@/components/SearchBar';
import ArticleCard from '@/components/blog/ArticleCard';
import LoadMoreButton from '@/components/blog/LoadMoreButton';
import TagList from '@/components/blog/TagList';
import { fetchArticles } from '@/services/api';
import { Article, Tag } from '@/types';
import { useState } from 'react';

interface HomeContentProps {
    initialArticles: Article[];
    tags: Tag[];
}

export default function HomeContent({ initialArticles, tags }: HomeContentProps) {
    const [articles, setArticles] = useState(initialArticles);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleTagSelect = async (tagName: string) => {
        if (selectedTag === tagName) {
            setSelectedTag(null);
            setArticles(initialArticles);
        } else {
            setSelectedTag(tagName);
            setIsSearching(true);
            try {
                const taggedArticles = await fetchArticles({ tag: tagName });
                setArticles(taggedArticles);
            } finally {
                setIsSearching(false);
            }
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setArticles(initialArticles);
            return;
        }

        setIsSearching(true);
        try {
            const searchResults = await fetchArticles({ search: query });
            setArticles(searchResults);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLoadMore = () => {
        console.log('加载更多文章');
        // 实际加载逻辑...
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
                                <TagList tags={tags} selectedTag={selectedTag} onTagSelect={handleTagSelect} />
                            </div>

                            <div className="card p-5">
                                <h3 className="text-lg font-bold mb-4 text-secondary-800">社区推荐</h3>
                                <div className="space-y-4">
                                    <a href="#" className="block group">
                                        <p className="font-medium group-hover:text-primary-600 transition-colors">开发者论坛</p>
                                        <p className="text-sm text-secondary-600">加入技术讨论，解决开发难题</p>
                                    </a>
                                    <a href="#" className="block group">
                                        <p className="font-medium group-hover:text-primary-600 transition-colors">贡献社区</p>
                                        <p className="text-sm text-secondary-600">参与开源项目，提升个人影响力</p>
                                    </a>
                                    <a href="#" className="block group">
                                        <p className="font-medium group-hover:text-primary-600 transition-colors">技术活动</p>
                                        <p className="text-sm text-secondary-600">参加线上/线下技术分享会</p>
                                    </a>
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
                            <div className="grid md:grid-cols-2 gap-6">
                                {articles.map((article) => (
                                    <ArticleCard
                                        key={article.id}
                                        article={article}
                                    />
                                ))}
                            </div>
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

                        {/* 加载更多按钮 */}
                        {articles.length > 0 && (
                            <LoadMoreButton onClick={handleLoadMore} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
