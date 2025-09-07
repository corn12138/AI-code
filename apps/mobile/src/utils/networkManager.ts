/**
 * 网络状态管理器
 * 处理网络状态变化、离线缓存和弱网优化
 */

import { nativeBridge, type NetworkInfo } from './nativeBridge';

export interface NetworkConfig {
    checkInterval: number;
    retryAttempts: number;
    retryDelay: number;
    offlineCacheSize: number;
    weakNetworkThreshold: number;
}

export interface CacheItem {
    key: string;
    data: any;
    timestamp: number;
    expiresAt?: number;
}

export interface NetworkStatus {
    isOnline: boolean;
    quality: 'excellent' | 'good' | 'poor' | 'none';
    type: string;
    strength: number;
    lastChecked: number;
}

class NetworkManager {
    private config: NetworkConfig = {
        checkInterval: 5000,        // 5秒检查一次
        retryAttempts: 3,           // 重试3次
        retryDelay: 1000,           // 重试间隔1秒
        offlineCacheSize: 50,       // 缓存50个项目
        weakNetworkThreshold: 50    // 信号强度低于50认为是弱网
    };

    private networkStatus: NetworkStatus = {
        isOnline: true,
        quality: 'excellent',
        type: 'unknown',
        strength: 100,
        lastChecked: Date.now()
    };

    private listeners: Set<(status: NetworkStatus) => void> = new Set();
    private offlineCache: Map<string, CacheItem> = new Map();
    private pendingRequests: Map<string, Promise<any>> = new Map();
    private checkIntervalId: NodeJS.Timeout | null = null;

    constructor(config?: Partial<NetworkConfig>) {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        this.init();
    }

    /**
     * 初始化网络管理器
     */
    private async init(): Promise<void> {
        // 添加网络状态监听器
        nativeBridge.addNetworkListener((networkInfo: NetworkInfo) => {
            this.updateNetworkStatus(networkInfo);
        });

        // 启动定期检查
        this.startPeriodicCheck();

        // 加载离线缓存
        await this.loadOfflineCache();

        // 监听页面可见性变化
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.checkNetworkStatus();
                }
            });
        }
    }

    /**
     * 更新网络状态
     */
    private updateNetworkStatus(networkInfo: NetworkInfo): void {
        const oldStatus = { ...this.networkStatus };

        this.networkStatus = {
            isOnline: networkInfo.isConnected,
            quality: networkInfo.quality,
            type: networkInfo.type,
            strength: networkInfo.strength,
            lastChecked: Date.now()
        };

        // 检查状态是否发生变化
        const hasChanged =
            oldStatus.isOnline !== this.networkStatus.isOnline ||
            oldStatus.quality !== this.networkStatus.quality ||
            oldStatus.strength !== this.networkStatus.strength;

        if (hasChanged) {
            this.notifyListeners();
            this.handleNetworkChange(oldStatus, this.networkStatus);
        }
    }

    /**
     * 处理网络状态变化
     */
    private handleNetworkChange(oldStatus: NetworkStatus, newStatus: NetworkStatus): void {
        console.log('网络状态变化:', {
            from: oldStatus,
            to: newStatus
        });

        if (!oldStatus.isOnline && newStatus.isOnline) {
            // 网络恢复
            this.onNetworkRestored();
        } else if (oldStatus.isOnline && !newStatus.isOnline) {
            // 网络断开
            this.onNetworkLost();
        } else if (newStatus.quality === 'poor' || newStatus.strength < this.config.weakNetworkThreshold) {
            // 弱网环境
            this.onWeakNetwork();
        }
    }

    /**
     * 网络恢复处理
     */
    private onNetworkRestored(): void {
        console.log('网络已恢复');

        // 重试失败的请求
        this.retryFailedRequests();

        // 同步离线缓存的数据
        this.syncOfflineCache();

        // 通知用户
        this.showNetworkNotification('网络已恢复', 'success');
    }

    /**
     * 网络断开处理
     */
    private onNetworkLost(): void {
        console.log('网络已断开');

        // 启用离线模式
        this.enableOfflineMode();

        // 通知用户
        this.showNetworkNotification('网络连接已断开，已启用离线模式', 'warning');
    }

    /**
     * 弱网环境处理
     */
    private onWeakNetwork(): void {
        console.log('检测到弱网环境');

        // 启用弱网优化
        this.enableWeakNetworkOptimization();

        // 通知用户
        this.showNetworkNotification('网络信号较弱，已启用优化模式', 'info');
    }

    /**
     * 重试失败的请求
     */
    private async retryFailedRequests(): Promise<void> {
        const failedRequests = Array.from(this.pendingRequests.entries());

        for (const [key, promise] of failedRequests) {
            try {
                await promise;
                this.pendingRequests.delete(key);
            } catch (error) {
                console.warn('重试请求失败:', key, error);
            }
        }
    }

    /**
     * 同步离线缓存
     */
    private async syncOfflineCache(): Promise<void> {
        const cacheItems = Array.from(this.offlineCache.values());

        for (const item of cacheItems) {
            try {
                // 这里可以实现具体的同步逻辑
                console.log('同步缓存数据:', item.key);

                // 同步成功后删除缓存
                this.offlineCache.delete(item.key);
            } catch (error) {
                console.error('同步缓存失败:', item.key, error);
            }
        }
    }

    /**
     * 启用离线模式
     */
    private enableOfflineMode(): void {
        // 设置离线标志
        localStorage.setItem('offline_mode', 'true');

        // 可以在这里实现其他离线模式逻辑
        console.log('已启用离线模式');
    }

    /**
     * 启用弱网优化
     */
    private enableWeakNetworkOptimization(): void {
        // 设置弱网优化标志
        localStorage.setItem('weak_network_optimization', 'true');

        // 可以在这里实现弱网优化逻辑
        console.log('已启用弱网优化');
    }

    /**
     * 显示网络通知
     */
    private async showNetworkNotification(message: string, type: 'success' | 'warning' | 'info'): Promise<void> {
        try {
            await nativeBridge.showToast(message, 'long');
        } catch (error) {
            console.warn('显示网络通知失败:', error);
        }
    }

    /**
     * 启动定期检查
     */
    private startPeriodicCheck(): void {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }

        this.checkIntervalId = setInterval(() => {
            this.checkNetworkStatus();
        }, this.config.checkInterval);
    }

    /**
     * 检查网络状态
     */
    private async checkNetworkStatus(): Promise<void> {
        try {
            const networkInfo = await nativeBridge.getNetworkStatus({
                timeout: 5000,
                retries: 1
            });

            this.updateNetworkStatus(networkInfo);
        } catch (error) {
            console.warn('网络状态检查失败:', error);

            // 如果检查失败，假设网络断开
            this.updateNetworkStatus({
                isConnected: false,
                type: 'unknown',
                strength: 0,
                quality: 'none'
            });
        }
    }

    /**
     * 通知监听器
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.networkStatus);
            } catch (error) {
                console.error('网络状态监听器执行失败:', error);
            }
        });
    }

    /**
     * 添加网络状态监听器
     */
    addListener(listener: (status: NetworkStatus) => void): () => void {
        this.listeners.add(listener);

        // 立即返回当前状态
        listener(this.networkStatus);

        // 返回移除监听器的函数
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * 获取当前网络状态
     */
    getNetworkStatus(): NetworkStatus {
        return { ...this.networkStatus };
    }

    /**
     * 检查是否在线
     */
    isOnline(): boolean {
        return this.networkStatus.isOnline;
    }

    /**
     * 检查网络质量
     */
    getNetworkQuality(): 'excellent' | 'good' | 'poor' | 'none' {
        return this.networkStatus.quality;
    }

    /**
     * 检查是否为弱网环境
     */
    isWeakNetwork(): boolean {
        return this.networkStatus.quality === 'poor' ||
            this.networkStatus.strength < this.config.weakNetworkThreshold;
    }

    /**
     * 缓存数据
     */
    async cacheData(key: string, data: any, expiresIn?: number): Promise<void> {
        const cacheItem: CacheItem = {
            key,
            data,
            timestamp: Date.now(),
            expiresAt: expiresIn ? Date.now() + expiresIn : undefined
        };

        this.offlineCache.set(key, cacheItem);

        // 限制缓存大小
        if (this.offlineCache.size > this.config.offlineCacheSize) {
            this.cleanupCache();
        }

        // 保存到本地存储
        await this.saveOfflineCache();
    }

    /**
     * 获取缓存数据
     */
    getCachedData(key: string): any | null {
        const item = this.offlineCache.get(key);

        if (!item) {
            return null;
        }

        // 检查是否过期
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.offlineCache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * 清理过期缓存
     */
    private cleanupCache(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, item] of this.offlineCache) {
            if (item.expiresAt && now > item.expiresAt) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => {
            this.offlineCache.delete(key);
        });

        // 如果缓存仍然过大，删除最旧的项目
        if (this.offlineCache.size > this.config.offlineCacheSize) {
            const sortedItems = Array.from(this.offlineCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            const itemsToRemove = sortedItems.slice(0, this.offlineCache.size - this.config.offlineCacheSize);
            itemsToRemove.forEach(([key]) => {
                this.offlineCache.delete(key);
            });
        }
    }

    /**
     * 保存离线缓存到本地存储
     */
    private async saveOfflineCache(): Promise<void> {
        try {
            const cacheData = Array.from(this.offlineCache.entries());
            await nativeBridge.setStorage('offline_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.error('保存离线缓存失败:', error);
        }
    }

    /**
     * 从本地存储加载离线缓存
     */
    private async loadOfflineCache(): Promise<void> {
        try {
            const cacheData = await nativeBridge.getStorage('offline_cache');
            if (cacheData) {
                const parsedData = JSON.parse(cacheData);
                this.offlineCache = new Map(parsedData);
                this.cleanupCache(); // 清理过期数据
            }
        } catch (error) {
            console.error('加载离线缓存失败:', error);
        }
    }

    /**
     * 清除所有缓存
     */
    async clearCache(): Promise<void> {
        this.offlineCache.clear();
        await nativeBridge.setStorage('offline_cache', '');
    }

    /**
     * 获取缓存统计信息
     */
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.offlineCache.size,
            keys: Array.from(this.offlineCache.keys())
        };
    }

    /**
     * 销毁网络管理器
     */
    destroy(): void {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }

        this.listeners.clear();
        this.offlineCache.clear();
        this.pendingRequests.clear();
    }
}

// 创建单例实例
export const networkManager = new NetworkManager();

// 导出类型
export type { CacheItem, NetworkConfig, NetworkManager, NetworkStatus };

