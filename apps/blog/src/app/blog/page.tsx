import { fetchArticles, fetchTags } from '@/services/api';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '博客文章',
    description: '浏览我们的技术文章、教程和见解',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage({
    searchParams
}: {
    searchParams: { tag?: string; search?: string; page?: string; }
}) {
    const tag = searchParams.tag;
    const search = searchParams.search;
    const page = searchParams.page ? parseInt(searchParams.page) : 1;

    // 获取文章和标签
    const articles = await fetchArticles({
        tag,
        search,
        page,
        limit: 10,
    });

    const tags = await fetchTags();

    // 将所有数据传给客户端组件，不要在服务器组件中放置交互逻辑
    return (
        <div className="container mx-auto px-4 py-8">
            {/* 客户端组件占位符 - 我们将通过客户端水合来处理交互 */}
            <div id="blog-container"
                data-articles={JSON.stringify(articles)}
                data-tags={JSON.stringify(tags)}
                data-search={search || ''}
                data-tag={tag || ''}
                data-page={page}
            />
        </div>
    );
}
