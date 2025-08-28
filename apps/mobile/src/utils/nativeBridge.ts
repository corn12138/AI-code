/**
 * H5 与原生应用通信桥接工具
 * 统一 iOS 和 Android 原生功能调用接口
 */

// 定义原生功能类型
export interface NativeMethods {
    // 设备信息
    getDeviceInfo(): Promise<DeviceInfo>
    getNetworkStatus(): Promise<NetworkStatus>

    // UI 交互
    showToast(message: string, duration?: number): void
    showLoading(message?: string): void
    hideLoading(): void
    showAlert(title: string, message: string): Promise<boolean>
    showConfirm(title: string, message: string): Promise<boolean>

    // 相机和相册
    openCamera(options?: CameraOptions): Promise<ImageResult>
    openGallery(options?: GalleryOptions): Promise<ImageResult>

    // 文件操作
    uploadFile(file: File): Promise<UploadResult>
    downloadFile(url: string, filename?: string): Promise<DownloadResult>

    // 导航和路由
    navigateBack(): void
    navigateToNative(route: string, params?: any): void

    // 存储
    setStorage(key: string, value: any): Promise<boolean>
    getStorage(key: string): Promise<any>
    removeStorage(key: string): Promise<boolean>

    // 推送通知
    requestNotificationPermission(): Promise<boolean>
    scheduleNotification(notification: NotificationConfig): Promise<string>

    // 分享
    shareText(text: string): Promise<boolean>
    shareImage(imageUrl: string, text?: string): Promise<boolean>
    shareUrl(url: string, title?: string): Promise<boolean>
}

// 类型定义
export interface DeviceInfo {
    platform: 'ios' | 'android'
    version: string
    model: string
    brand: string
    uuid: string
    appVersion: string
    buildNumber: string
}

export interface NetworkStatus {
    isConnected: boolean
    connectionType: 'wifi' | 'cellular' | 'none'
    isMetered: boolean
}

export interface CameraOptions {
    quality?: number // 0-100
    allowEdit?: boolean
    maxWidth?: number
    maxHeight?: number
}

export interface GalleryOptions {
    allowMultiple?: boolean
    maxCount?: number
    mediaType?: 'photo' | 'video' | 'all'
}

export interface ImageResult {
    success: boolean
    images: Array<{
        path: string
        base64?: string
        width: number
        height: number
        size: number
    }>
    error?: string
}

export interface UploadResult {
    success: boolean
    url?: string
    progress?: number
    error?: string
}

export interface DownloadResult {
    success: boolean
    path?: string
    progress?: number
    error?: string
}

export interface NotificationConfig {
    title: string
    body: string
    badge?: number
    sound?: string
    data?: any
    scheduleTime?: Date
}

/**
 * 原生桥接管理器
 */
class NativeBridge implements NativeMethods {
    private isIOS: boolean
    private isAndroid: boolean
    private isInNativeApp: boolean

    constructor() {
        this.isIOS = this.detectIOS()
        this.isAndroid = this.detectAndroid()
        this.isInNativeApp = this.isIOS || this.isAndroid
    }

    /**
     * 检测是否在 iOS 原生应用中
     */
    private detectIOS(): boolean {
        return !!(window as any).webkit &&
            !!(window as any).webkit.messageHandlers &&
            !!(window as any).webkit.messageHandlers.nativeHandler
    }

    /**
     * 检测是否在 Android 原生应用中
     */
    private detectAndroid(): boolean {
        return !!(window as any).Android &&
            typeof (window as any).Android.callNativeMethod === 'function'
    }

    /**
     * 调用 iOS 原生方法
     */
    private callIOS(method: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.isIOS) {
                reject(new Error('Not in iOS native app'))
                return
            }

            const callbackId = `callback_${Date.now()}_${Math.random()}`

                // 注册回调
                ; (window as any)[callbackId] = (result: any) => {
                    delete (window as any)[callbackId]
                    if (result.success) {
                        resolve(result.data)
                    } else {
                        reject(new Error(result.error))
                    }
                }

                // 发送消息到 iOS
                ; (window as any).webkit.messageHandlers.nativeHandler.postMessage({
                    method,
                    params,
                    callbackId
                })
        })
    }

    /**
     * 调用 Android 原生方法
     */
    private callAndroid(method: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.isAndroid) {
                reject(new Error('Not in Android native app'))
                return
            }

            try {
                const result = (window as any).Android.callNativeMethod(
                    method,
                    JSON.stringify(params || {})
                )

                // Android 返回的结果需要解析
                const parsedResult = JSON.parse(result)
                if (parsedResult.success) {
                    resolve(parsedResult.data)
                } else {
                    reject(new Error(parsedResult.error))
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * 通用原生方法调用
     */
    private callNative(method: string, params?: any): Promise<any> {
        if (!this.isInNativeApp) {
            console.warn(`Native method '${method}' called but not in native app`)
            return Promise.reject(new Error('Not in native app'))
        }

        if (this.isIOS) {
            return this.callIOS(method, params)
        } else if (this.isAndroid) {
            return this.callAndroid(method, params)
        }

        return Promise.reject(new Error('Unknown platform'))
    }

    // 实现 NativeMethods 接口
    async getDeviceInfo(): Promise<DeviceInfo> {
        if (!this.isInNativeApp) {
            // 返回 Web 环境的设备信息
            return {
                platform: /iPhone|iPad|iPod|iOS/.test(navigator.userAgent) ? 'ios' : 'android',
                version: 'unknown',
                model: 'web',
                brand: 'web',
                uuid: 'web-uuid',
                appVersion: '1.0.0',
                buildNumber: '1'
            }
        }
        return this.callNative('getDeviceInfo')
    }

    async getNetworkStatus(): Promise<NetworkStatus> {
        if (!this.isInNativeApp) {
            return {
                isConnected: navigator.onLine,
                connectionType: 'wifi',
                isMetered: false
            }
        }
        return this.callNative('getNetworkStatus')
    }

    showToast(message: string, duration = 3000): void {
        if (!this.isInNativeApp) {
            // Web 环境下的 toast 实现
            console.log('Toast:', message)
            return
        }
        this.callNative('showToast', { message, duration })
    }

    showLoading(message = '加载中...'): void {
        if (!this.isInNativeApp) {
            console.log('Loading:', message)
            return
        }
        this.callNative('showLoading', { message })
    }

    hideLoading(): void {
        if (!this.isInNativeApp) {
            console.log('Hide loading')
            return
        }
        this.callNative('hideLoading')
    }

    async showAlert(title: string, message: string): Promise<boolean> {
        if (!this.isInNativeApp) {
            alert(`${title}\n${message}`)
            return true
        }
        return this.callNative('showAlert', { title, message })
    }

    async showConfirm(title: string, message: string): Promise<boolean> {
        if (!this.isInNativeApp) {
            return confirm(`${title}\n${message}`)
        }
        return this.callNative('showConfirm', { title, message })
    }

    async openCamera(options?: CameraOptions): Promise<ImageResult> {
        return this.callNative('openCamera', options)
    }

    async openGallery(options?: GalleryOptions): Promise<ImageResult> {
        return this.callNative('openGallery', options)
    }

    async uploadFile(file: File): Promise<UploadResult> {
        return this.callNative('uploadFile', {
            name: file.name,
            size: file.size,
            type: file.type
        })
    }

    async downloadFile(url: string, filename?: string): Promise<DownloadResult> {
        return this.callNative('downloadFile', { url, filename })
    }

    navigateBack(): void {
        if (!this.isInNativeApp) {
            history.back()
            return
        }
        this.callNative('navigateBack')
    }

    navigateToNative(route: string, params?: any): void {
        if (!this.isInNativeApp) {
            console.log('Navigate to native:', route, params)
            return
        }
        this.callNative('navigateToNative', { route, params })
    }

    async setStorage(key: string, value: any): Promise<boolean> {
        if (!this.isInNativeApp) {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        }
        return this.callNative('setStorage', { key, value })
    }

    async getStorage(key: string): Promise<any> {
        if (!this.isInNativeApp) {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        }
        return this.callNative('getStorage', { key })
    }

    async removeStorage(key: string): Promise<boolean> {
        if (!this.isInNativeApp) {
            localStorage.removeItem(key)
            return true
        }
        return this.callNative('removeStorage', { key })
    }

    async requestNotificationPermission(): Promise<boolean> {
        return this.callNative('requestNotificationPermission')
    }

    async scheduleNotification(notification: NotificationConfig): Promise<string> {
        return this.callNative('scheduleNotification', notification)
    }

    async shareText(text: string): Promise<boolean> {
        if (!this.isInNativeApp && navigator.share) {
            try {
                await navigator.share({ text })
                return true
            } catch {
                return false
            }
        }
        return this.callNative('shareText', { text })
    }

    async shareImage(imageUrl: string, text?: string): Promise<boolean> {
        return this.callNative('shareImage', { imageUrl, text })
    }

    async shareUrl(url: string, title?: string): Promise<boolean> {
        if (!this.isInNativeApp && navigator.share) {
            try {
                await navigator.share({ url, title })
                return true
            } catch {
                return false
            }
        }
        return this.callNative('shareUrl', { url, title })
    }

    // 工具方法
    get platform() {
        return this.isIOS ? 'ios' : this.isAndroid ? 'android' : 'web'
    }

    get isNative() {
        return this.isInNativeApp
    }
}

// 导出单例
export const nativeBridge = new NativeBridge()

// 默认导出
export default nativeBridge
