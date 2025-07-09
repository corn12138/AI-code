import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export interface UseLocalStorageOptions<T> {
    serializer?: {
        read: (value: string) => T;
        write: (value: T) => string;
    };
    syncAcrossTabs?: boolean;
    onError?: (error: Error) => void;
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
    const {
        serializer = {
            read: JSON.parse,
            write: JSON.stringify,
        },
        syncAcrossTabs = true,
        onError = console.error,
    } = options;

    // 从localStorage读取初始值
    const readValue = useCallback((): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? serializer.read(item) : initialValue;
        } catch (error) {
            onError(error as Error);
            return initialValue;
        }
    }, [initialValue, key, serializer, onError]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // 设置值到localStorage
    const setValue = useCallback(
        (value: SetValue<T>) => {
            if (typeof window === 'undefined') {
                return;
            }

            try {
                const newValue = value instanceof Function ? value(storedValue) : value;

                // 保存到localStorage
                window.localStorage.setItem(key, serializer.write(newValue));

                // 更新状态
                setStoredValue(newValue);

                // 如果启用跨标签页同步，触发storage事件
                if (syncAcrossTabs) {
                    window.dispatchEvent(
                        new StorageEvent('storage', {
                            key,
                            newValue: serializer.write(newValue),
                            oldValue: window.localStorage.getItem(key),
                        })
                    );
                }
            } catch (error) {
                onError(error as Error);
            }
        },
        [key, serializer, storedValue, syncAcrossTabs, onError]
    );

    // 删除值
    const removeValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);

            if (syncAcrossTabs) {
                window.dispatchEvent(
                    new StorageEvent('storage', {
                        key,
                        newValue: null,
                        oldValue: window.localStorage.getItem(key),
                    })
                );
            }
        } catch (error) {
            onError(error as Error);
        }
    }, [key, initialValue, syncAcrossTabs, onError]);

    // 监听localStorage变化（跨标签页同步）
    useEffect(() => {
        if (!syncAcrossTabs || typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                try {
                    if (e.newValue === null) {
                        setStoredValue(initialValue);
                    } else {
                        setStoredValue(serializer.read(e.newValue));
                    }
                } catch (error) {
                    onError(error as Error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue, serializer, syncAcrossTabs, onError]);

    // 当key改变时，重新读取值
    useEffect(() => {
        setStoredValue(readValue());
    }, [readValue]);

    return [storedValue, setValue, removeValue];
}

