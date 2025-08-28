'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== 类型定义 ====================

export interface AnimationConfig {
    duration?: number;
    easing?: string;
    delay?: number;
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface ToastOptions {
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    dismissible?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface LoadingState {
    isLoading: boolean;
    progress?: number;
    message?: string;
    type?: 'spinner' | 'progress' | 'skeleton' | 'pulse';
}

export interface UIInteractionOptions {
    enableHapticFeedback?: boolean;
    enableSmoothScrolling?: boolean;
    enableReducedMotion?: boolean;
    defaultAnimationDuration?: number;
    prefersReducedMotion?: boolean;
}

export interface UseUIInteractionReturn {
    // 加载状态管理
    loading: LoadingState;
    setLoading: (state: Partial<LoadingState>) => void;
    showLoading: (message?: string, type?: LoadingState['type']) => void;
    hideLoading: () => void;

    // 动画管理
    animate: (element: HTMLElement, keyframes: Keyframe[], options?: AnimationConfig) => Promise<void>;
    fadeIn: (element: HTMLElement, options?: AnimationConfig) => Promise<void>;
    fadeOut: (element: HTMLElement, options?: AnimationConfig) => Promise<void>;
    slideIn: (element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down', options?: AnimationConfig) => Promise<void>;
    slideOut: (element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down', options?: AnimationConfig) => Promise<void>;

    // 交互反馈
    ripple: (element: HTMLElement, event: React.MouseEvent) => void;
    hapticFeedback: (type?: 'light' | 'medium' | 'heavy' | 'selection') => void;

    // 滚动管理
    smoothScrollTo: (target: HTMLElement | string, options?: ScrollIntoViewOptions) => void;
    scrollToTop: (smooth?: boolean) => void;

    // 工具方法
    isReducedMotion: boolean;
    isTouchDevice: boolean;
    isVisible: (element: HTMLElement) => boolean;

    // 实用组件属性
    getLoadingProps: () => { 'aria-busy': boolean; 'aria-live': 'polite' | 'assertive' };
    getSkeletonProps: () => { className: string; 'aria-hidden': boolean };
}

// ==================== 默认配置 ====================

const defaultOptions: Required<UIInteractionOptions> = {
    enableHapticFeedback: true,
    enableSmoothScrolling: true,
    enableReducedMotion: false,
    defaultAnimationDuration: 300,
    prefersReducedMotion: false,
};

// ==================== 工具函数 ====================

// 检测设备能力
const getDeviceCapabilities = () => {
    if (typeof window === 'undefined') {
        return {
            hasVibration: false,
            isTouchDevice: false,
            prefersReducedMotion: false,
        };
    }

    return {
        hasVibration: 'vibrate' in navigator,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
};

// 创建水波纹效果
const createRippleEffect = (element: HTMLElement, event: React.MouseEvent): void => {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    // 添加样式
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-effect 0.6s linear';
    ripple.style.pointerEvents = 'none';

    // 确保父元素有相对定位
    const parentPosition = window.getComputedStyle(element).position;
    if (parentPosition === 'static') {
        element.style.position = 'relative';
    }

    element.appendChild(ripple);

    // 清理
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
};

// 添加全局样式
const addGlobalStyles = (): void => {
    if (typeof document === 'undefined') return;

    if (!document.getElementById('ui-interaction-styles')) {
        const style = document.createElement('style');
        style.id = 'ui-interaction-styles';
        style.textContent = `
            @keyframes ripple-effect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes skeleton-pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.4;
                }
            }
            
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-pulse 1.5s ease-in-out infinite;
            }
            
            .smooth-scroll {
                scroll-behavior: smooth;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .skeleton {
                    animation: none;
                }
                .smooth-scroll {
                    scroll-behavior: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// ==================== Hook实现 ====================

export const useUIInteraction = (options: UIInteractionOptions = {}): UseUIInteractionReturn => {
    const config = { ...defaultOptions, ...options };
    const deviceCapabilities = getDeviceCapabilities();

    // 状态管理
    const [loading, setLoadingState] = useState<LoadingState>({
        isLoading: false,
        progress: undefined,
        message: undefined,
        type: 'spinner',
    });

    // 引用管理
    const animationsRef = useRef<Map<HTMLElement, Animation>>(new Map());
    const observerRef = useRef<IntersectionObserver | null>(null);

    // 响应式媒体查询状态
    const [isReducedMotion, setIsReducedMotion] = useState(
        config.prefersReducedMotion || deviceCapabilities.prefersReducedMotion
    );

    // ==================== 初始化 ====================

    useEffect(() => {
        addGlobalStyles();

        // 监听减少动画偏好设置变化
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const handleChange = (e: MediaQueryListEvent) => {
                setIsReducedMotion(e.matches);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, []);

    // ==================== 加载状态管理 ====================

    const setLoading = useCallback((state: Partial<LoadingState>) => {
        setLoadingState(prev => ({ ...prev, ...state }));
    }, []);

    const showLoading = useCallback((message?: string, type: LoadingState['type'] = 'spinner') => {
        setLoadingState({
            isLoading: true,
            message,
            type,
            progress: undefined,
        });
    }, []);

    const hideLoading = useCallback(() => {
        setLoadingState({
            isLoading: false,
            progress: undefined,
            message: undefined,
            type: 'spinner',
        });
    }, []);

    // ==================== 动画管理 ====================

    const animate = useCallback(async (
        element: HTMLElement,
        keyframes: Keyframe[],
        options: AnimationConfig = {}
    ): Promise<void> => {
        if (isReducedMotion && !config.enableReducedMotion) {
            return Promise.resolve();
        }

        // 取消之前的动画
        const existingAnimation = animationsRef.current.get(element);
        if (existingAnimation) {
            existingAnimation.cancel();
        }

        const animationOptions: KeyframeAnimationOptions = {
            duration: options.duration || config.defaultAnimationDuration,
            easing: options.easing || 'ease-out',
            delay: options.delay || 0,
            direction: options.direction || 'normal',
            fill: options.fillMode || 'forwards',
        };

        return new Promise((resolve, reject) => {
            try {
                const animation = element.animate(keyframes, animationOptions);
                animationsRef.current.set(element, animation);

                animation.onfinish = () => {
                    animationsRef.current.delete(element);
                    resolve();
                };

                animation.oncancel = () => {
                    animationsRef.current.delete(element);
                    resolve();
                };
            } catch (error) {
                reject(error);
            }
        });
    }, [isReducedMotion, config.enableReducedMotion, config.defaultAnimationDuration]);

    const fadeIn = useCallback(async (element: HTMLElement, options: AnimationConfig = {}): Promise<void> => {
        const keyframes: Keyframe[] = [
            { opacity: 0 },
            { opacity: 1 }
        ];
        return animate(element, keyframes, options);
    }, [animate]);

    const fadeOut = useCallback(async (element: HTMLElement, options: AnimationConfig = {}): Promise<void> => {
        const keyframes: Keyframe[] = [
            { opacity: 1 },
            { opacity: 0 }
        ];
        return animate(element, keyframes, options);
    }, [animate]);

    const slideIn = useCallback(async (
        element: HTMLElement,
        direction: 'left' | 'right' | 'up' | 'down' = 'left',
        options: AnimationConfig = {}
    ): Promise<void> => {
        const transforms = {
            left: ['translateX(-100%)', 'translateX(0)'],
            right: ['translateX(100%)', 'translateX(0)'],
            up: ['translateY(-100%)', 'translateY(0)'],
            down: ['translateY(100%)', 'translateY(0)'],
        };

        const keyframes: Keyframe[] = [
            { transform: transforms[direction][0], opacity: 0 },
            { transform: transforms[direction][1], opacity: 1 }
        ];

        return animate(element, keyframes, options);
    }, [animate]);

    const slideOut = useCallback(async (
        element: HTMLElement,
        direction: 'left' | 'right' | 'up' | 'down' = 'left',
        options: AnimationConfig = {}
    ): Promise<void> => {
        const transforms = {
            left: ['translateX(0)', 'translateX(-100%)'],
            right: ['translateX(0)', 'translateX(100%)'],
            up: ['translateY(0)', 'translateY(-100%)'],
            down: ['translateY(0)', 'translateY(100%)'],
        };

        const keyframes: Keyframe[] = [
            { transform: transforms[direction][0], opacity: 1 },
            { transform: transforms[direction][1], opacity: 0 }
        ];

        return animate(element, keyframes, options);
    }, [animate]);

    // ==================== 交互反馈 ====================

    const ripple = useCallback((element: HTMLElement, event: React.MouseEvent) => {
        if (isReducedMotion && !config.enableReducedMotion) return;

        createRippleEffect(element, event);
    }, [isReducedMotion, config.enableReducedMotion]);

    const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
        if (!config.enableHapticFeedback || !deviceCapabilities.hasVibration) return;

        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            selection: [5],
        };

        try {
            navigator.vibrate(patterns[type]);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }, [config.enableHapticFeedback, deviceCapabilities.hasVibration]);

    // ==================== 滚动管理 ====================

    const smoothScrollTo = useCallback((
        target: HTMLElement | string,
        options: ScrollIntoViewOptions = {}
    ) => {
        if (!config.enableSmoothScrolling) return;

        let element: HTMLElement | null = null;

        if (typeof target === 'string') {
            element = document.querySelector(target);
        } else {
            element = target;
        }

        if (!element) return;

        const defaultOptions: ScrollIntoViewOptions = {
            behavior: isReducedMotion ? 'auto' : 'smooth',
            block: 'start',
            inline: 'nearest',
            ...options,
        };

        element.scrollIntoView(defaultOptions);
    }, [config.enableSmoothScrolling, isReducedMotion]);

    const scrollToTop = useCallback((smooth: boolean = true) => {
        if (typeof window === 'undefined') return;

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: smooth && !isReducedMotion ? 'smooth' : 'auto',
        });
    }, [isReducedMotion]);

    // ==================== 工具方法 ====================

    const isVisible = useCallback((element: HTMLElement): boolean => {
        if (typeof window === 'undefined') return false;

        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }, []);

    // ==================== 实用组件属性 ====================

    const getLoadingProps = useCallback(() => ({
        'aria-busy': loading.isLoading,
        'aria-live': loading.isLoading ? 'polite' as const : 'assertive' as const,
    }), [loading.isLoading]);

    const getSkeletonProps = useCallback(() => ({
        className: 'skeleton',
        'aria-hidden': true,
    }), []);

    // ==================== 清理 ====================

    useEffect(() => {
        return () => {
            // 取消所有正在进行的动画
            animationsRef.current.forEach(animation => {
                animation.cancel();
            });
            animationsRef.current.clear();

            // 清理观察器
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // ==================== 返回值 ====================

    return {
        // 加载状态管理
        loading,
        setLoading,
        showLoading,
        hideLoading,

        // 动画管理
        animate,
        fadeIn,
        fadeOut,
        slideIn,
        slideOut,

        // 交互反馈
        ripple,
        hapticFeedback,

        // 滚动管理
        smoothScrollTo,
        scrollToTop,

        // 工具方法
        isReducedMotion,
        isTouchDevice: deviceCapabilities.isTouchDevice,
        isVisible,

        // 实用组件属性
        getLoadingProps,
        getSkeletonProps,
    };
};

// ==================== 工具函数导出 ====================

export { addGlobalStyles, createRippleEffect, getDeviceCapabilities };

// ==================== 类型导出 ====================

export type { AnimationConfig, LoadingState, ToastOptions, UIInteractionOptions };

