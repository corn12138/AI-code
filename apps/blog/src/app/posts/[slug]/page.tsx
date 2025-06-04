// 服务器组件
import CommentSection from '@/components/blog/CommentSection';
import PostContent from '@/components/blog/PostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';
import ShareButtons from '@/components/blog/ShareButtons';
import { getAllSlugs, getPostBySlug } from '@/lib/posts';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const slugs = await getAllSlugs();
    return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        return {
            title: '文章未找到',
            description: '请求的文章不存在'
        };
    }

    return {
        title: post.title,
        description: post.excerpt
    };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.id, post.tags);

    return (
        <article className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="text-gray-600 mb-6">
                发布于: {post.date} · 阅读时间: {post.readingTime}分钟
            </div>

            <PostContent content={post.content} />

            <div className="mt-8 border-t pt-6">
                <ShareButtons title={post.title} slug={params.slug} />
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">相关文章</h2>
                <RelatedPosts posts={relatedPosts} />
            </div>

            <CommentSection postId={post.id} />
        </article>
    );
}
