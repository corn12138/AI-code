class MemoryCache {
    private cache = new Map<string, { value: any; expiry: number }>();

    set(key: string, value: any, ttl: number = 3600000) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    }

    get(key: string) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }
}

export const cache = new MemoryCache(); 