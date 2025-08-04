// 服务器组件
import CommentSection from '@/components/blog/CommentSection';
import PostContent from '@/components/blog/PostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';
import ShareButtons from '@/components/blog/ShareButtons';
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const slugs = await getAllSlugs();
    return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: '文章未找到',
            description: '请求的文章不存在'
        };
    }

    return {
        title: (post as any).title || '文章',
        description: (post as any).excerpt || '文章内容'
    };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.id, (post as any).tags || []);

    return (
        <article className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4">{(post as any).title || '无标题'}</h1>
            <div className="text-gray-600 mb-6">
                发布于: {(post as any).date || '未知日期'} · 阅读时间: {(post as any).readingTime || 5}分钟
            </div>

            <PostContent content={post.content} />

            <div className="mt-8 border-t pt-6">
                <ShareButtons title={(post as any).title || '文章'} slug={slug} />
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">相关文章</h2>
                <RelatedPosts posts={relatedPosts} />
            </div>

            <CommentSection articleId={post.id} />
        </article>
    );
}
