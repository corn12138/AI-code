'use client';

import { Article, Tag } from '@/types';
import { useEffect, useState } from 'react';
import HomeContent from './HomeContent';

export function HomeClientHydration() {
    const [hydrated, setHydrated] = useState(false);
    const [homeData, setHomeData] = useState<{
        articles: Article[];
        tags: Tag[];
    } | null>(null);

    // 从DOM中读取数据属性
    useEffect(() => {
        const container = document.getElementById('home-container');
        if (container) {
            try {
                const articles = JSON.parse(container.getAttribute('data-articles') || '[]');
                const tags = JSON.parse(container.getAttribute('data-tags') || '[]');

                setHomeData({ articles, tags });
            } catch (error) {
                console.error('Failed to parse home data:', error);
            }
        }
        setHydrated(true);
    }, []);

    if (!hydrated || !homeData) {
        return null;
    }

    // 现在在客户端渲染内容，包括所有交互
    return <HomeContent initialArticles={homeData.articles} tags={homeData.tags} />;
}
