import ClientPageWrapper from '@/components/ClientPageWrapper';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { fetchArticleById } from '@/services/api';
import { formatDate } from '@/utils/date';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

// 动态生成元数据
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;
    const article = await fetchArticleById(id);

    if (!article) {
        return {
            title: '文章未找到',
            description: '您请求的文章不存在或已被删除',
        };
    }

    return {
        title: article.title,
        description: article.excerpt || article.content.substring(0, 160),
        openGraph: {
            title: article.title,
            description: article.excerpt || article.content.substring(0, 160),
            images: article.coverImage ? [article.coverImage] : [],
        },
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const article = await fetchArticleById(id);

    if (!article) {
        notFound();
    }

    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                <article className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

                    {/* 文章元信息 */}
                    <div className="flex items-center mb-6 text-gray-600">
                        <div className="flex items-center mr-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-2">
                                <Image
                                    src={article.author.avatar || "/default-avatar.svg"}
                                    alt={article.author.username}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <span>{article.author.username}</span>
                        </div>
                        <span className="mr-4">{formatDate(article.createdAt)}</span>
                        <span>{article.readingTime} 分钟阅读</span>
                    </div>

                    {/* 文章封面图 */}
                    {article.coverImage && (
                        <div className="relative h-80 w-full mb-8">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-lg"
                            />
                        </div>
                    )}

                    {/* 文章内容 - 使用Markdown渲染器 */}
                    <div className="prose prose-lg max-w-none">
                        <MarkdownRenderer content={article.content} />
                    </div>
                </article>
            </div>
        </ClientPageWrapper>
    );
}
