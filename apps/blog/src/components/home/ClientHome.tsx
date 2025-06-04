'use client';

import { Article, Tag } from '@/types';
import HomeContent from './HomeContent';

interface ClientHomeProps {
    initialArticles: Article[];
    tags: Tag[];
}

export function ClientHome({ initialArticles, tags }: ClientHomeProps) {
    // 客户端交互逻辑可以放在这里
    return <HomeContent initialArticles={initialArticles} tags={tags} />;
}
