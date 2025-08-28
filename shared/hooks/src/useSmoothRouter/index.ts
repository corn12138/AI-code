'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== 类型定义 ====================

export interface NavigationState {
    isNavigating: boolean;
    previousPath: string | null;
    currentPath: string;
    targetPath: string | null;
    navigationId: string | null;
    startTime: number | null;
}

export interface SmoothRouterOptions {
    enablePreloading?: boolean;
    enableOptimisticNavigation?: boolean;
    enableTransitions?: boolean;
    transitionDuration?: number;
    preloadDelay?: number;
    navigationTimeout?: number;
    onNavigationStart?: (path: string) => void;
    onNavigationComplete?: (path: string, duration: number) => void;
    onNavigationError?: (error: Error, path: string) => void;
}

export interface UseSmoothRouterReturn {
    // 导航状态
    isNavigating: boolean;
    previousPath: string | null;
    currentPath: string;
    targetPath: string | null;
    navigationProgress: number;

    // 导航方法
    push: (path: string, options?: { replace?: boolean; optimistic?: boolean }) => Promise<boolean>;
    replace: (path: string, options?: { optimistic?: boolean }) => Promise<boolean>;
    back: () => void;
    forward: () => void;

    // 预加载方法
    preload: (path: string) => void;
    prefetch: (path: string) => void;

    // 状态管理
    cancelNavigation: () => void;
    resetNavigation: () => void;

    // 工具方法
    isCurrentPath: (path: string) => boolean;
    isNavigatingTo: (path: string) => boolean;
}

// ==================== 默认配置 ====================

const defaultOptions: Required<SmoothRouterOptions> = {
    enablePreloading: true,
    enableOptimisticNavigation: true,
    enableTransitions: true,
    transitionDuration: 300,
    preloadDelay: 100,
    navigationTimeout: 5000,
    onNavigationStart: () => { },
    onNavigationComplete: () => { },
    onNavigationError: () => { },
};

// ==================== 工具函数 ====================

// 生成导航ID
const generateNavigationId = (): string => {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 计算路径匹配度
const calculatePathSimilarity = (path1: string, path2: string): number => {
    const segments1 = path1.split('/').filter(Boolean);
    const segments2 = path2.split('/').filter(Boolean);

    const maxLength = Math.max(segments1.length, segments2.length);
    if (maxLength === 0) return 1;

    let matches = 0;
    for (let i = 0; i < Math.min(segments1.length, segments2.length); i++) {
        if (segments1[i] === segments2[i]) {
            matches++;
        } else {
            break;
        }
    }

    return matches / maxLength;
};

// 预加载资源
const preloadRoute = (path: string): void => {
    if (typeof window === 'undefined') return;

    // 预加载页面
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);

    // 清理
    setTimeout(() => {
        if (link.parentNode) {
            link.parentNode.removeChild(link);
        }
    }, 30000);
};

// ==================== Hook实现 ====================

export const useSmoothRouter = (options: SmoothRouterOptions = {}): UseSmoothRouterReturn => {
    const config = { ...defaultOptions, ...options };
    const router = useRouter();
    const pathname = usePathname();

    // 状态管理
    const [navigationState, setNavigationState] = useState<NavigationState>({
        isNavigating: false,
        previousPath: null,
        currentPath: pathname,
        targetPath: null,
        navigationId: null,
        startTime: null,
    });

    const [navigationProgress, setNavigationProgress] = useState(0);

    // 引用管理
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const preloadTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const currentNavigationRef = useRef<string | null>(null);

    // ==================== 导航进度模拟 ====================

    const startProgressSimulation = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        setNavigationProgress(0);
        let progress = 0;

        progressIntervalRef.current = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 90) {
                progress = 90;
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            }
            setNavigationProgress(progress);
        }, 100);
    }, []);

    const completeProgress = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        setNavigationProgress(100);

        setTimeout(() => {
            setNavigationProgress(0);
        }, 500);
    }, []);

    // ==================== 导航状态管理 ====================

    const startNavigation = useCallback((targetPath: string, navigationId: string) => {
        const startTime = Date.now();

        setNavigationState(prev => ({
            ...prev,
            isNavigating: true,
            previousPath: prev.currentPath,
            targetPath,
            navigationId,
            startTime,
        }));

        currentNavigationRef.current = navigationId;

        if (config.enableTransitions) {
            startProgressSimulation();
        }

        config.onNavigationStart(targetPath);

        // 设置导航超时
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }

        navigationTimeoutRef.current = setTimeout(() => {
            if (currentNavigationRef.current === navigationId) {
                config.onNavigationError(new Error('Navigation timeout'), targetPath);
                resetNavigation();
            }
        }, config.navigationTimeout);
    }, [config, startProgressSimulation]);

    const completeNavigation = useCallback((finalPath: string) => {
        const { startTime, navigationId } = navigationState;

        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }

        if (config.enableTransitions) {
            completeProgress();
        }

        const duration = startTime ? Date.now() - startTime : 0;
        config.onNavigationComplete(finalPath, duration);

        setNavigationState(prev => ({
            ...prev,
            isNavigating: false,
            previousPath: prev.currentPath,
            currentPath: finalPath,
            targetPath: null,
            navigationId: null,
            startTime: null,
        }));

        currentNavigationRef.current = null;
    }, [navigationState, config, completeProgress]);

    const resetNavigation = useCallback(() => {
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        setNavigationState(prev => ({
            ...prev,
            isNavigating: false,
            targetPath: null,
            navigationId: null,
            startTime: null,
        }));

        setNavigationProgress(0);
        currentNavigationRef.current = null;
    }, []);

    // ==================== 导航方法 ====================

    const push = useCallback(async (
        path: string,
        options: { replace?: boolean; optimistic?: boolean } = {}
    ): Promise<boolean> => {
        const { replace = false, optimistic = config.enableOptimisticNavigation } = options;

        if (navigationState.isNavigating && !optimistic) {
            return false;
        }

        const navigationId = generateNavigationId();

        try {
            if (optimistic || config.enableOptimisticNavigation) {
                startNavigation(path, navigationId);
            }

            if (replace) {
                router.replace(path);
            } else {
                router.push(path);
            }

            return true;
        } catch (error) {
            config.onNavigationError(error as Error, path);
            resetNavigation();
            return false;
        }
    }, [config, navigationState.isNavigating, router, startNavigation, resetNavigation]);

    const replace = useCallback(async (
        path: string,
        options: { optimistic?: boolean } = {}
    ): Promise<boolean> => {
        return push(path, { ...options, replace: true });
    }, [push]);

    const back = useCallback(() => {
        if (navigationState.isNavigating) return;

        const navigationId = generateNavigationId();
        startNavigation('back', navigationId);
        router.back();
    }, [navigationState.isNavigating, router, startNavigation]);

    const forward = useCallback(() => {
        if (navigationState.isNavigating) return;

        const navigationId = generateNavigationId();
        startNavigation('forward', navigationId);
        router.forward();
    }, [navigationState.isNavigating, router, startNavigation]);

    const cancelNavigation = useCallback(() => {
        resetNavigation();
    }, [resetNavigation]);

    // ==================== 预加载方法 ====================

    const preload = useCallback((path: string) => {
        if (!config.enablePreloading || typeof window === 'undefined') return;

        // 清除之前的预加载定时器
        const existingTimeout = preloadTimeoutRef.current.get(path);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // 设置新的预加载定时器
        const timeout = setTimeout(() => {
            preloadRoute(path);
            preloadTimeoutRef.current.delete(path);
        }, config.preloadDelay);

        preloadTimeoutRef.current.set(path, timeout);
    }, [config.enablePreloading, config.preloadDelay]);

    const prefetch = useCallback((path: string) => {
        if (typeof window === 'undefined') return;

        router.prefetch(path);
    }, [router]);

    // ==================== 工具方法 ====================

    const isCurrentPath = useCallback((path: string): boolean => {
        return navigationState.currentPath === path;
    }, [navigationState.currentPath]);

    const isNavigatingTo = useCallback((path: string): boolean => {
        return navigationState.isNavigating && navigationState.targetPath === path;
    }, [navigationState.isNavigating, navigationState.targetPath]);

    // ==================== 生命周期管理 ====================

    // 监听路径变化
    useEffect(() => {
        if (pathname !== navigationState.currentPath) {
            completeNavigation(pathname);
        }
    }, [pathname, navigationState.currentPath, completeNavigation]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }

            // 清理所有预加载定时器
            preloadTimeoutRef.current.forEach(timeout => {
                clearTimeout(timeout);
            });
            preloadTimeoutRef.current.clear();
        };
    }, []);

    // ==================== 返回值 ====================

    return {
        // 导航状态
        isNavigating: navigationState.isNavigating,
        previousPath: navigationState.previousPath,
        currentPath: navigationState.currentPath,
        targetPath: navigationState.targetPath,
        navigationProgress,

        // 导航方法
        push,
        replace,
        back,
        forward,

        // 预加载方法
        preload,
        prefetch,

        // 状态管理
        cancelNavigation,
        resetNavigation,

        // 工具方法
        isCurrentPath,
        isNavigatingTo,
    };
};

// ==================== 工具函数导出 ====================

export { calculatePathSimilarity, generateNavigationId, preloadRoute };

// ==================== 类型导出 ====================

export type { NavigationState, SmoothRouterOptions };

