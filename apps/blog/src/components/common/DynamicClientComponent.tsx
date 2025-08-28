import dynamic from 'next/dynamic';
import { Suspense } from 'react';

/**
 * 动态导入组件示例 - 大厂最佳实践
 * 
 * 优化策略：
 * 1. 使用 Next.js dynamic import 替代自定义水合
 * 2. 合理设置 SSR 选项
 * 3. 提供有意义的 loading 状态
 * 4. 避免水合不匹配
 */

// 动态导入重型客户端组件 - 禁用 SSR
const HeavyInteractiveComponent = dynamic(
    () => import('../ai/AIAssistant'),
    {
        ssr: false, // 禁用服务端渲染，避免水合问题
        loading: () => (
            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        )
    }
);

// 动态导入轻型组件 - 启用 SSR
const LightInteractiveComponent = dynamic(
    () => import('../chat/MessageInput'),
    {
        ssr: true, // 启用服务端渲染，提升首屏性能
        loading: () => (
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        )
    }
);

// 条件性动态导入
const ConditionalComponent = dynamic(
    () => import('../editor/MarkdownEditor'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">加载编辑器中...</p>
                </div>
            </div>
        )
    }
);

interface DynamicClientComponentProps {
    variant: 'heavy' | 'light' | 'conditional';
    condition?: boolean;
}

/**
 * 示例组件：如何正确使用动态导入
 */
export function DynamicClientComponent({
    variant,
    condition = true
}: DynamicClientComponentProps) {
    switch (variant) {
        case 'heavy':
            return (
                <Suspense fallback={
                    <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                }>
                    <HeavyInteractiveComponent />
                </Suspense>
            );

        case 'light':
            return (
                <Suspense fallback={<div className="h-12 bg-gray-100 rounded animate-pulse"></div>}>
                    <LightInteractiveComponent />
                </Suspense>
            );

        case 'conditional':
            if (!condition) {
                return (
                    <div className="text-center py-8 text-gray-500">
                        <p>功能暂不可用</p>
                    </div>
                );
            }
            return (
                <Suspense fallback={
                    <div className="min-h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                }>
                    <ConditionalComponent />
                </Suspense>
            );

        default:
            return null;
    }
}

/**
 * 使用示例：
 * 
 * // 在服务端组件中使用
 * export default function SomePage() {
 *   return (
 *     <div>
 *       <h1>静态内容</h1>
 *       <DynamicClientComponent variant="heavy" />
 *     </div>
 *   );
 * }
 */
