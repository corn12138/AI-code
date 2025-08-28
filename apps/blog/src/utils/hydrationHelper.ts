/**
 * 简化的水合辅助工具 - 大厂最佳实践
 * 
 * 大厂推荐的水合策略：
 * 1. 最小化自定义水合逻辑
 * 2. 使用 Next.js 内置的 Suspense 和 dynamic
 * 3. 避免复杂的客户端检测
 * 4. 优先使用服务端组件
 */

import { useEffect, useState } from 'react';

/**
 * 简化的客户端检测 Hook
 * 只在真正需要时使用，优先考虑其他方案
 */
export function useIsClient(): boolean {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

/**
 * 检测是否在客户端环境
 * 静态检测，性能更好
 */
export const isClientSide = typeof window !== 'undefined';

/**
 * 延迟渲染组件 Hook
 * 用于避免水合不匹配，但应该谨慎使用
 * 
 * @deprecated 优先使用 Suspense 和 dynamic import
 */
export function useDelayedRender(delay: number = 0): boolean {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return shouldRender;
}

/**
 * NoSSR 组件 - 避免服务端渲染
 * 
 * @deprecated 优先使用 Next.js 的 dynamic import 与 ssr: false
 */
export function NoSSR({ children }: { children: React.ReactNode }) {
    const isClient = useIsClient();

    if (!isClient) {
        return null;
    }

    return <>{ children } </>;
}