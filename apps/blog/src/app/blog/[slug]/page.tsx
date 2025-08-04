import { ClientArticlePage } from '@/components/blog/ClientArticlePage';
import { fetchArticleById } from '@/services/api';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

// 动态生成文章页的元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await fetchArticleById(slug);

    if (!article) {
        return {
            title: '文章未找到',
        };
    }

    return {
        title: article.title,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt || undefined,
            images: article.coverImage ? [article.coverImage] : [],
        },
    };
}

export default async function ArticlePage({ params }: Props) {
    // 获取文章数据
    const { slug } = await params;
    const article = await fetchArticleById(slug);

    if (!article) {
        notFound();
    }

    // 将数据传递给客户端组件以处理交互
    return <ClientArticlePage article={article} />;
}
