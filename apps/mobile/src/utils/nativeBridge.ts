/**
 * 原生应用桥接工具类
 * 提供H5与原生应用的通信接口
 */

export interface DeviceInfo {
    platform: 'android' | 'ios' | 'web';
    version: string;
    model: string;
    brand: string;
    screenWidth: number;
    screenHeight: number;
    density: number;
}

export interface NetworkInfo {
    isConnected: boolean;
    type: string;
    strength: number;
    quality: 'excellent' | 'good' | 'poor' | 'none';
}

export interface BridgeResponse {
    callbackId: string;
    success: boolean;
    data?: any;
    error?: string;
}

export interface BridgeCallback {
    (response: BridgeResponse): void;
}

export interface BridgeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export interface ShareOptions {
    title?: string;
    text?: string;
    url?: string;
}

export interface NavBarOptions {
    title?: string;
    showBack?: boolean;
    rightText?: string;
}

class NativeBridge {
    private callbacks: Map<string, BridgeCallback> = new Map();
    private isNative = false;
    private platform: 'android' | 'ios' | 'web' = 'web';
    private networkListeners: Set<(info: NetworkInfo) => void> = new Set();
    private lastNetworkInfo: NetworkInfo | null = null;
    private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
    private defaultOptions: BridgeOptions = {
        timeout: 10000, // 10秒超时
        retries: 3,     // 重试3次
        retryDelay: 1000 // 重试间隔1秒
    };

    constructor() {
        this.detectPlatform();
        this.setupGlobalCallback();
        this.setupNetworkMonitoring();
        this.setupOfflineCache();
    }

    /**
     * 检测运行平台
     */
    private detectPlatform(): void {
        const userAgent = navigator.userAgent.toLowerCase();

        // 1) 首选 UA 标识（规范做法）
        if (userAgent.includes('workbenchapp')) {
            this.isNative = true;
            if (userAgent.includes('android')) {
                this.platform = 'android';
            } else if (userAgent.includes('ios')) {
                this.platform = 'ios';
            }
            return;
        }

        // 2) 兜底：根据桥接对象自动识别（减少 UA 配置遗漏导致的问题）
        const w = (typeof window !== 'undefined') ? (window as any) : {};
        if (w.webkit?.messageHandlers?.NativeBridge) {
            this.isNative = true;
            this.platform = 'ios';
            return;
        }
        if (w.NativeBridge && typeof w.NativeBridge === 'object') {
            this.isNative = true;
            this.platform = 'android';
        }
    }

    /**
     * 设置全局回调函数
     */
    private setupGlobalCallback(): void {
        if (typeof window !== 'undefined') {
            const w = window as any;
            // 避免覆盖原生注入对象（尤其 Android 的 addJavascriptInterface）
            if (!w.NativeBridge || typeof w.NativeBridge !== 'object') {
                w.NativeBridge = {};
            }
            w.NativeBridge.callback = (responseStr: string) => {
                try {
                    const response: BridgeResponse = JSON.parse(responseStr);
                    const callback = this.callbacks.get(response.callbackId);
                    if (callback) {
                        callback(response);
                        this.callbacks.delete(response.callbackId);
                    }
                } catch (error) {
                    console.error('解析原生回调失败:', error);
                }
            };

            // 原生事件推送入口：Native 可调用 emitEvent(JSONString) 或 emitEvent(name, data)
            w.NativeBridge.emitEvent = (arg1: string, arg2?: any) => {
                try {
                    if (arg2 !== undefined) {
                        // 形如 emitEvent('deepLink', { url: '...' })
                        this.dispatchEvent(arg1, arg2);
                        return;
                    }
                    // 形如 emitEvent('{"event":"deepLink","data":{...}}')
                    const payload = JSON.parse(arg1);
                    if (payload && payload.event) {
                        this.dispatchEvent(payload.event, payload.data);
                    }
                } catch (error) {
                    console.error('解析原生事件失败:', error);
                }
            };
        }
    }

    /**
     * 设置网络状态监听
     */
    private setupNetworkMonitoring(): void {
        // 监听浏览器网络状态变化
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.updateNetworkStatus({
                    isConnected: true,
                    type: 'web',
                    strength: 100,
                    quality: 'excellent'
                });
            });

            window.addEventListener('offline', () => {
                this.updateNetworkStatus({
                    isConnected: false,
                    type: 'none',
                    strength: 0,
                    quality: 'none'
                });
            });
        }

        // 定期检查网络状态
        setInterval(async () => {
            try {
                const networkInfo = await this.getNetworkStatus();
                this.updateNetworkStatus(networkInfo);
            } catch (error) {
                console.warn('网络状态检查失败:', error);
            }
        }, 5000); // 每5秒检查一次
    }

    /**
     * 更新网络状态并通知监听器
     */
    private updateNetworkStatus(networkInfo: NetworkInfo): void {
        const hasChanged = !this.lastNetworkInfo ||
            this.lastNetworkInfo.isConnected !== networkInfo.isConnected ||
            this.lastNetworkInfo.quality !== networkInfo.quality;

        this.lastNetworkInfo = networkInfo;

        if (hasChanged) {
            this.networkListeners.forEach(listener => {
                try {
                    listener(networkInfo);
                } catch (error) {
                    console.error('网络状态监听器执行失败:', error);
                }
            });
        }
    }

    /**
     * 设置离线缓存
     */
    private setupOfflineCache(): void {
        // 检查是否支持Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.warn('Service Worker注册失败:', error);
            });
        }
    }

    /**
     * 生成回调ID
     */
    private generateCallbackId(): string {
        return `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 事件分发/订阅
     */
    private dispatchEvent(event: string, data: any): void {
        const set = this.eventListeners.get(event);
        if (!set) return;
        set.forEach(fn => {
            try { fn(data); } catch (e) { console.error('事件回调执行失败:', e); }
        });
    }

    addEventListener(event: string, handler: (data: any) => void): () => void {
        if (!this.eventListeners.has(event)) this.eventListeners.set(event, new Set());
        const set = this.eventListeners.get(event)!;
        set.add(handler);
        return () => set.delete(handler);
    }

    /**
     * 带超时和重试的原生方法调用
     */
    private async callNativeWithRetry(
        method: string,
        options: BridgeOptions = {},
        ...args: any[]
    ): Promise<any> {
        const finalOptions = { ...this.defaultOptions, ...options };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= finalOptions.retries!; attempt++) {
            try {
                return await this.callNativeWithTimeout(method, finalOptions.timeout!, ...args);
            } catch (error) {
                lastError = error as Error;

                // 检查是否是网络相关错误
                if (this.isNetworkError(error) && attempt < finalOptions.retries!) {
                    console.warn(`原生调用失败，${finalOptions.retryDelay!}ms后重试 (${attempt + 1}/${finalOptions.retries!}):`, error);
                    await this.delay(finalOptions.retryDelay!);
                    continue;
                }

                // 非网络错误或重试次数用完，直接抛出
                throw error;
            }
        }

        throw lastError || new Error('原生调用失败');
    }

    /**
     * 带超时的原生方法调用
     */
    private callNativeWithTimeout(method: string, timeout: number, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.isNative) {
                reject(new Error('当前不在原生环境中'));
                return;
            }

            const callbackId = this.generateCallbackId();
            let timeoutId: NodeJS.Timeout;

            // 设置超时
            timeoutId = setTimeout(() => {
                this.callbacks.delete(callbackId);
                reject(new Error(`原生调用超时: ${method}`));
            }, timeout);

            this.callbacks.set(callbackId, (response: BridgeResponse) => {
                clearTimeout(timeoutId);
                if (response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response.error || '原生调用失败'));
                }
            });

            try {
                if (this.platform === 'android') {
                    // Android WebView
                    (window as any).NativeBridge[method](callbackId, ...args);
                } else if (this.platform === 'ios') {
                    // iOS WebView
                    (window as any).webkit?.messageHandlers?.NativeBridge?.postMessage({
                        method,
                        callbackId,
                        args
                    });
                }
            } catch (error) {
                clearTimeout(timeoutId);
                this.callbacks.delete(callbackId);
                reject(error);
            }
        });
    }

    /**
     * 判断是否为网络错误
     */
    private isNetworkError(error: any): boolean {
        const errorMessage = error?.message?.toLowerCase() || '';
        const networkErrorKeywords = [
            'network', 'timeout', 'connection', 'offline', 'unreachable',
            '网络', '超时', '连接', '离线', '不可达'
        ];

        return networkErrorKeywords.some(keyword => errorMessage.includes(keyword));
    }

    /**
     * 延迟函数
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 清理过期回调
     */
    private cleanupExpiredCallbacks(): void {
        const now = Date.now();
        const expiredCallbacks: string[] = [];

        for (const [id] of this.callbacks) {
            const timestamp = parseInt(id.split('_')[1]);
            if (now - timestamp > 30000) { // 30秒过期
                expiredCallbacks.push(id);
            }
        }

        expiredCallbacks.forEach(id => {
            this.callbacks.delete(id);
        });

        if (expiredCallbacks.length > 0) {
            console.warn(`清理了 ${expiredCallbacks.length} 个过期回调`);
        }
    }

    /**
     * 获取设备信息
     */
    async getDeviceInfo(options?: BridgeOptions): Promise<DeviceInfo> {
        if (!this.isNative) {
            return {
                platform: 'web',
                version: navigator.userAgent,
                model: 'Web Browser',
                brand: 'Web',
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                density: window.devicePixelRatio
            };
        }

        try {
            const deviceInfoStr = await this.callNativeWithRetry('getDeviceInfo', options);
            return JSON.parse(deviceInfoStr);
        } catch (error) {
            console.error('获取设备信息失败:', error);
            throw error;
        }
    }

    /**
     * 获取网络状态
     */
    async getNetworkStatus(options?: BridgeOptions): Promise<NetworkInfo> {
        if (!this.isNative) {
            const quality = navigator.onLine ? 'excellent' : 'none';
            return {
                isConnected: navigator.onLine,
                type: 'web',
                strength: navigator.onLine ? 100 : 0,
                quality
            };
        }

        try {
            const networkInfoStr = await this.callNativeWithRetry('getNetworkStatus', options);
            return JSON.parse(networkInfoStr);
        } catch (error) {
            console.error('获取网络状态失败:', error);
            // 返回默认网络状态
            return {
                isConnected: false,
                type: 'unknown',
                strength: 0,
                quality: 'none'
            };
        }
    }

    /**
     * 调用相机
     */
    async openCamera(options?: BridgeOptions): Promise<string> {
        if (!this.isNative) {
            throw new Error('Web环境不支持相机功能');
        }

        return this.callNativeWithRetry('openCamera', options);
    }

    /**
     * 选择图片
     */
    async pickImage(maxCount: number = 1, options?: BridgeOptions): Promise<string[]> {
        if (!this.isNative) {
            throw new Error('Web环境不支持图片选择功能');
        }

        return this.callNativeWithRetry('pickImage', options, maxCount);
    }

    /**
     * 显示Toast消息
     */
    async showToast(message: string, duration: 'short' | 'long' = 'short', options?: BridgeOptions): Promise<void> {
        if (!this.isNative) {
            // Web环境使用浏览器原生alert或自定义Toast
            alert(message);
            return;
        }

        return this.callNativeWithRetry('showToast', options, message, duration);
    }

    /**
     * 剪贴板-写入
     */
    async copyToClipboard(text: string, options?: BridgeOptions): Promise<void> {
        if (!this.isNative) {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return;
            }
            // 兜底
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta);
            return;
        }
        return this.callNativeWithRetry('copyToClipboard', options, text);
    }

    /**
     * 剪贴板-读取
     */
    async getClipboardText(options?: BridgeOptions): Promise<string | null> {
        if (!this.isNative) {
            try { return await navigator.clipboard.readText(); } catch { return null; }
        }
        const value = await this.callNativeWithRetry('getClipboardText', options);
        return value === 'null' ? null : value;
    }

    /**
     * 系统分享
     */
    async share(data: ShareOptions, options?: BridgeOptions): Promise<void> {
        if (!this.isNative) {
            if ((navigator as any).share) {
                await (navigator as any).share(data);
                return;
            }
            alert(data.text || data.title || data.url || '');
            return;
        }
        return this.callNativeWithRetry('share', options, data);
    }

    /**
     * 文件选择
     * 返回文件列表（Web 下返回 dataURL 数组；原生建议返回文件路径或 base64 数组）
     */
    async openFilePicker(accept = '*/*', multiple = false, options?: BridgeOptions): Promise<string[]> {
        if (!this.isNative) {
            return new Promise<string[]>((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = accept; input.multiple = multiple;
                input.onchange = async () => {
                    const files = Array.from(input.files || []);
                    const reads = files.map(f => new Promise<string>((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = () => res(String(reader.result));
                        reader.onerror = rej; reader.readAsDataURL(f);
                    }));
                    try { const out = await Promise.all(reads); resolve(out); } catch (e) { reject(e); }
                };
                input.click();
            });
        }
        return this.callNativeWithRetry('openFilePicker', options, { accept, multiple });
    }

    /**
     * 震动反馈
     */
    async vibrate(pattern: number | number[] = 50, options?: BridgeOptions): Promise<void> {
        if (!this.isNative) {
            try { navigator.vibrate && navigator.vibrate(pattern as any); } catch {}
            return;
        }
        return this.callNativeWithRetry('vibrate', options, pattern);
    }

    /**
     * 设置原生导航栏
     */
    async setNavBar(optionsObj: NavBarOptions, options?: BridgeOptions): Promise<void> {
        if (!this.isNative) return;
        return this.callNativeWithRetry('setNavBar', options, optionsObj);
    }

    /**
     * 关闭 WebView
     */
    async closeWebView(options?: BridgeOptions): Promise<void> {
        if (!this.isNative) {
            if (window.history.length > 1) window.history.back(); else window.close();
            return;
        }
        return this.callNativeWithRetry('closeWebView', options);
    }

    /**
     * 打开深链/外链
     */
    async openDeepLink(url: string, options?: BridgeOptions): Promise<void> {
        if (!this.isNative) { window.location.href = url; return; }
        return this.callNativeWithRetry('openDeepLink', options, url);
    }

    /**
     * 获取本地存储
     */
    async getStorage(key: string, options?: BridgeOptions): Promise<string | null> {
        if (!this.isNative) {
            return localStorage.getItem(key);
        }

        try {
            const value = await this.callNativeWithRetry('getStorage', options, key);
            return value === 'null' ? null : value;
        } catch (error) {
            console.error('获取存储数据失败:', error);
            return null;
        }
    }

    /**
     * 设置本地存储
     */
    async setStorage(key: string, value: string, options?: BridgeOptions): Promise<void> {
        if (!this.isNative) {
            localStorage.setItem(key, value);
            return;
        }

        return this.callNativeWithRetry('setStorage', options, key, value);
    }

    /**
     * 添加网络状态监听器
     */
    addNetworkListener(listener: (info: NetworkInfo) => void): () => void {
        this.networkListeners.add(listener);

        // 立即返回当前网络状态
        if (this.lastNetworkInfo) {
            try {
                listener(this.lastNetworkInfo);
            } catch (error) {
                console.error('网络状态监听器执行失败:', error);
            }
        }

        // 返回移除监听器的函数
        return () => {
            this.networkListeners.delete(listener);
        };
    }

    /**
     * 检查网络质量
     */
    async checkNetworkQuality(): Promise<NetworkInfo> {
        const networkInfo = await this.getNetworkStatus();

        // 根据信号强度判断网络质量
        if (networkInfo.strength >= 80) {
            networkInfo.quality = 'excellent';
        } else if (networkInfo.strength >= 50) {
            networkInfo.quality = 'good';
        } else if (networkInfo.strength > 0) {
            networkInfo.quality = 'poor';
        } else {
            networkInfo.quality = 'none';
        }

        return networkInfo;
    }

    /**
     * 检查是否在原生环境中
     */
    isNativeEnvironment(): boolean {
        return this.isNative;
    }

    /**
     * 获取当前平台
     */
    getPlatform(): 'android' | 'ios' | 'web' {
        return this.platform;
    }

    /**
     * 获取当前网络状态
     */
    getCurrentNetworkInfo(): NetworkInfo | null {
        return this.lastNetworkInfo;
    }

    /**
     * 清理资源
     */
    destroy(): void {
        this.callbacks.clear();
        this.networkListeners.clear();
        this.lastNetworkInfo = null;
    }
}

// 创建单例实例
export const nativeBridge = new NativeBridge();

// 导出类型
export type { NativeBridge };
export default nativeBridge;

// 定期清理过期回调
setInterval(() => {
    nativeBridge['cleanupExpiredCallbacks']();
}, 10000); // 每10秒清理一次
