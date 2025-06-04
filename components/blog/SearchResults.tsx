'use client';

import { Post } from '@/types';
import { useState } from 'react';
import PostCard from './PostCard';

interface SearchResultsProps {
    initialResults: Post[];
    initialQuery: string;
}

export default function SearchResults({
    initialResults,
    initialQuery
}: SearchResultsProps) {
    const [results] = useState<Post[]>(initialResults);

    if (initialQuery === '') {
        return <p>请输入搜索词</p>;
    }

    if (results.length === 0) {
        return <p>没有找到匹配"{initialQuery}"的结果</p>;
    }

    return (
        <div>
            <p className="mb-6">找到 {results.length} 个与"{initialQuery}"相关的结果</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
