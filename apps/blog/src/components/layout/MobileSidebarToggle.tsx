'use client';

import { useState } from 'react';

/**
 * 移动端侧边栏切换按钮 - 客户端组件
 * 
 * 只在移动端需要交互时使用客户端渲染
 * 大厂最佳实践：将交互逻辑限制在最小范围内
 */

export function MobileSidebarToggle() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <>
            {/* 移动端侧边栏背景遮罩 */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* 移动端侧边栏切换按钮 */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-md p-2 shadow-md border border-gray-200"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
                {isMobileSidebarOpen ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>
        </>
    );
}