// 通用化的页面状态管理hook，兼容不同框架
// 移除Next.js特定依赖
import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== 类型定义 ====================

export interface ScrollPosition {
    x: number;
    y: number;
}

export interface PageStateOptions {
    enableScrollRestoration?: boolean;
    enableFormPersistence?: boolean;
    enableRouteCache?: boolean;
    storageKey?: string;
    debounceMs?: number;
    maxCacheSize?: number;
}

export interface PageState {
    scrollPosition: ScrollPosition;
    formData: Record<string, any>;
    customData: Record<string, any>;
    timestamp: number;
}

export interface UsePageStateReturn {
    // 滚动位置管理
    scrollPosition: ScrollPosition;
    saveScrollPosition: () => void;
    restoreScrollPosition: () => void;

    // 表单数据持久化
    saveFormData: (formId: string, data: any) => void;
    getFormData: (formId: string) => any;
    clearFormData: (formId: string) => void;

    // 自定义数据持久化
    saveCustomData: (key: string, data: any) => void;
    getCustomData: (key: string) => any;
    clearCustomData: (key: string) => void;

    // 页面状态管理
    savePageState: () => void;
    restorePageState: () => void;
    clearPageState: () => void;

    // 实用工具
    isRestoring: boolean;
    hasStoredState: boolean;
}

// ==================== 默认配置 ====================

const defaultOptions: Required<PageStateOptions> = {
    enableScrollRestoration: true,
    enableFormPersistence: true,
    enableRouteCache: true,
    storageKey: 'pageState',
    debounceMs: 100,
    maxCacheSize: 50,
};

// ==================== 工具函数 ====================

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// 获取当前路由键
const getRouteKey = (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.pathname + window.location.search;
};

// 安全的存储操作
const safeStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            console.warn(`Failed to get item from sessionStorage: ${key}`, error);
            return null;
        }
    },

    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Failed to set item in sessionStorage: ${key}`, error);
        }
    },

    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.warn(`Failed to remove item from sessionStorage: ${key}`, error);
        }
    },
};

// ==================== Hook实现 ====================

export const usePageState = (options: PageStateOptions = {}): UsePageStateReturn => {
    const config = { ...defaultOptions, ...options };
    // 移除router依赖，使用原生API

    // 状态管理
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({ x: 0, y: 0 });
    const [isRestoring, setIsRestoring] = useState(false);
    const [hasStoredState, setHasStoredState] = useState(false);

    // 引用管理
    const formDataRef = useRef<Record<string, any>>({});
    const customDataRef = useRef<Record<string, any>>({});
    const routeKeyRef = useRef<string>('');
    const isInitializedRef = useRef(false);

    // ==================== 存储管理 ====================

    const getStorageKey = useCallback((routeKey?: string): string => {
        const key = routeKey || routeKeyRef.current;
        return `${config.storageKey}_${key}`;
    }, [config.storageKey]);

    const loadPageState = useCallback((routeKey?: string): PageState | null => {
        const storageKey = getStorageKey(routeKey);
        const storedData = safeStorage.getItem(storageKey);

        if (!storedData) return null;

        try {
            return JSON.parse(storedData) as PageState;
        } catch (error) {
            console.warn('Failed to parse stored page state:', error);
            safeStorage.removeItem(storageKey);
            return null;
        }
    }, [getStorageKey]);

    const savePageStateToStorage = useCallback((state: PageState, routeKey?: string): void => {
        const storageKey = getStorageKey(routeKey);

        try {
            safeStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save page state to storage:', error);
        }
    }, [getStorageKey]);

    // ==================== 滚动位置管理 ====================

    const getCurrentScrollPosition = useCallback((): ScrollPosition => {
        if (typeof window === 'undefined') return { x: 0, y: 0 };

        return {
            x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
            y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
        };
    }, []);

    const saveScrollPosition = useCallback(() => {
        if (!config.enableScrollRestoration) return;

        const position = getCurrentScrollPosition();
        setScrollPosition(position);
    }, [config.enableScrollRestoration, getCurrentScrollPosition]);

    const restoreScrollPosition = useCallback(() => {
        if (!config.enableScrollRestoration || typeof window === 'undefined') return;

        setIsRestoring(true);

        // 使用requestAnimationFrame确保DOM已渲染
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollTo(scrollPosition.x, scrollPosition.y);
                setIsRestoring(false);
            });
        });
    }, [config.enableScrollRestoration, scrollPosition]);

    // 防抖的滚动位置保存
    const debouncedSaveScrollPosition = useCallback(
        debounce(saveScrollPosition, config.debounceMs),
        [saveScrollPosition, config.debounceMs]
    );

    // ==================== 表单数据管理 ====================

    const saveFormData = useCallback((formId: string, data: any) => {
        if (!config.enableFormPersistence) return;

        formDataRef.current[formId] = data;
    }, [config.enableFormPersistence]);

    const getFormData = useCallback((formId: string): any => {
        if (!config.enableFormPersistence) return undefined;

        return formDataRef.current[formId];
    }, [config.enableFormPersistence]);

    const clearFormData = useCallback((formId: string) => {
        if (!config.enableFormPersistence) return;

        delete formDataRef.current[formId];
    }, [config.enableFormPersistence]);

    // ==================== 自定义数据管理 ====================

    const saveCustomData = useCallback((key: string, data: any) => {
        customDataRef.current[key] = data;
    }, []);

    const getCustomData = useCallback((key: string): any => {
        return customDataRef.current[key];
    }, []);

    const clearCustomData = useCallback((key: string) => {
        delete customDataRef.current[key];
    }, []);

    // ==================== 页面状态完整管理 ====================

    const savePageState = useCallback(() => {
        if (!config.enableRouteCache) return;

        saveScrollPosition();

        const state: PageState = {
            scrollPosition: getCurrentScrollPosition(),
            formData: formDataRef.current,
            customData: customDataRef.current,
            timestamp: Date.now(),
        };

        savePageStateToStorage(state);
    }, [config.enableRouteCache, saveScrollPosition, getCurrentScrollPosition, savePageStateToStorage]);

    const restorePageState = useCallback(() => {
        if (!config.enableRouteCache) return;

        const state = loadPageState();
        if (!state) return;

        setHasStoredState(true);

        // 恢复滚动位置
        if (config.enableScrollRestoration) {
            setScrollPosition(state.scrollPosition);
        }

        // 恢复表单数据
        if (config.enableFormPersistence && state.formData) {
            formDataRef.current = state.formData;
        }

        // 恢复自定义数据
        if (state.customData) {
            customDataRef.current = state.customData;
        }
    }, [config.enableRouteCache, config.enableScrollRestoration, config.enableFormPersistence, loadPageState]);

    const clearPageState = useCallback(() => {
        const storageKey = getStorageKey();
        safeStorage.removeItem(storageKey);

        setScrollPosition({ x: 0, y: 0 });
        formDataRef.current = {};
        customDataRef.current = {};
        setHasStoredState(false);
    }, [getStorageKey]);

    // ==================== 生命周期管理 ====================

    // 初始化
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        routeKeyRef.current = getRouteKey();
        restorePageState();

        // 检查是否有存储的状态
        const storedState = loadPageState();
        setHasStoredState(!!storedState);
    }, [restorePageState, loadPageState]);

    // 滚动监听
    useEffect(() => {
        if (!config.enableScrollRestoration || typeof window === 'undefined') return;

        const handleScroll = () => {
            debouncedSaveScrollPosition();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [config.enableScrollRestoration, debouncedSaveScrollPosition]);

    // 页面卸载时保存状态
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleBeforeUnload = () => {
            savePageState();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                savePageState();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [savePageState]);

    // 路由变化时保存当前状态
    useEffect(() => {
        const currentRouteKey = getRouteKey();

        if (routeKeyRef.current && routeKeyRef.current !== currentRouteKey) {
            // 保存旧路由的状态
            savePageState();

            // 更新路由键
            routeKeyRef.current = currentRouteKey;

            // 恢复新路由的状态
            restorePageState();
        }
    }, [savePageState, restorePageState]);

    // ==================== 返回值 ====================

    return {
        // 滚动位置管理
        scrollPosition,
        saveScrollPosition,
        restoreScrollPosition,

        // 表单数据持久化
        saveFormData,
        getFormData,
        clearFormData,

        // 自定义数据持久化
        saveCustomData,
        getCustomData,
        clearCustomData,

        // 页面状态管理
        savePageState,
        restorePageState,
        clearPageState,

        // 实用工具
        isRestoring,
        hasStoredState,
    };
};

// ==================== 工具函数导出 ====================

export { debounce, safeStorage };

// ==================== 类型导出 ====================

export type { PageState, PageStateOptions, ScrollPosition };

