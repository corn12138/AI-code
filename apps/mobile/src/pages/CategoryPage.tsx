import React from 'react';
import { useParams } from 'react-router-dom';
import { ArticleList } from '../components/Article/ArticleList';
import { ArticleCategory } from '../types';

const categoryLabels: Record<ArticleCategory, string> = {
  latest: '最新文章',
  frontend: '前端开发',
  backend: '后端开发',
  ai: '人工智能',
  mobile: '移动开发',
  design: 'UI/UX设计',
};

const categoryDescriptions: Record<ArticleCategory, string> = {
  latest: '发现最新技术动态',
  frontend: '前端技术与实践',
  backend: '后端架构与开发',
  ai: 'AI技术与应用',
  mobile: '移动端开发技术',
  design: '设计理念与实践',
};

export const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const currentCategory = (category as ArticleCategory) || 'latest';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {categoryLabels[currentCategory]}
          </h1>
          <div className="text-sm text-gray-500">
            {categoryDescriptions[currentCategory]}
          </div>
        </div>
      </header>

      {/* 文章列表 */}
      <div className="px-4 py-4">
        <ArticleList />
      </div>
    </div>
  );
};
