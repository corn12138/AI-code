import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import TagList from '@/components/TagList';
import MainLayout from '@/layouts/MainLayout';
import { fetchArticles, fetchTags } from '@/services/api';
import { Article, Tag } from '@/types';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface HomeProps {
    articles: Article[];
    tags: Tag[];
}

export default function Home({ articles: initialArticles, tags }: HomeProps) {
    const router = useRouter();
    const [articles, setArticles] = useState(initialArticles);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const handleTagSelect = async (tagName: string) => {
        if (selectedTag === tagName) {
            setSelectedTag(null);
            setArticles(initialArticles);
        } else {
            setSelectedTag(tagName);
            const taggedArticles = await fetchArticles({ tag: tagName });
            setArticles(taggedArticles);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setArticles(initialArticles);
            return;
        }

        const searchResults = await fetchArticles({ search: query });
        setArticles(searchResults);
    };

    return (
        <>
            <Head>
                <title>博客首页 | 技术博客与低代码平台</title>
                <meta name="description" content="发现优质技术文章，分享编程经验与知识" />
            </Head>

            <MainLayout>
                <div className="max-w-screen-xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* 侧边栏 */}
                        <div className="md:w-1/4">
                            <div className="sticky top-24">
                                <SearchBar onSearch={handleSearch} />
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">热门标签</h3>
                                    <TagList tags={tags} selectedTag={selectedTag} onTagSelect={handleTagSelect} />
                                </div>
                            </div>
                        </div>

                        {/* 文章列表 */}
                        <div className="md:w-3/4">
                            <h1 className="text-3xl font-bold mb-8">
                                {selectedTag ? `${selectedTag} 相关文章` : '最新文章'}
                            </h1>

                            {articles.length > 0 ? (
                                <div className="space-y-8">
                                    {articles.map((article) => (
                                        <ArticleCard key={article.id} article={article} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">暂无文章</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MainLayout>
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
            // 每10分钟重新生成页面
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
