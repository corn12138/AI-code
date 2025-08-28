import { ReactNode, Suspense } from 'react';

interface OptimizedSuspenseWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
    variant?: 'article' | 'sidebar' | 'editor' | 'chat' | 'default';
}

/**
 * 优化的 Suspense 包装器 - 替代自定义 mounted 状态
 * 
 * 大厂最佳实践：
 * 1. 使用 Next.js 内置 Suspense 替代自定义水合逻辑
 * 2. 提供语义化的 loading 状态
 * 3. 根据内容类型提供不同的骨架屏
 * 4. 提升用户体验
 */

const loadingVariants = {
    article: (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-14"></div>
            </div>
        </div>
    ),

    sidebar: (
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <div className="sticky top-0 p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ),

    editor: (
        <div className="min-h-96 bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                            ))}
                        </div>
                        <div className="bg-gray-100 rounded p-4">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ),

    chat: (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4 max-h-96">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'
                                }`}>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex space-x-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 w-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    ),

    default: (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    )
};

export function OptimizedSuspenseWrapper({
    children,
    fallback,
    variant = 'default'
}: OptimizedSuspenseWrapperProps) {
    const defaultFallback = loadingVariants[variant];

    return (
        <Suspense fallback={fallback || defaultFallback}>
            {children}
        </Suspense>
    );
}

/**
 * 使用示例：
 * 
 * // 替代自定义的 mounted 状态检查
 * <OptimizedSuspenseWrapper variant="article">
 *   <ArticleList />
 * </OptimizedSuspenseWrapper>
 * 
 * // 替代复杂的水合逻辑
 * <OptimizedSuspenseWrapper variant="sidebar">
 *   <InteractiveSidebar />
 * </OptimizedSuspenseWrapper>
 */
