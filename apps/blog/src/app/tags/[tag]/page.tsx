import { ClientTagPage } from '@/components/tags/ClientTagPage';
import { fetchArticles, fetchTags } from '@/services/api';
import { Tag } from '@/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    params: { tag: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { tag } = params;
    const decodedTag = decodeURIComponent(tag);

    return {
        title: `${decodedTag} - 相关文章`,
        description: `查看与${decodedTag}相关的技术文章、教程和资源`,
    };
}

export default async function TagPage({ params }: Props) {
    const { tag } = params;
    const decodedTag = decodeURIComponent(tag);

    // 获取相关文章
    const articles = await fetchArticles({ tag: decodedTag });
    const allTags = await fetchTags();

    // 获取当前标签详细信息
    const currentTag = allTags.find((t: Tag) => t.name.toLowerCase() === decodedTag.toLowerCase());

    if (!currentTag) {
        notFound();
    }

    // 传递数据给客户端组件
    return <ClientTagPage
        currentTag={currentTag}
        articles={articles}
        allTags={allTags}
    />;
}
