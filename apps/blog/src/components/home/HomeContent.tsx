'use client';

import { useState } from 'react';
import { ArticleCard } from './ArticleCard';
import { FilterTabs } from './FilterTabs';
import { LoadMoreButton } from './LoadMoreButton';

interface Article {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
        company?: string;
    };
    tags: string[];
    likeCount: number;
    commentCount: number;
    viewCount: number;
    publishedAt: string;
    readTime: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
}

interface HomeContentProps {
    articles: Article[];
}

export function HomeContent({ articles }: HomeContentProps) {
    const [currentTab, setCurrentTab] = useState('推荐');
    const [filteredArticles, setFilteredArticles] = useState(articles);

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
        // 这里可以根据 tab 过滤文章
        // 在实际应用中，这里会调用 API 获取不同类型的文章
        setFilteredArticles(articles);
    };

    return (
        <>
            {/* 交互式过滤标签 */}
            <FilterTabs currentTab={currentTab} onTabChange={handleTabChange} />

            {/* 文章列表 */}
            <div className="space-y-6">
                {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>

            {/* 加载更多 */}
            <LoadMoreButton />
        </>
    );
}

export type { Article };
