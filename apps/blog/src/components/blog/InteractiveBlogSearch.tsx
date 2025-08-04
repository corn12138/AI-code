'use client';

import { HydrationBoundary } from '@/components/common/HydrationBoundary';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface InteractiveBlogSearchProps {
    initialSearch?: string;
}

function SearchComponent({ initialSearch = '' }: InteractiveBlogSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        setIsLoading(true);

        const params = new URLSearchParams(searchParams.toString());

        if (query.trim()) {
            params.set('search', query.trim());
        } else {
            params.delete('search');
        }

        // 重置页码
        params.delete('page');

        try {
            router.push(`/blog?${params.toString()}`);
        } catch (error) {
            console.error('Search navigation error:', error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    const handleClear = () => {
        setSearchQuery('');
        handleSearch('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索文章..."
                    className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                />

                {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                    {isLoading ? '...' : '搜索'}
                </button>
            </div>
        </form>
    );
}

export function InteractiveBlogSearch({ initialSearch }: InteractiveBlogSearchProps) {
    // 搜索功能的静态降级方案
    const staticFallback = (
        <form action="/blog" method="get" className="relative">
            <input
                type="text"
                name="search"
                defaultValue={initialSearch}
                placeholder="搜索文章..."
                className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg"
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
            >
                搜索
            </button>
        </form>
    );

    return (
        <HydrationBoundary
            fallback={staticFallback}
            errorFallback={staticFallback}
        >
            <SearchComponent initialSearch={initialSearch} />
        </HydrationBoundary>
    );
} 