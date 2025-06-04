'use client';

import { Post } from '@/types';
import { useState } from 'react';
import PostCard from './PostCard';

interface PostListProps {
    initialPosts: Post[];
}

export default function PostList({ initialPosts }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    // 客户端分页逻辑
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

    return (
        <div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {/* 分页控件 */}
            <div className="flex justify-center mt-8">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 bg-gray-200 disabled:bg-gray-100"
                >
                    上一页
                </button>

                <span className="px-4 py-2">
                    {currentPage} / {totalPages}
                </span>

                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-1 bg-gray-200 disabled:bg-gray-100"
                >
                    下一页
                </button>
            </div>
        </div>
    );
}
