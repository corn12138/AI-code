import { useCallback, useRef } from 'react';
import { useAsync } from '../useAsync';

export interface UseApiOptions<T> {
    baseURL?: string;
    headers?: Record<string, string>;
    transform?: (data: any) => T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    request: (url: string, options?: RequestInit) => Promise<void>;
    get: (url: string, options?: RequestInit) => Promise<void>;
    post: (url: string, data?: any, options?: RequestInit) => Promise<void>;
    put: (url: string, data?: any, options?: RequestInit) => Promise<void>;
    delete: (url: string, options?: RequestInit) => Promise<void>;
    reset: () => void;
}

export function useApi<T = any>(options: UseApiOptions<T> = {}): UseApiReturn<T> {
    const {
        baseURL = '',
        headers = {},
        transform = (data) => data,
        onSuccess,
        onError,
    } = options;

    const abortControllerRef = useRef<AbortController | null>(null);

    const makeRequest = useCallback(
        async (url: string, requestOptions: RequestInit = {}): Promise<T> => {
            // 取消之前的请求
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // 创建新的AbortController
            const controller = new AbortController();
            abortControllerRef.current = controller;

            const fullUrl = baseURL ? `${baseURL}${url}` : url;

            const config: RequestInit = {
                ...requestOptions,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                    ...requestOptions.headers,
                },
            };

            try {
                const response = await fetch(fullUrl, config);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return transform(data);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error('Request was cancelled');
                }
                throw error;
            }
        },
        [baseURL, headers, transform]
    );

    const { data, loading, error, execute, reset } = useAsync<T>(makeRequest, {
        onSuccess,
        onError,
    });

    const request = useCallback(
        (url: string, options?: RequestInit) => execute(url, options),
        [execute]
    );

    const get = useCallback(
        (url: string, options?: RequestInit) =>
            execute(url, { ...options, method: 'GET' }),
        [execute]
    );

    const post = useCallback(
        (url: string, data?: any, options?: RequestInit) =>
            execute(url, {
                ...options,
                method: 'POST',
                body: data ? JSON.stringify(data) : undefined,
            }),
        [execute]
    );

    const put = useCallback(
        (url: string, data?: any, options?: RequestInit) =>
            execute(url, {
                ...options,
                method: 'PUT',
                body: data ? JSON.stringify(data) : undefined,
            }),
        [execute]
    );

    const deleteRequest = useCallback(
        (url: string, options?: RequestInit) =>
            execute(url, { ...options, method: 'DELETE' }),
        [execute]
    );

    // 清理函数
    const resetWithCleanup = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        reset();
    }, [reset]);

    return {
        data,
        loading,
        error,
        request,
        get,
        post,
        put,
        delete: deleteRequest,
        reset: resetWithCleanup,
    };
} 