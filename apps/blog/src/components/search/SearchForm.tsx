'use client';

import { useDebounce } from '@corn12138/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SearchFormProps {
    initialQuery?: string;
}

export default function SearchForm({ initialQuery = '' }: SearchFormProps) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();
    const debouncedSearchTerm = useDebounce(query, 300);

    // 处理表单提交
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    // 执行搜索逻辑
    const performSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // 跳转到带有搜索查询的搜索页面
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    // 防抖搜索
    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm !== initialQuery) {
            performSearch(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, initialQuery]);

    return (
        <form onSubmit={handleFormSubmit} className="relative">
            <div className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索文章、标签或关键词..."
                    className="w-full px-5 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-r-md"
                >
                    搜索
                </button>
            </div>
        </form>
    );
}
