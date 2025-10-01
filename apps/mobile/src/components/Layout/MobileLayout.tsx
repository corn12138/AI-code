import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabNavigation } from './TabNavigation';

export const MobileLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 主内容区域 */}
            <main className="flex-1 pb-16">
                <Outlet />
            </main>

            {/* 底部导航 */}
            <TabNavigation />
        </div>
    );
};
