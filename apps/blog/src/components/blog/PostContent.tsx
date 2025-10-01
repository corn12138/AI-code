'use client';

import 'prismjs';
import 'prismjs/themes/prism.css';
import { useEffect, useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';

interface PostContentProps {
    content: string;
}

export default function PostContent({ content }: PostContentProps) {
    const sanitizedContent = useMemo(() => {
        return sanitizeHtml(content, {
            allowedTags: [
                ...sanitizeHtml.defaults.allowedTags,
                'img',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6'
            ],
            allowedAttributes: {
                '*': ['class'],
                a: ['href', 'name', 'target', 'rel'],
                img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
                code: ['class'],
                pre: ['class']
            },
            allowedSchemes: ['http', 'https', 'mailto', 'tel'],
            transformTags: {
                a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
            }
        });
    }, [content]);

    useEffect(() => {
        // 在客户端加载语法高亮
        if (typeof window !== 'undefined') {
            // @ts-ignore
            if (window.Prism) window.Prism.highlightAll();
        }
    }, [sanitizedContent]);

    return (
        <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}
