import { useCallback, useEffect, useState } from 'react';

export interface UseNetworkStatusOptions {
    onOnline?: () => void;
    onOffline?: () => void;
}

export interface UseNetworkStatusReturn {
    isOnline: boolean;
    reconnect: () => void;
    checkConnectivity: () => Promise<boolean>;
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}): UseNetworkStatusReturn {
    const [isOnline, setIsOnline] = useState(
        typeof window !== 'undefined' ? navigator.onLine : true
    );

    const checkConnectivity = useCallback(async (): Promise<boolean> => {
        if (typeof window === 'undefined') return true;

        try {
            const response = await fetch('/ping', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }, []);

    const reconnect = useCallback(() => {
        if (typeof window === 'undefined') return;

        checkConnectivity().then(online => {
            setIsOnline(online);
            if (online) {
                options.onOnline?.();
            } else {
                options.onOffline?.();
            }
        });
    }, [checkConnectivity, options]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            setIsOnline(true);
            options.onOnline?.();
        };

        const handleOffline = () => {
            setIsOnline(false);
            options.onOffline?.();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 定期检查网络状态
        const interval = setInterval(() => {
            checkConnectivity().then(online => {
                setIsOnline(online);
            });
        }, 30000); // 30秒检查一次

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [checkConnectivity, options]);

    return {
        isOnline,
        reconnect,
        checkConnectivity,
    };
}

