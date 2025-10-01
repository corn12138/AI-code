import clsx from 'clsx';
import {
    Bot,
    Code,
    Home,
    Palette,
    Server,
    Smartphone
} from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useArticleStore } from '../../store/articleStore';
import { ArticleCategory } from '../../types';

interface TabItem {
    key: ArticleCategory;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    path: string;
}

const tabs: TabItem[] = [
    { key: 'latest', label: '最新', icon: Home, path: '/' },
    { key: 'frontend', label: '前端', icon: Code, path: '/frontend' },
    { key: 'backend', label: '后端', icon: Server, path: '/backend' },
    { key: 'ai', label: 'AI', icon: Bot, path: '/ai' },
    { key: 'mobile', label: '移动端', icon: Smartphone, path: '/mobile' },
    { key: 'design', label: '设计', icon: Palette, path: '/design' },
];

export const TabNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setCurrentCategory } = useArticleStore();

    const handleTabClick = (tab: TabItem) => {
        setCurrentCategory(tab.key);
        navigate(tab.path);
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-pb">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.path);

                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabClick(tab)}
                            className={clsx(
                                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1',
                                active
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                        >
                            <Icon
                                size={20}
                                className={clsx(
                                    'mb-1',
                                    active ? 'text-blue-600' : 'text-gray-600'
                                )}
                            />
                            <span className={clsx(
                                'text-xs font-medium truncate',
                                active ? 'text-blue-600' : 'text-gray-600'
                            )}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
