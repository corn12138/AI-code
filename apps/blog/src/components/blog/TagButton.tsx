'use client';

import { Tag } from '@/types';

interface TagButtonProps {
    tag: Tag;
    isSelected: boolean;
    onClick: () => void;
}

export default function TagButton({ tag, isSelected, onClick }: TagButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center ${isSelected
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-secondary-600 hover:bg-gray-200'
                }`}
        >
            {tag.name}
            {tag.count && <span className="ml-1 text-xs opacity-75">({tag.count})</span>}
        </button>
    );
}
