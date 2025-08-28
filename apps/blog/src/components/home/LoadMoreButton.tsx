'use client';

import { useState } from 'react';

export function LoadMoreButton() {
    const [loading, setLoading] = useState(false);

    const handleLoadMore = async () => {
        setLoading(true);
        // 模拟加载更多文章的 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
    };

    return (
        <div className="text-center py-8">
            <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '加载中...' : '加载更多'}
            </button>
        </div>
    );
}
