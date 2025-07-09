import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 异步操作选项配置
 */
export interface UseAsyncOptions {
    /** 是否立即执行异步函数 */
    immediate?: boolean;
    /** 成功回调 */
    onSuccess?: (data: any) => void;
    /** 错误回调 */
    onError?: (error: Error) => void;
    /** 重试次数，默认为0 */
    retryCount?: number;
    /** 重试延迟时间（毫秒），默认为1000 */
    retryDelay?: number;
}

/**
 * useAsync Hook 返回值
 */
export interface UseAsyncReturn<T> {
    /** 异步操作返回的数据 */
    data: T | null;
    /** 是否正在加载 */
    loading: boolean;
    /** 错误信息 */
    error: string | null;
    /** 执行异步函数 */
    execute: (...args: any[]) => Promise<void>;
    /** 重置状态 */
    reset: () => void;
    /** 取消当前请求 */
    cancel: () => void;
    /** 重试 */
    retry: () => void;
}

/**
 * 异步操作管理Hook
 * 提供loading、error、data状态管理，支持取消操作和重试机制
 * 
 * @param asyncFunction 异步函数
 * @param options 配置选项
 * @returns Hook返回值对象
 * 
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, loading, error, execute } = useAsync(
 *     async (id: string) => {
 *       const response = await fetch(`/api/users/${id}`);
 *       if (!response.ok) throw new Error('Failed to fetch user');
 *       return response.json();
 *     },
 *     {
 *       immediate: true,
 *       retryCount: 3,
 *       onError: (error) => console.error('Load user failed:', error)
 *     }
 *   );
 * 
 *   useEffect(() => {
 *     execute(userId);
 *   }, [userId, execute]);
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!user) return <div>No user found</div>;
 * 
 *   return <div>Hello, {user.name}!</div>;
 * }
 * ```
 */
export function useAsync<T = any>(
    asyncFunction: (...args: any[]) => Promise<T>,
    options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
    // 参数校验
    if (typeof asyncFunction !== 'function') {
        throw new Error('useAsync: asyncFunction must be a function');
    }

    const {
        immediate = false,
        onSuccess,
        onError,
        retryCount = 0,
        retryDelay = 1000,
    } = options;

    // 状态管理
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 引用管理
    const cancelRef = useRef<() => void>();
    const lastArgsRef = useRef<any[]>();
    const retryCountRef = useRef(0);
    const isMountedRef = useRef(true);

    // 组件卸载时清理
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            cancelRef.current?.();
        };
    }, []);

    // 延迟执行函数
    const delay = useCallback((ms: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, ms);
            const originalCancel = cancelRef.current;
            cancelRef.current = () => {
                clearTimeout(timeoutId);
                originalCancel?.();
                reject(new Error('Operation cancelled'));
            };
        });
    }, []);

    // 执行异步函数
    const execute = useCallback(
        async (...args: any[]) => {
            // 只有在组件已挂载时才执行
            if (!isMountedRef.current) return;

            // 保存参数用于重试
            lastArgsRef.current = args;
            retryCountRef.current = 0;

            setLoading(true);
            setError(null);

            let isCancelled = false;
            cancelRef.current = () => {
                isCancelled = true;
            };

            // 执行重试逻辑
            const executeWithRetry = async () => {
                let currentAttempt = 0;
                const maxAttempts = retryCount + 1; // 初始尝试 + 重试次数

                while (currentAttempt < maxAttempts) {
                    try {
                        if (isCancelled || !isMountedRef.current) return;

                        const result = await asyncFunction(...args);

                        if (isCancelled || !isMountedRef.current) return;

                        setData(result);
                        setLoading(false);
                        onSuccess?.(result);
                        return; // 成功，退出循环
                    } catch (err) {
                        if (isCancelled || !isMountedRef.current) return;

                        const errorInstance = err instanceof Error ? err : new Error('Unknown error');
                        currentAttempt++;

                        // 如果还有重试机会
                        if (currentAttempt < maxAttempts) {
                            try {
                                if (isCancelled || !isMountedRef.current) return;
                                await delay(retryDelay);
                                if (isCancelled || !isMountedRef.current) return;
                            } catch (delayError) {
                                // 如果延迟被取消，直接返回
                                return;
                            }
                        } else {
                            // 所有重试都失败了
                            setError(errorInstance.message);
                            setLoading(false);
                            onError?.(errorInstance);
                            return;
                        }
                    }
                }
            };

            await executeWithRetry();
        },
        [asyncFunction, onSuccess, onError, retryCount, retryDelay, delay]
    );

    // 重置状态
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        cancelRef.current?.();
        retryCountRef.current = 0;
    }, []);

    // 取消操作
    const cancel = useCallback(() => {
        cancelRef.current?.();
        setLoading(false);
    }, []);

    // 重试操作
    const retry = useCallback(() => {
        if (lastArgsRef.current) {
            execute(...lastArgsRef.current);
        }
    }, [execute]);

    // 自动执行
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return {
        data,
        loading,
        error,
        execute,
        reset,
        cancel,
        retry,
    };
}
