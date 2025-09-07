'use client';

interface FilterTabsProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = ['推荐', '最新', '热门', '关注'];

export function FilterTabs({ currentTab, onTabChange }: FilterTabsProps) {
    return (
        <div className="flex items-center space-x-1 mb-6 p-1 bg-space-900/40 backdrop-blur-xl rounded-xl border border-cosmic-500/20 overflow-hidden">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out rounded-lg ${currentTab === tab
                        ? 'text-cosmic-300 bg-gradient-to-r from-cosmic-600/20 to-nebula-600/20 shadow-cosmic'
                        : 'text-space-400 hover:text-cosmic-300 hover:bg-space-800/50'
                        }`}
                >
                    {tab}
                    {currentTab === tab && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 animate-pulse-slow" />
                    )}
                </button>
            ))}
        </div>
    );
}
