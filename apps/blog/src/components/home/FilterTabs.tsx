'use client';

interface FilterTabsProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = ['推荐', '最新', '热门', '关注'];

export function FilterTabs({ currentTab, onTabChange }: FilterTabsProps) {
    return (
        <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`pb-2 text-sm font-medium whitespace-nowrap transition-colors ${currentTab === tab
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
