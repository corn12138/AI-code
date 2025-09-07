// 服务器组件
import ArticleList from '@/components/blog/ArticleList';
import SearchForm from '@/components/search/SearchForm';
import { fetchArticles } from '@/services/api';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic'; // 确保每次请求都重新渲染

interface Props {
    searchParams: Promise<{
        q?: string;
    }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams;
    const query = q || '';
    return {
        title: query ? `搜索: ${query}` : '搜索文章',
        description: '在技术博客与低代码平台中搜索相关技术文章',
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const { q } = await searchParams;
    const query = q || '';
    const result = query ? await fetchArticles({ search: query }) : { articles: [] };
    const articles = Array.isArray(result) ? result : result.articles;

    return (
        <div className="container-content mt-8 mb-16">
            <h1 className="text-3xl font-bold mb-6 text-space-200">文章搜索</h1>

            <div className="mb-8 max-w-2xl">
                <SearchForm initialQuery={query} />
            </div>

            {query && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-space-200">
                        "{query}" 的搜索结果 ({articles.length})
                    </h2>
                </div>
            )}

            {query ? (
                <ArticleList initialArticles={articles} />
            ) : (
                <div className="text-center py-16 text-space-500 bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl">
                    <p>请输入搜索关键词以查找文章</p>
                </div>
            )}
        </div>
    );
}
