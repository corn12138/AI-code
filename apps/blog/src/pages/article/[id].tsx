import ArticleMeta from '@/components/ArticleMeta';
import AuthorCard from '@/components/AuthorCard';
import CommentSection from '@/components/CommentSection';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MainLayout from '@/layouts/MainLayout';
import { fetchArticleById, fetchArticles } from '@/services/api';
import { Article } from '@/types';
import { useAuth } from '@shared/auth';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ArticleDetailProps {
    article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    // 如果页面还在生成中，显示加载状态
    if (router.isFallback) {
        return (
            <MainLayout>
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // 未登录用户重定向到登录页面
    useEffect(() => {
        if (!isAuthenticated) {
            const currentPath = router.asPath;
            router.push(`/login?next=${encodeURIComponent(currentPath)}`);
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null; // 未登录不渲染内容
    }

    return (
        <>
            <Head>
                <title>{article.title} | 技术博客与低代码平台</title>
                <meta name="description" content={article.excerpt || article.title} />
                {/* 结构化数据 - JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: article.title,
                            datePublished: article.createdAt,
                            dateModified: article.updatedAt,
                            author: {
                                '@type': 'Person',
                                name: article.author.username,
                            },
                        }),
                    }}
                />
            </Head>

            <MainLayout>
                <article className="max-w-3xl mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold mb-6">{article.title}</h1>

                    <ArticleMeta
                        author={article.author}
                        date={article.createdAt}
                        readingTime={calculateReadingTime(article.content)}
                        views={article.views || 0}
                    />

                    <div className="mt-8 prose prose-lg max-w-none">
                        <MarkdownRenderer content={article.content} />
                    </div>

                    <div className="border-t border-gray-200 mt-12 pt-8">
                        <AuthorCard author={article.author} />
                    </div>

                    <div className="mt-12">
                        <CommentSection articleId={article.id} />
                    </div>
                </article>
            </MainLayout>
        </>
    );
}

// 计算阅读时间的函数
function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
}

export const getStaticPaths: GetStaticPaths = async () => {
    try {
        const articles = await fetchArticles({ limit: 10 });

        const paths = articles.map((article) => ({
            params: { id: article.id },
        }));

        return {
            paths,
            fallback: true, // 未生成的页面不返回404
        };
    } catch (error) {
        return {
            paths: [],
            fallback: true,
        };
    }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    try {
        const article = await fetchArticleById(params?.id as string);

        if (!article) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                article,
            },
            // 每5分钟重新生成页面
            revalidate: 300,
        };
    } catch (error) {
        return {
            notFound: true,
        };
    }
};
