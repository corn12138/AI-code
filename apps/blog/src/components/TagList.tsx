import { Tag } from '@/types';

interface TagListProps {
    tags: Tag[];
    selectedTag: string | null;
    onTagSelect: (tagName: string) => void;
}

export default function TagList({ tags, selectedTag, onTagSelect }: TagListProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <button
                    key={tag.id}
                    onClick={() => onTagSelect(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm ${selectedTag === tag.name
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {tag.name}
                </button>
            ))}
            {tags.length === 0 && (
                <p className="text-gray-500 text-sm">暂无标签</p>
            )}
        </div>
    );
}
