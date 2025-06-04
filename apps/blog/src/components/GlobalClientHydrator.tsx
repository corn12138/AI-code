'use client';

import { useEffect } from 'react';
import { BlogClientHydration } from './blog/BlogClientHydration';
import { HomeClientHydration } from './home/HomeClientHydration';

export function GlobalClientHydrator() {
    useEffect(() => {
        // 这里可以添加全局的客户端初始化逻辑
    }, []);

    return (
        <>
            {document.getElementById('home-container') && <HomeClientHydration />}
            {document.getElementById('blog-container') && <BlogClientHydration />}
            {/* 添加更多水合器 */}
        </>
    );
}
