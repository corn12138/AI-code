'use client';

import { Post } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <article
            className={`border rounded-lg overflow-hidden transition-shadow ${isHovered ? 'shadow-lg' : 'shadow'
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {post.coverImage && (
                <div className="relative h-48 w-full">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            <div className="p-4">
                <h2 className="text-xl font-bold mb-2">
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                    </Link>
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {new Date(post.date).toLocaleDateString()} · {post.readingTime}分钟阅读
                </p>

                {post.excerpt && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                        {post.excerpt}
                    </p>
                )}

                {post.tags && (
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
