'use client';

import { Tag } from '@/types';
import TagList from '../blog/TagList';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TagSidebarProps {
    tags: Tag[];
}

export default function TagSidebar({ tags }: TagSidebarProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const router = useRouter();

    const handleTagSelect = (tagName: string) => {
        if (selectedTag === tagName) {
            setSelectedTag(null);
            router.push('/');
        } else {
            setSelectedTag(tagName);
            router.push(`/tag/${tagName}`);
        }
    };

    return (
        <div className="sticky top-24 space-y-8">
            <div className="card p-5">
                <h3 className="text-lg font-bold mb-4 text-secondary-800">热门标签</h3>
                <TagList tags={tags} selectedTag={selectedTag} onTagSelect={handleTagSelect} />
            </div>

            <div className="card p-5">
                <h3 className="text-lg font-bold mb-4 text-secondary-800">社区推荐</h3>
                <div className="space-y-4">
                    <a href="#" className="block group">
                        <p className="font-medium group-hover:text-primary-600 transition-colors">开发者论坛</p>
                        <p className="text-sm text-secondary-600">加入技术讨论，解决开发难题</p>
                    </a>
                    <a href="#" className="block group">
                        <p className="font-medium group-hover:text-primary-600 transition-colors">贡献社区</p>
                        <p className="text-sm text-secondary-600">参与开源项目，提升个人影响力</p>
                    </a>
                    <a href="#" className="block group">
                        <p className="font-medium group-hover:text-primary-600 transition-colors">技术活动</p>
                        <p className="text-sm text-secondary-600">参加线上/线下技术分享会</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
