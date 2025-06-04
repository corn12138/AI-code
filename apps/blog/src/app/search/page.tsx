// 服务器组件
import { fetchArticles } from '@/services/api';
import ArticleList from '@/components/blog/ArticleList';
import { Metadata } from 'next';
import SearchForm from '@/components/search/SearchForm';

export const dynamic = 'force-dynamic'; // 确保每次请求都重新渲染

interface Props {
    searchParams: {
        q?: string;
    };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const query = searchParams.q || '';
    return {
        title: query ? `搜索: ${query}` : '搜索文章',
        description: '在技术博客与低代码平台中搜索相关技术文章',
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const query = searchParams.q || '';
    const articles = query ? await fetchArticles({ search: query }) : [];

    return (
        <div className="container-content mt-8 mb-16">
            <h1 className="text-3xl font-bold mb-6">文章搜索</h1>

            <div className="mb-8 max-w-2xl">
                <SearchForm initialQuery={query} />
            </div>

            {query && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                        "{query}" 的搜索结果 ({articles.length})
                    </h2>
                </div>
            )}

            {query ? (
                <ArticleList initialArticles={articles} />
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <p>请输入搜索关键词以查找文章</p>
                </div>
            )}
        </div>
    );
}
