'use client';

import { Article, Tag } from '@/types';
import HomeContent from '@/components/home/HomeContent';

interface ClientHomeInteractivityProps {
  initialArticles: Article[];
  tags: Tag[];
}

export function ClientHomeInteractivity({ initialArticles, tags }: ClientHomeInteractivityProps) {
  // 这里可以添加所有客户端交互逻辑

  return <HomeContent initialArticles={initialArticles} tags={tags} />;
}
