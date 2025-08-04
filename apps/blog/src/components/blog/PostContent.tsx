'use client';

import 'prismjs';
import 'prismjs/themes/prism.css';
import { useEffect } from 'react';

interface PostContentProps {
    content: string;
}

export default function PostContent({ content }: PostContentProps) {
    useEffect(() => {
        // 在客户端加载语法高亮
        if (typeof window !== 'undefined') {
            // @ts-ignore
            if (window.Prism) window.Prism.highlightAll();
        }
    }, [content]);

    return (
        <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
} 