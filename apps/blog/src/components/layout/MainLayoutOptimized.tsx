import { Suspense } from 'react';
import { MobileSidebarToggle } from './MobileSidebarToggle';
import { RightSidebar } from './RightSidebar';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    showRightSidebar?: boolean;
}

/**
 * 优化的主布局组件 - 采用大厂最佳实践
 * 
 * 优化策略：
 * 1. 将静态内容提取到服务端组件
 * 2. 只在需要交互的地方使用客户端组件
 * 3. 使用 Suspense 边界优化加载体验
 * 4. 减少水合不匹配的风险
 */
export default function MainLayoutOptimized({
    children,
    showSidebar = true,
    showRightSidebar = true
}: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-screen-xl mx-auto flex">
                {/* 移动端侧边栏切换按钮 - 客户端组件 */}
                {showSidebar && (
                    <Suspense fallback={null}>
                        <MobileSidebarToggle />
                    </Suspense>
                )}

                {/* 左侧导航栏 - 混合组件（静态结构 + 动态交互） */}
                {showSidebar && (
                    <Suspense fallback={
                        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
                            <div className="sticky top-0 p-6 space-y-6">
                                <div className="animate-pulse space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }>
                        <Sidebar />
                    </Suspense>
                )}

                {/* 主内容区域 - 服务端渲染 */}
                <main className={`flex-1 bg-white min-h-screen mobile-padding pt-4 lg:pt-0 ${showSidebar ? 'lg:ml-0' : ''
                    } ${showRightSidebar ? 'lg:mr-0' : ''}`}>
                    {children}
                </main>

                {/* 右侧边栏 - 混合组件 */}
                {showRightSidebar && (
                    <Suspense fallback={
                        <div className="hidden xl:block w-80 bg-white border-l border-gray-200 min-h-screen">
                            <div className="sticky top-0 p-6 space-y-6">
                                <div className="animate-pulse space-y-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }>
                        <RightSidebar />
                    </Suspense>
                )}
            </div>
        </div>
    );
}
