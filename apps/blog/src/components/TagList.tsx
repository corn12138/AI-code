'use client';

import { Tag } from '@/types';
import { useState } from 'react';

interface TagListProps {
    tags: Tag[];
    selectedTag: string | null;
    onTagSelect: (tagName: string) => void;
}

export default function TagList({ tags, selectedTag, onTagSelect }: TagListProps) {
    const [expanded, setExpanded] = useState(false);

    // 默认显示10个标签，展开后显示全部
    const visibleTags = expanded ? tags : tags.slice(0, 10);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {visibleTags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => onTagSelect(tag.name)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTag === tag.name
                            ? 'bg-primary-500 text-white font-medium shadow-sm'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            }`}
                    >
                        {tag.name}
                        {tag.count && (
                            <span className={`ml-1.5 text-xs ${selectedTag === tag.name ? 'text-white/80' : 'text-secondary-500'
                                }`}>
                                {tag.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {tags.length > 10 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                    {expanded ? '收起' : `显示更多 (${tags.length - 10})`}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ml-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
}
