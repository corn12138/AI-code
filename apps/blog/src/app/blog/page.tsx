import { StaticBlogContent } from '@/components/blog/StaticBlogContent';
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
    searchParams: Promise<{ tag?: string; search?: string; page?: string; }>
}) {
    const params = await searchParams;
    const tag = params.tag;
    const search = params.search;
    const page = params.page ? parseInt(params.page) : 1;

    // 获取文章和标签
    const { articles, pagination } = await fetchArticles({
        tag,
        search,
        page,
        limit: 10,
    });

    const tags = await fetchTags();

    // 计算总页数
    const totalPages = pagination?.totalPages || Math.ceil((pagination?.totalCount || 62) / 10);

    // 使用静态组件，只有搜索功能需要水合
    return (
        <StaticBlogContent
            articles={articles}
            tags={tags}
            initialSearch={search || ''}
            currentTag={tag || ''}
            currentPage={page}
            totalPages={totalPages}
        />
    );
}
