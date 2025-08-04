'use client';

import { useEffect, useState } from 'react';

interface ShareButtonsProps {
    title: string;
    slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const shareOnTwitter = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    const shareOnFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert('链接已复制到剪贴板!');
    };

    return (
        <div className="flex space-x-4">
            <span className="mr-2">分享文章:</span>
            <button onClick={shareOnTwitter}>Twitter</button>
            <button onClick={shareOnFacebook}>Facebook</button>
            <button onClick={copyLink}>复制链接</button>
        </div>
    );
} 