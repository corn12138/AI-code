'use client';

import SearchBar from '@/components/ui/SearchBar';
import { useRouter } from 'next/navigation';

export default function HomeHero() {
    const router = useRouter();

    const handleSearch = (query: string) => {
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 mb-8 py-16 text-white">
            <div className="container-content">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">探索技术世界的无限可能</h1>
                    <p className="text-primary-100 mb-8 text-lg">
                        深入了解前沿技术，分享开发经验，提升编程技能
                    </p>
                    <div className="max-w-xl mx-auto">
                        <SearchBar onSearch={handleSearch} placeholder="搜索文章、标签或关键词..." />
                    </div>
                </div>
            </div>
        </div>
    );
}
