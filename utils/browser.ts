export const isBrowser = typeof window !== 'undefined';

export function safeWindow<T>(fn: () => T, fallback: T): T {
    if (isBrowser) {
        return fn();
    }
    return fallback;
}

export function useClientSideValue<T>(getValue: () => T, defaultValue: T): T {
    const [value, setValue] = useState<T>(defaultValue);

    useEffect(() => {
        setValue(getValue());
    }, [getValue]);

    return value;
}
