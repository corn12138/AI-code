import { useEffect, useState } from 'react';

export interface WindowSize {
    width: number;
    height: number;
}

export interface UseWindowSizeOptions {
    debounceMs?: number;
    initialWidth?: number;
    initialHeight?: number;
}

export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
    const {
        debounceMs = 100,
        initialWidth = 1024,
        initialHeight = 768,
    } = options;

    const [windowSize, setWindowSize] = useState<WindowSize>(() => {
        if (typeof window === 'undefined') {
            return { width: initialWidth, height: initialHeight };
        }
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        let timeoutId: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }, debounceMs);
        };

        window.addEventListener('resize', handleResize);

        // 立即获取当前尺寸
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [debounceMs]);

    return windowSize;
}

