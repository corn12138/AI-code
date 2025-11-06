// 原生桥接工具类
export class NativeBridge {
    private static instance: NativeBridge;
    private isNative = false;
    private callbacks: Map<string, Function> = new Map();

    private constructor() {
        this.isNative = this.detectNative();
        this.setupEventListeners();
    }

    public static getInstance(): NativeBridge {
        if (!NativeBridge.instance) {
            NativeBridge.instance = new NativeBridge();
        }
        return NativeBridge.instance;
    }

    // 检测是否在原生环境中
    private detectNative(): boolean {
        return !!(window as any).NativeBridge;
    }

    // 设置事件监听器
    private setupEventListeners(): void {
        if (this.isNative) {
            // 页面加载完成事件
            document.addEventListener('DOMContentLoaded', () => {
                this.trigger('onReady');
            });

            // 页面可见性变化事件
            document.addEventListener('visibilitychange', () => {
                this.trigger('onVisibilityChange', {
                    hidden: document.hidden,
                    visibilityState: document.visibilityState
                });
            });

            // 网络状态变化事件
            window.addEventListener('online', () => {
                this.trigger('onNetworkChange', { online: true });
            });

            window.addEventListener('offline', () => {
                this.trigger('onNetworkChange', { online: false });
            });
        }
    }

    // 触发事件
    private trigger(eventName: string, data?: any): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge[eventName]?.(data);
            } catch (error) {
                console.error('Native bridge event error:', error);
            }
        }
    }

    // 获取设备信息
    public async getDeviceInfo(): Promise<any> {
        if (!this.isNative) {
            return this.getFallbackDeviceInfo();
        }

        try {
            return await (window as any).NativeBridge.getDeviceInfo();
        } catch (error) {
            console.error('Get device info error:', error);
            return this.getFallbackDeviceInfo();
        }
    }

    // 获取网络状态
    public async getNetworkStatus(): Promise<any> {
        if (!this.isNative) {
            return this.getFallbackNetworkStatus();
        }

        try {
            return await (window as any).NativeBridge.getNetworkStatus();
        } catch (error) {
            console.error('Get network status error:', error);
            return this.getFallbackNetworkStatus();
        }
    }

    // 显示 Toast
    public showToast(message: string, duration: number = 2000): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.showToast(message, duration);
            } catch (error) {
                console.error('Show toast error:', error);
                this.showFallbackToast(message);
            }
        } else {
            this.showFallbackToast(message);
        }
    }

    // 显示加载指示器
    public showLoading(message: string = '加载中...'): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.showLoading(message);
            } catch (error) {
                console.error('Show loading error:', error);
            }
        }
    }

    // 隐藏加载指示器
    public hideLoading(): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.hideLoading();
            } catch (error) {
                console.error('Hide loading error:', error);
            }
        }
    }

    // 导航控制
    public goBack(): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.goBack();
            } catch (error) {
                console.error('Go back error:', error);
                window.history.back();
            }
        } else {
            window.history.back();
        }
    }

    public goForward(): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.goForward();
            } catch (error) {
                console.error('Go forward error:', error);
                window.history.forward();
            }
        } else {
            window.history.forward();
        }
    }

    // 页面跳转
    public navigate(url: string): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.navigate(url);
            } catch (error) {
                console.error('Navigate error:', error);
                window.location.href = url;
            }
        } else {
            window.location.href = url;
        }
    }

    // 关闭页面
    public close(): void {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.close();
            } catch (error) {
                console.error('Close error:', error);
            }
        }
    }

    // 数据存储
    public async setStorage(key: string, value: string): Promise<void> {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                (window as any).NativeBridge.setStorage(key, value);
            } catch (error) {
                console.error('Set storage error:', error);
                localStorage.setItem(key, value);
            }
        } else {
            localStorage.setItem(key, value);
        }
    }

    public async getStorage(key: string): Promise<string> {
        if (this.isNative && (window as any).NativeBridge) {
            try {
                return await (window as any).NativeBridge.getStorage(key);
            } catch (error) {
                console.error('Get storage error:', error);
                return localStorage.getItem(key) || '';
            }
        } else {
            return localStorage.getItem(key) || '';
        }
    }

    // 降级方案
    private getFallbackDeviceInfo(): any {
        return {
            platform: 'web',
            version: navigator.userAgent,
            model: 'Unknown',
            brand: 'Web',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            density: window.devicePixelRatio || 1
        };
    }

    private getFallbackNetworkStatus(): any {
        return {
            isConnected: navigator.onLine,
            type: 'unknown',
            strength: 100
        };
    }

    private showFallbackToast(message: string): void {
        // 创建简单的 Toast 提示
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-size: 14px;
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }

    // 检查是否在原生环境中
    public isInNative(): boolean {
        return this.isNative;
    }
}

// 导出单例实例
export const nativeBridge = NativeBridge.getInstance();
