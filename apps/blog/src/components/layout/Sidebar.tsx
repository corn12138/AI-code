import { Suspense } from 'react';
import { InteractiveSidebarContent } from './InteractiveSidebarContent';
import { StaticSidebarContent } from './StaticSidebarContent';

/**
 * 侧边栏组件 - 拆分为静态和动态部分
 * 
 * 优化策略：
 * 1. 静态导航项在服务端渲染
 * 2. 需要认证状态的部分使用客户端组件
 * 3. 使用 Suspense 优化加载体验
 */
export function Sidebar() {
    return (
        <div className="fixed lg:relative lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen z-40 transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0">
            <div className="sticky top-0 p-4 lg:p-6 space-y-4 lg:space-y-6 pt-16 lg:pt-6">
                {/* 静态导航内容 - 服务端渲染 */}
                <StaticSidebarContent />

                {/* 动态认证相关内容 - 客户端渲染 */}
                <Suspense fallback={
                    <div className="pt-4 border-t border-gray-200">
                        <div className="animate-pulse space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-8 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                }>
                    <InteractiveSidebarContent />
                </Suspense>
            </div>
        </div>
    );
}
