import { useEffect, useState } from 'react';

/**
 * 客户端渲染检测Hook
 * 用于解决SSR/SSG环境下的hydration问题
 * @returns 是否在客户端
 */
export function useClientSide(): boolean {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

/**
 * 客户端安全执行Hook
 * 只有在客户端环境下才执行回调函数
 * @param callback 回调函数
 * @param deps 依赖数组
 */
export function useClientSideEffect(
    callback: () => void | (() => void),
    deps?: React.DependencyList
): void {
    const isClient = useClientSide();

    useEffect(() => {
        if (isClient) {
            return callback();
        }
    }, [isClient, ...(deps || [])]);
}

/**
 * 客户端状态Hook
 * 只有在客户端才会更新状态
 * @param initialValue 初始值
 * @returns [state, setState]
 */
export function useClientState<T>(
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const isClient = useClientSide();
    const [state, setState] = useState<T>(initialValue);

    return [isClient ? state : initialValue, setState];
} 