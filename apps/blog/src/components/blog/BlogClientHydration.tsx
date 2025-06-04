'use client';

import { Article, Tag } from '@/types';
import { useEffect, useState } from 'react';
import { ClientBlogPage } from './ClientBlogPage';

export function BlogClientHydration() {
    const [hydrated, setHydrated] = useState(false);
    const [blogData, setBlogData] = useState<{
        articles: Article[];
        tags: Tag[];
        search: string;
        tag: string;
        page: number;
    } | null>(null);

    // 从DOM中读取数据属性
    useEffect(() => {
        const container = document.getElementById('blog-container');
        if (container) {
            try {
                const articles = JSON.parse(container.getAttribute('data-articles') || '[]');
                const tags = JSON.parse(container.getAttribute('data-tags') || '[]');
                const search = container.getAttribute('data-search') || '';
                const tag = container.getAttribute('data-tag') || '';
                const page = parseInt(container.getAttribute('data-page') || '1', 10);

                setBlogData({ articles, tags, search, tag, page });
            } catch (error) {
                console.error('Failed to parse blog data:', error);
            }
        }
        setHydrated(true);
    }, []);

    if (!hydrated || !blogData) {
        return null;
    }

    // 现在在客户端渲染内容，包括所有交互
    return (
        <ClientBlogPage
            articles={blogData.articles}
            tags={blogData.tags}
            initialSearch={blogData.search}
            currentTag={blogData.tag}
            currentPage={blogData.page}
        />
    );
}
