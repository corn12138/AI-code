'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="mb-8">
            <div className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索文章..."
                    className="flex-1 p-2 border rounded-l"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-r"
                >
                    搜索
                </button>
            </div>
        </form>
    );
}
