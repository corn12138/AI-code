import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import TagList from '@/components/TagList';
import MainLayout from '@/layouts/MainLayout';
import { fetchArticles, fetchTags } from '@/services/api';
import { Article, Tag } from '@/types';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SafeHydration from '../components/SafeHydration';

// 无SSR导入动态组件
const DynamicComponent = dynamic(() => import('../components/ClientComponent'), {
    ssr: false,
});

interface HomeProps {
    articles: Article[];
    tags: Tag[];
}

export default function Home({ articles: initialArticles, tags }: HomeProps) {
    const router = useRouter();
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

    return (
        <>
            <Head>
                <title>博客首页 | 技术博客与低代码平台</title>
                <meta name="description" content="发现优质技术文章，分享编程经验与知识" />
            </Head>

            <MainLayout>
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
                                <div className="mt-10 text-center">
                                    <button className="btn-outline">
                                        加载更多
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MainLayout>

            {/* 动态/客户端内容用SafeHydration包裹 */}
            <SafeHydration>
                <DynamicComponent />
            </SafeHydration>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    try {
        const articles = await fetchArticles();
        const tags = await fetchTags();

        return {
            props: {
                articles,
                tags,
            },
            revalidate: 600,
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            props: {
                articles: [],
                tags: [],
            },
            revalidate: 60,
        };
    }
};
