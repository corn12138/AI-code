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
        <div className="space-y-4">
            <label className="block text-sm font-medium text-space-200">
                选择标签（最多5个）
            </label>

            {/* 搜索标签 */}
            <input
                type="text"
                placeholder="搜索标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 bg-space-800/60 border border-cosmic-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 focus:border-cosmic-400/50 text-space-200 placeholder-space-500 backdrop-blur-sm transition-all duration-300"
            />

            {/* 已选择的标签 */}
            {selectedTags.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm text-space-400">已选择:</div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tagId => {
                            const tag = availableTags.find(t => t.id === tagId);
                            return tag ? (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white shadow-cosmic"
                                >
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => handleTagClick(tag.id)}
                                        className="ml-1.5 inline-flex text-white/80 hover:text-white focus:outline-none transition-colors duration-300"
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
            <div className="bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl p-4 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                    {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagClick(tag.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedTags.includes(tag.id)
                                    ? 'bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white shadow-cosmic'
                                    : 'bg-space-800/60 text-space-300 hover:bg-cosmic-600/20 hover:text-cosmic-300 hover:border hover:border-cosmic-500/30 backdrop-blur-sm'
                                    }`}
                            >
                                {tag.name}
                            </button>
                        ))
                    ) : (
                        <p className="text-space-500 text-sm">没有找到匹配的标签</p>
                    )}
                </div>
            </div>
        </div>
    );
}
