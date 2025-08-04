'use client';

import { Article as Post } from '@/types';
import Link from 'next/link';

interface RelatedPostsProps {
    posts: Post[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
    if (!posts.length) {
        return <p>没有相关文章</p>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {posts.map(post => (
                <div key={post.id} className="border rounded p-4">
                    <h3 className="font-bold mb-2">
                        <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                            {post.title}
                        </Link>
                    </h3>
                    {post.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {post.excerpt}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
} 