import React from 'react';
import { ArticleList } from '../components/Article/ArticleList';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 头部 */}
            <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">最新文章</h1>
                    <div className="text-sm text-gray-500">
                        发现最新技术动态
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
