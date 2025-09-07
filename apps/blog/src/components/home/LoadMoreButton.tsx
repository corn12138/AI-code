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
                className="relative px-8 py-3 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-xl hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-cosmic hover:shadow-nebula hover:scale-105 group"
            >
                {/* 加载动画 */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* 按钮文本 */}
                <span className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    {loading ? '加载中...' : '加载更多'}
                </span>

                {/* 悬停时的光晕效果 */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cosmic-500/20 to-nebula-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
        </div>
    );
}
