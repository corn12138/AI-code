'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
    isTransitioning: boolean;
    duration?: number;
    type?: 'fade' | 'slide' | 'scale' | 'blur';
    className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    isTransitioning,
    duration = 300,
    type = 'fade',
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 检查用户是否偏好减少动画
    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // 如果用户偏好减少动画，直接渲染内容
    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    useEffect(() => {
        if (isTransitioning) {
            // 开始过渡 - 隐藏内容
            setIsVisible(false);
        } else {
            // 结束过渡 - 延迟显示新内容
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
            }, 50); // 短暂延迟确保DOM更新
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isTransitioning]);

    const getTransitionClasses = () => {
        const baseClasses = `transition-all duration-${duration} ease-in-out`;

        switch (type) {
            case 'slide':
                return `${baseClasses} transform ${isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-4 opacity-0'
                    }`;
            case 'scale':
                return `${baseClasses} transform ${isVisible
                    ? 'scale-100 opacity-100'
                    : 'scale-95 opacity-0'
                    }`;
            case 'blur':
                return `${baseClasses} ${isVisible
                    ? 'blur-0 opacity-100'
                    : 'blur-sm opacity-0'
                    }`;
            default: // fade
                return `${baseClasses} ${isVisible
                    ? 'opacity-100'
                    : 'opacity-0'
                    }`;
        }
    };

    const transitionStyle = {
        transitionDuration: `${duration}ms`,
    };

    return (
        <div
            ref={containerRef}
            className={`${getTransitionClasses()} ${className}`}
            style={transitionStyle}
        >
            {children}
        </div>
    );
};

// 高级页面过渡组件 - 支持进入和退出动画
interface AdvancedPageTransitionProps {
    children: React.ReactNode;
    transitionKey: string;
    duration?: number;
    enterAnimation?: string;
    exitAnimation?: string;
    className?: string;
}

export const AdvancedPageTransition: React.FC<AdvancedPageTransitionProps> = ({
    children,
    transitionKey,
    duration = 300,
    enterAnimation = 'fadeIn',
    exitAnimation = 'fadeOut',
    className = '',
}) => {
    const [currentKey, setCurrentKey] = useState(transitionKey);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentChildren, setCurrentChildren] = useState(children);
    const containerRef = useRef<HTMLDivElement>(null);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        if (prefersReducedMotion) {
            setCurrentChildren(children);
            setCurrentKey(transitionKey);
            return;
        }

        if (transitionKey !== currentKey) {
            setIsAnimating(true);

            // 退出动画
            if (containerRef.current) {
                containerRef.current.style.animation = `${exitAnimation} ${duration}ms ease-in-out`;
            }

            setTimeout(() => {
                setCurrentChildren(children);
                setCurrentKey(transitionKey);

                // 进入动画
                if (containerRef.current) {
                    containerRef.current.style.animation = `${enterAnimation} ${duration}ms ease-in-out`;
                }

                setTimeout(() => {
                    setIsAnimating(false);
                    if (containerRef.current) {
                        containerRef.current.style.animation = '';
                    }
                }, duration);
            }, duration);
        }
    }, [transitionKey, currentKey, children, duration, enterAnimation, exitAnimation, prefersReducedMotion]);

    // 添加CSS动画关键帧
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const styleId = 'page-transition-animations';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes slideInRight {
                    from { 
                        opacity: 0; 
                        transform: translateX(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
                
                @keyframes slideOutLeft {
                    from { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                    to { 
                        opacity: 0; 
                        transform: translateX(-20px); 
                    }
                }
                
                @keyframes scaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1); 
                    }
                }
                
                @keyframes scaleOut {
                    from { 
                        opacity: 1; 
                        transform: scale(1); 
                    }
                    to { 
                        opacity: 0; 
                        transform: scale(1.05); 
                    }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    @keyframes fadeIn,
                    @keyframes fadeOut,
                    @keyframes slideInRight,
                    @keyframes slideOutLeft,
                    @keyframes scaleIn,
                    @keyframes scaleOut {
                        animation-duration: 0.001ms !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={`${className} ${isAnimating ? 'pointer-events-none' : ''}`}
            key={currentKey}
        >
            {currentChildren}
        </div>
    );
};
