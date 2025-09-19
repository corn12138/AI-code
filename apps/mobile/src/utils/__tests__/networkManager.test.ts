import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nativeBridge } from '../nativeBridge';

const createLocalStorageMock = () => {
    const store = new Map<string, string>();
    return {
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => {
            store.set(key, String(value));
        },
        removeItem: (key: string) => {
            store.delete(key);
        },
        clear: () => {
            store.clear();
        }
    };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    configurable: true
});

import { networkManager } from '../networkManager';

// Mock nativeBridge
vi.mock('../nativeBridge', () => ({
    nativeBridge: {
        addNetworkListener: vi.fn(),
        getNetworkStatus: vi.fn(),
        setStorage: vi.fn(),
        getStorage: vi.fn(),
        showToast: vi.fn()
    }
}));

describe('NetworkManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        // Reset networkManager state
        (networkManager as any).networkStatus = {
            isOnline: true,
            quality: 'excellent',
            type: 'unknown',
            strength: 100,
            lastChecked: Date.now()
        };
        (networkManager as any).offlineCache.clear();
        (networkManager as any).listeners.clear();
    });

    describe('Network Status Management', () => {
        it('should initialize with default network status', () => {
            const status = networkManager.getNetworkStatus();
            expect(status.isOnline).toBe(true);
            expect(status.quality).toBe('excellent');
            expect(status.strength).toBe(100);
        });

        it('should update network status correctly', () => {
            const mockNetworkInfo = {
                isConnected: false,
                type: 'none',
                strength: 0,
                quality: 'none' as const
            };

            // Simulate network status update
            (networkManager as any).updateNetworkStatus(mockNetworkInfo);

            const status = networkManager.getNetworkStatus();
            expect(status.isOnline).toBe(false);
            expect(status.quality).toBe('none');
            expect(status.strength).toBe(0);
        });

        it('should detect weak network correctly', () => {
            const mockNetworkInfo = {
                isConnected: true,
                type: 'cellular',
                strength: 30,
                quality: 'poor' as const
            };

            (networkManager as any).updateNetworkStatus(mockNetworkInfo);

            expect(networkManager.isWeakNetwork()).toBe(true);
            expect(networkManager.getNetworkQuality()).toBe('poor');
        });

        it('should detect strong network correctly', () => {
            const mockNetworkInfo = {
                isConnected: true,
                type: 'wifi',
                strength: 90,
                quality: 'excellent' as const
            };

            (networkManager as any).updateNetworkStatus(mockNetworkInfo);

            expect(networkManager.isWeakNetwork()).toBe(false);
            expect(networkManager.getNetworkQuality()).toBe('excellent');
        });
    });

    describe('Network Status Listeners', () => {
        it('should add and remove network listeners', () => {
            const mockListener = vi.fn();

            // Add listener
            const removeListener = networkManager.addListener(mockListener);

            expect(mockListener).toHaveBeenCalledWith(networkManager.getNetworkStatus());

            // Simulate network status change
            const mockNetworkInfo = {
                isConnected: false,
                type: 'none',
                strength: 0,
                quality: 'none' as const
            };

            (networkManager as any).updateNetworkStatus(mockNetworkInfo);

            expect(mockListener).toHaveBeenCalledTimes(2);

            // Remove listener
            removeListener();

            // Simulate another network status change
            const newMockNetworkInfo = {
                isConnected: true,
                type: 'wifi',
                strength: 100,
                quality: 'excellent' as const
            };

            (networkManager as any).updateNetworkStatus(newMockNetworkInfo);

            // Listener should not be called again
            expect(mockListener).toHaveBeenCalledTimes(2);
        });

        it('should handle multiple listeners', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();

            networkManager.addListener(listener1);
            networkManager.addListener(listener2);

            const mockNetworkInfo = {
                isConnected: false,
                type: 'none',
                strength: 0,
                quality: 'none' as const
            };

            (networkManager as any).updateNetworkStatus(mockNetworkInfo);

            expect(listener1).toHaveBeenCalledTimes(2);
            expect(listener2).toHaveBeenCalledTimes(2);
        });
    });

    describe('Offline Cache Management', () => {
        it('should cache data correctly', async () => {
            const testData = { id: 1, name: 'test' };
            const cacheKey = 'test_key';

            await networkManager.cacheData(cacheKey, testData);

            const cachedData = networkManager.getCachedData(cacheKey);
            expect(cachedData).toEqual(testData);
        });

        it('should handle expired cache data', async () => {
            const testData = { id: 1, name: 'test' };
            const cacheKey = 'test_key';
            const expiresIn = 1000; // 1 second

            await networkManager.cacheData(cacheKey, testData, expiresIn);

            // Data should be available immediately
            let cachedData = networkManager.getCachedData(cacheKey);
            expect(cachedData).toEqual(testData);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Data should be expired
            cachedData = networkManager.getCachedData(cacheKey);
            expect(cachedData).toBeNull();
        });

        it('should limit cache size', async () => {
            const maxCacheSize = (networkManager as any).config.offlineCacheSize;

            // Add more items than the cache limit
            for (let i = 0; i < maxCacheSize + 5; i++) {
                await networkManager.cacheData(`key_${i}`, { data: i });
            }

            const stats = networkManager.getCacheStats();
            expect(stats.size).toBeLessThanOrEqual(maxCacheSize);
        });

        it('should get cache statistics', async () => {
            await networkManager.cacheData('key1', { data: 1 });
            await networkManager.cacheData('key2', { data: 2 });

            const stats = networkManager.getCacheStats();
            expect(stats.size).toBe(2);
            expect(stats.keys).toContain('key1');
            expect(stats.keys).toContain('key2');
        });

        it('should clear all cache', async () => {
            await networkManager.cacheData('key1', { data: 1 });
            await networkManager.cacheData('key2', { data: 2 });

            expect(networkManager.getCacheStats().size).toBe(2);

            await networkManager.clearCache();

            expect(networkManager.getCacheStats().size).toBe(0);
        });
    });

    describe('Network Change Handling', () => {
        it('should handle network restoration', () => {
            const mockShowToast = vi.mocked(nativeBridge.showToast);

            // Simulate network restoration
            (networkManager as any).onNetworkRestored();

            expect(mockShowToast).toHaveBeenCalledWith('网络已恢复', 'long');
        });

        it('should handle network loss', () => {
            const mockShowToast = vi.mocked(nativeBridge.showToast);

            // Simulate network loss
            (networkManager as any).onNetworkLost();

            expect(mockShowToast).toHaveBeenCalledWith('网络连接已断开，已启用离线模式', 'long');
            expect(localStorage.getItem('offline_mode')).toBe('true');
        });

        it('should handle weak network', () => {
            const mockShowToast = vi.mocked(nativeBridge.showToast);

            // Simulate weak network
            (networkManager as any).onWeakNetwork();

            expect(mockShowToast).toHaveBeenCalledWith('网络信号较弱，已启用优化模式', 'long');
            expect(localStorage.getItem('weak_network_optimization')).toBe('true');
        });
    });

    describe('Network Status Checking', () => {
        it('should check network status periodically', async () => {
            const mockGetNetworkStatus = vi.mocked(nativeBridge.getNetworkStatus);
            mockGetNetworkStatus.mockResolvedValue({
                isConnected: true,
                type: 'wifi',
                strength: 80,
                quality: 'good'
            });

            // Simulate periodic check
            await (networkManager as any).checkNetworkStatus();

            expect(mockGetNetworkStatus).toHaveBeenCalledWith({
                timeout: 5000,
                retries: 1
            });
        });

        it('should handle network status check failure', async () => {
            const mockGetNetworkStatus = vi.mocked(nativeBridge.getNetworkStatus);
            mockGetNetworkStatus.mockRejectedValue(new Error('Network error'));

            // Simulate periodic check
            await (networkManager as any).checkNetworkStatus();

            const status = networkManager.getNetworkStatus();
            expect(status.isOnline).toBe(false);
            expect(status.quality).toBe('none');
        });
    });

    describe('Error Handling', () => {
        it('should handle listener errors gracefully', () => {
            const errorListener = vi.fn().mockImplementation(() => {
                throw new Error('Listener error');
            });

            // Should not throw error
            expect(() => {
                networkManager.addListener(errorListener);
            }).not.toThrow();

            // Simulate network status change
            const mockNetworkInfo = {
                isConnected: false,
                type: 'none',
                strength: 0,
                quality: 'none' as const
            };

            // Should handle error gracefully
            expect(() => {
                (networkManager as any).updateNetworkStatus(mockNetworkInfo);
            }).not.toThrow();
        });

        it('should handle cache operations errors gracefully', async () => {
            const mockSetStorage = vi.mocked(nativeBridge.setStorage);
            mockSetStorage.mockRejectedValue(new Error('Storage error'));

            // Should not throw error
            await expect(networkManager.cacheData('test', { data: 1 })).resolves.not.toThrow();
        });
    });

    describe('Configuration', () => {
        it('should use custom configuration', () => {
            const customConfig = {
                checkInterval: 10000,
                retryAttempts: 5,
                retryDelay: 2000,
                offlineCacheSize: 100,
                weakNetworkThreshold: 30
            };

            // Create new instance with custom config
            const customNetworkManager = new (networkManager.constructor as any)(customConfig);

            expect((customNetworkManager as any).config.checkInterval).toBe(10000);
            expect((customNetworkManager as any).config.retryAttempts).toBe(5);
            expect((customNetworkManager as any).config.offlineCacheSize).toBe(100);
            expect((customNetworkManager as any).config.weakNetworkThreshold).toBe(30);
        });
    });
});
