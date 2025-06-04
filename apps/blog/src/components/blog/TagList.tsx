'use client';

import { Tag } from '@/types';
import TagButton from './TagButton';

interface TagListProps {
    tags: Tag[];
    selectedTag: string | null;
    onTagSelect: (tagName: string) => void;
}

export default function TagList({ tags, selectedTag, onTagSelect }: TagListProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <TagButton
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTag === tag.name}
                    onClick={() => onTagSelect(tag.name)}
                />
            ))}
        </div>
    );
}