import { Tag } from '@/types';
import { useState } from 'react';

interface TagSelectorProps {
    availableTags: Tag[];
    selectedTags: string[];
    onChange: (selectedTagIds: string[]) => void;
}

export default function TagSelector({
    availableTags,
    selectedTags,
    onChange
}: TagSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTags = searchQuery
        ? availableTags.filter(tag =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : availableTags;

    const handleTagClick = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onChange(selectedTags.filter(id => id !== tagId));
        } else {
            // 最多选择5个标签
            if (selectedTags.length < 5) {
                onChange([...selectedTags, tagId]);
            }
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                选择标签（最多5个）
            </label>

            {/* 搜索标签 */}
            <input
                type="text"
                placeholder="搜索标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* 已选择的标签 */}
            {selectedTags.length > 0 && (
                <div className="mb-2">
                    <div className="text-sm text-gray-600 mb-1">已选择:</div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tagId => {
                            const tag = availableTags.find(t => t.id === tagId);
                            return tag ? (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => handleTagClick(tag.id)}
                                        className="ml-1.5 inline-flex text-blue-600 hover:text-blue-800 focus:outline-none"
                                    >
                                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* 可选标签列表 */}
            <div className="bg-gray-50 border border-gray-300 rounded p-2 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                    {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagClick(tag.id)}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedTags.includes(tag.id)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {tag.name}
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">没有找到匹配的标签</p>
                    )}
                </div>
            </div>
        </div>
    );
}
