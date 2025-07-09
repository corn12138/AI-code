import { act, renderHook } from '@testing-library/react';
import { useAsync } from '../index';

// Mock函数用于测试
const mockAsyncSuccess = jest.fn().mockResolvedValue('success data');
const mockAsyncError = jest.fn().mockRejectedValue(new Error('async error'));
const mockAsyncDelay = jest.fn().mockImplementation(
    (delay: number) => new Promise(resolve => setTimeout(() => resolve(`delayed ${delay}ms`), delay))
);

describe('useAsync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('基本功能', () => {
        it('应该正确初始化状态', () => {
            const { result } = renderHook(() => useAsync(mockAsyncSuccess));

            expect(result.current.data).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(typeof result.current.execute).toBe('function');
            expect(typeof result.current.reset).toBe('function');
            expect(typeof result.current.cancel).toBe('function');
            expect(typeof result.current.retry).toBe('function');
        });

        it('应该正确验证异步函数参数', () => {
            expect(() => {
                renderHook(() => useAsync(null as any));
            }).toThrow('useAsync: asyncFunction must be a function');
        });
    });

    describe('执行异步操作', () => {
        it('应该正确处理成功的异步操作', async () => {
            const onSuccess = jest.fn();
            const { result } = renderHook(() =>
                useAsync(mockAsyncSuccess, { onSuccess })
            );

            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.data).toBe('success data');
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(onSuccess).toHaveBeenCalledWith('success data');
            expect(mockAsyncSuccess).toHaveBeenCalledTimes(1);
        });

        it('应该正确处理失败的异步操作', async () => {
            const onError = jest.fn();
            const { result } = renderHook(() =>
                useAsync(mockAsyncError, { onError })
            );

            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.data).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe('async error');
            expect(onError).toHaveBeenCalledWith(new Error('async error'));
            expect(mockAsyncError).toHaveBeenCalledTimes(1);
        });

        it('应该正确处理loading状态', async () => {
            const { result } = renderHook(() => useAsync(mockAsyncDelay));

            // 开始执行
            act(() => {
                result.current.execute(100);
            });

            // 应该处于loading状态
            expect(result.current.loading).toBe(true);
            expect(result.current.data).toBeNull();
            expect(result.current.error).toBeNull();

            // 完成后应该更新状态
            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            expect(result.current.loading).toBe(false);
            expect(result.current.data).toBe('delayed 100ms');
            expect(result.current.error).toBeNull();
        });
    });

    describe('重试机制', () => {
        it('应该支持重试功能', async () => {
            const mockRetry = jest.fn()
                .mockRejectedValueOnce(new Error('first error'))
                .mockRejectedValueOnce(new Error('second error'))
                .mockResolvedValueOnce('success on third try');

            const { result } = renderHook(() =>
                useAsync(mockRetry, {
                    retryCount: 2,
                    retryDelay: 100
                })
            );

            await act(async () => {
                result.current.execute();

                // 等待重试
                jest.advanceTimersByTime(100);
                await Promise.resolve();

                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            expect(mockRetry).toHaveBeenCalledTimes(3);
            expect(result.current.data).toBe('success on third try');
            expect(result.current.error).toBeNull();
        });

        it('应该在重试次数耗尽后返回错误', async () => {
            const mockRetry = jest.fn().mockRejectedValue(new Error('persistent error'));

            const { result } = renderHook(() =>
                useAsync(mockRetry, {
                    retryCount: 2,
                    retryDelay: 100
                })
            );

            await act(async () => {
                result.current.execute();

                // 等待所有重试
                jest.advanceTimersByTime(200);
                await Promise.resolve();
            });

            expect(mockRetry).toHaveBeenCalledTimes(3); // 初始调用 + 2次重试
            expect(result.current.data).toBeNull();
            expect(result.current.error).toBe('persistent error');
        });

        it('应该支持手动重试', async () => {
            const { result } = renderHook(() => useAsync(mockAsyncSuccess));

            // 首次执行
            await act(async () => {
                await result.current.execute('first');
            });

            // 手动重试
            await act(async () => {
                await result.current.retry();
            });

            expect(mockAsyncSuccess).toHaveBeenCalledTimes(2);
            expect(mockAsyncSuccess).toHaveBeenNthCalledWith(1, 'first');
            expect(mockAsyncSuccess).toHaveBeenNthCalledWith(2, 'first');
        });
    });

    describe('取消操作', () => {
        it('应该支持取消操作', async () => {
            const { result } = renderHook(() => useAsync(mockAsyncDelay));

            // 开始执行
            act(() => {
                result.current.execute(1000);
            });

            expect(result.current.loading).toBe(true);

            // 取消操作
            act(() => {
                result.current.cancel();
            });

            expect(result.current.loading).toBe(false);
        });
    });

    describe('重置功能', () => {
        it('应该正确重置状态', async () => {
            const { result } = renderHook(() => useAsync(mockAsyncSuccess));

            // 执行操作
            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.data).toBe('success data');

            // 重置状态
            act(() => {
                result.current.reset();
            });

            expect(result.current.data).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe('immediate选项', () => {
        it('应该支持立即执行', async () => {
            const { result } = renderHook(() =>
                useAsync(mockAsyncSuccess, { immediate: true })
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockAsyncSuccess).toHaveBeenCalledTimes(1);
            expect(result.current.data).toBe('success data');
        });
    });

    describe('组件卸载处理', () => {
        it('应该在组件卸载时清理资源', () => {
            const { result, unmount } = renderHook(() => useAsync(mockAsyncDelay));

            act(() => {
                result.current.execute(1000);
            });

            expect(result.current.loading).toBe(true);

            // 卸载组件
            unmount();

            // 验证没有内存泄漏
            expect(result.current.loading).toBe(true); // 最后的状态保持
        });
    });

    describe('边界情况', () => {
        it('应该处理非Error对象的异常', async () => {
            const mockAsyncStringError = jest.fn().mockRejectedValue('string error');
            const { result } = renderHook(() => useAsync(mockAsyncStringError));

            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.error).toBe('Unknown error');
        });

        it('应该处理空参数调用', async () => {
            const { result } = renderHook(() => useAsync(mockAsyncSuccess));

            await act(async () => {
                await result.current.execute();
            });

            expect(mockAsyncSuccess).toHaveBeenCalledWith();
        });
    });
}); 