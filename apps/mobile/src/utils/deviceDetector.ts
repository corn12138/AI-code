/**
 * 设备检测工具
 * 自动识别设备类型并应用相应的优化
 */

export interface DeviceInfo {
    type: 'iphone' | 'android' | 'tablet' | 'desktop';
    brand?: string;
    model?: string;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    orientation: 'portrait' | 'landscape';
    isTouch: boolean;
    isHighDPI: boolean;
    isLowMemory: boolean;
    isSlowNetwork: boolean;
    isLowBattery: boolean;
    supportsHover: boolean;
    supportsTouch: boolean;
    userAgent: string;
    platform: string;
    vendor: string;
}

export interface DeviceOptimization {
    cssClasses: string[];
    features: string[];
    optimizations: string[];
}

class DeviceDetector {
    private deviceInfo: DeviceInfo;
    private optimizationClasses: string[] = [];

    constructor() {
        this.deviceInfo = this.detectDevice();
        this.applyOptimizations();
    }

    /**
     * 检测设备信息
     */
    private detectDevice(): DeviceInfo {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const vendor = (navigator as any).vendor || '';

        // 基础设备信息
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const pixelRatio = window.devicePixelRatio || 1;
        const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isHighDPI = pixelRatio >= 2;
        const supportsHover = window.matchMedia('(hover: hover)').matches;
        const supportsTouch = window.matchMedia('(pointer: coarse)').matches;

        // 检测设备类型和品牌
        let type: DeviceInfo['type'] = 'desktop';
        let brand: string | undefined;
        let model: string | undefined;

        // iPhone检测
        if (/iPhone/i.test(userAgent)) {
            type = 'iphone';
            brand = 'Apple';
            model = this.detectiPhoneModel(screenWidth, screenHeight, pixelRatio);
        }
        // iPad检测
        else if (/iPad/i.test(userAgent)) {
            type = 'tablet';
            brand = 'Apple';
            model = this.detectiPadModel(screenWidth, screenHeight, pixelRatio);
        }
        // Android设备检测
        else if (/Android/i.test(userAgent)) {
            if (screenWidth >= 768 || screenHeight >= 768) {
                type = 'tablet';
            } else {
                type = 'android';
            }
            brand = this.detectAndroidBrand(userAgent);
            model = this.detectAndroidModel(userAgent);
        }
        // 其他移动设备
        else if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            type = 'android';
        }

        // 检测性能特征
        const isLowMemory = this.detectLowMemory();
        const isSlowNetwork = this.detectSlowNetwork();
        const isLowBattery = this.detectLowBattery();

        return {
            type,
            brand,
            model,
            screenWidth,
            screenHeight,
            pixelRatio,
            orientation,
            isTouch,
            isHighDPI,
            isLowMemory,
            isSlowNetwork,
            isLowBattery,
            supportsHover,
            supportsTouch,
            userAgent,
            platform,
            vendor
        };
    }

    /**
     * 检测iPhone型号
     */
    private detectiPhoneModel(width: number, height: number, pixelRatio: number): string {
        // iPhone SE (第1代) - 4英寸
        if (width === 320 && height === 568 && pixelRatio === 2) {
            return 'iPhone SE (1st gen)';
        }
        // iPhone 6/7/8 - 4.7英寸
        else if (width === 375 && height === 667 && pixelRatio === 2) {
            return 'iPhone 6/7/8';
        }
        // iPhone 6/7/8 Plus - 5.5英寸
        else if (width === 414 && height === 736 && pixelRatio === 3) {
            return 'iPhone 6/7/8 Plus';
        }
        // iPhone X/XS - 5.8英寸
        else if (width === 375 && height === 812 && pixelRatio === 3) {
            return 'iPhone X/XS';
        }
        // iPhone XR/11 - 6.1英寸
        else if (width === 414 && height === 896 && pixelRatio === 2) {
            return 'iPhone XR/11';
        }
        // iPhone XS Max/11 Pro Max - 6.5英寸
        else if (width === 414 && height === 896 && pixelRatio === 3) {
            return 'iPhone XS Max/11 Pro Max';
        }
        // iPhone 12/13 mini - 5.4英寸
        else if (width === 375 && height === 812 && pixelRatio === 3) {
            return 'iPhone 12/13 mini';
        }
        // iPhone 12/13/14 - 6.1英寸
        else if (width === 390 && height === 844 && pixelRatio === 3) {
            return 'iPhone 12/13/14';
        }
        // iPhone 12/13/14 Pro Max - 6.7英寸
        else if (width === 428 && height === 926 && pixelRatio === 3) {
            return 'iPhone 12/13/14 Pro Max';
        }
        // iPhone 15/15 Pro - 6.1英寸
        else if (width === 393 && height === 852 && pixelRatio === 3) {
            return 'iPhone 15/15 Pro';
        }
        // iPhone 15 Plus/15 Pro Max - 6.7英寸
        else if (width === 430 && height === 932 && pixelRatio === 3) {
            return 'iPhone 15 Plus/15 Pro Max';
        }

        return 'iPhone (Unknown)';
    }

    /**
     * 检测iPad型号
     */
    private detectiPadModel(width: number, height: number, pixelRatio: number): string {
        // iPad (第9代) - 10.2英寸
        if (width === 810 && height === 1080 && pixelRatio === 2) {
            return 'iPad (9th gen)';
        }
        // iPad Air (第4代) - 10.9英寸
        else if (width === 820 && height === 1180 && pixelRatio === 2) {
            return 'iPad Air (4th gen)';
        }
        // iPad Pro 11英寸
        else if (width === 834 && height === 1194 && pixelRatio === 2) {
            return 'iPad Pro 11"';
        }
        // iPad Pro 12.9英寸
        else if (width === 1024 && height === 1366 && pixelRatio === 2) {
            return 'iPad Pro 12.9"';
        }

        return 'iPad (Unknown)';
    }

    /**
     * 检测Android品牌
     */
    private detectAndroidBrand(userAgent: string): string {
        if (/Xiaomi|Redmi|POCO/i.test(userAgent)) {
            return 'Xiaomi';
        } else if (/HUAWEI|Honor/i.test(userAgent)) {
            return 'Huawei';
        } else if (/OPPO|OnePlus/i.test(userAgent)) {
            return 'OPPO';
        } else if (/vivo|iQOO/i.test(userAgent)) {
            return 'vivo';
        } else if (/Samsung/i.test(userAgent)) {
            return 'Samsung';
        } else if (/HTC/i.test(userAgent)) {
            return 'HTC';
        } else if (/Sony/i.test(userAgent)) {
            return 'Sony';
        } else if (/LG/i.test(userAgent)) {
            return 'LG';
        } else if (/Motorola/i.test(userAgent)) {
            return 'Motorola';
        } else if (/Nokia/i.test(userAgent)) {
            return 'Nokia';
        } else if (/Google/i.test(userAgent)) {
            return 'Google';
        }

        return 'Android (Unknown)';
    }

    /**
     * 检测Android型号
     */
    private detectAndroidModel(userAgent: string): string {
        // 提取型号信息
        const modelMatch = userAgent.match(/\(Linux.*?;\s*([^;)]+)/);
        if (modelMatch) {
            return modelMatch[1].trim();
        }

        return 'Android Device';
    }

    /**
     * 检测低内存设备
     */
    private detectLowMemory(): boolean {
        // 检测设备内存（如果支持）
        if ('deviceMemory' in navigator) {
            return (navigator as any).deviceMemory < 2;
        }

        // 基于设备类型推断
        return this.deviceInfo.type === 'iphone' &&
            (this.deviceInfo.model?.includes('SE') ||
                this.deviceInfo.model?.includes('6') ||
                this.deviceInfo.model?.includes('7'));
    }

    /**
     * 检测慢速网络
     */
    private detectSlowNetwork(): boolean {
        // 检测网络连接类型
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            if (connection) {
                return connection.effectiveType === 'slow-2g' ||
                    connection.effectiveType === '2g' ||
                    connection.effectiveType === '3g';
            }
        }

        return false;
    }

    /**
     * 检测低电量模式
     */
    private detectLowBattery(): boolean {
        // 检测电池状态（如果支持）
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                if (battery.level < 0.2) {
                    this.addOptimizationClass('low-battery');
                }
            });
        }

        return false;
    }

    /**
     * 应用设备优化
     */
    private applyOptimizations(): void {
        const { deviceInfo } = this;

        // 基础设备类型优化
        this.addOptimizationClass(`device-${deviceInfo.type}`);
        this.addOptimizationClass(`device-detected-${deviceInfo.type}`);

        // 屏幕尺寸优化
        if (deviceInfo.screenWidth < 375) {
            this.addOptimizationClass('screen-small');
        } else if (deviceInfo.screenWidth < 768) {
            this.addOptimizationClass('screen-medium');
        } else if (deviceInfo.screenWidth < 1024) {
            this.addOptimizationClass('screen-large');
        } else {
            this.addOptimizationClass('screen-extra-large');
        }

        // 像素比优化
        if (deviceInfo.pixelRatio === 1) {
            this.addOptimizationClass('pixel-ratio-1x');
        } else if (deviceInfo.pixelRatio === 2) {
            this.addOptimizationClass('pixel-ratio-2x');
        } else if (deviceInfo.pixelRatio >= 3) {
            this.addOptimizationClass('pixel-ratio-3x');
        }

        // 高DPI优化
        if (deviceInfo.isHighDPI) {
            this.addOptimizationClass('high-dpi');
            if (deviceInfo.pixelRatio >= 3) {
                this.addOptimizationClass('ultra-high-dpi');
            }
        }

        // 方向优化
        this.addOptimizationClass(`${deviceInfo.orientation}-mode`);
        if (deviceInfo.orientation === 'landscape') {
            this.addOptimizationClass('landscape-optimized');
        }

        // 触摸设备优化
        if (deviceInfo.isTouch) {
            this.addOptimizationClass('touch-device');
        } else {
            this.addOptimizationClass('mouse-device');
        }

        // 系统特定优化
        if (deviceInfo.type === 'iphone' || deviceInfo.type === 'tablet') {
            this.addOptimizationClass('ios-optimized');
            this.addOptimizationClass('ios-font-rendering');
            this.addOptimizationClass('ios-scroll');
        } else if (deviceInfo.type === 'android') {
            this.addOptimizationClass('android-optimized');
            this.addOptimizationClass('android-font-rendering');
            this.addOptimizationClass('android-scroll');
        }

        // 品牌特定优化
        if (deviceInfo.brand) {
            const brandClass = `${deviceInfo.brand.toLowerCase()}-optimized`;
            this.addOptimizationClass(brandClass);
        }

        // 性能优化
        if (deviceInfo.isLowMemory) {
            this.addOptimizationClass('low-memory');
        } else {
            this.addOptimizationClass('high-performance');
        }

        if (deviceInfo.isSlowNetwork) {
            this.addOptimizationClass('slow-network');
        }

        // 特殊屏幕比例优化
        const aspectRatio = deviceInfo.screenWidth / deviceInfo.screenHeight;
        if (aspectRatio >= 2.1) {
            this.addOptimizationClass('ultra-wide');
        } else if (aspectRatio >= 1.8) {
            this.addOptimizationClass('tall-screen');
        }

        // 虚拟键盘优化
        if (deviceInfo.screenHeight < 600) {
            this.addOptimizationClass('virtual-keyboard');
        }

        // 设备特定修复
        if (deviceInfo.type === 'iphone') {
            if (deviceInfo.model?.includes('SE')) {
                this.addOptimizationClass('device-fix-iphone-se');
            } else if (deviceInfo.model?.includes('X') || deviceInfo.model?.includes('11') || deviceInfo.model?.includes('12') || deviceInfo.model?.includes('13') || deviceInfo.model?.includes('14') || deviceInfo.model?.includes('15')) {
                this.addOptimizationClass('device-fix-iphone-x');
            }
        } else if (deviceInfo.type === 'android') {
            // Android刘海屏修复
            if (deviceInfo.screenHeight > 2000) {
                this.addOptimizationClass('device-fix-android-notch');
            }
            // Android手势导航修复
            this.addOptimizationClass('device-fix-android-gesture');
        }

        // 应用优化类到body
        this.applyClassesToBody();
    }

    /**
     * 添加优化类
     */
    private addOptimizationClass(className: string): void {
        if (!this.optimizationClasses.includes(className)) {
            this.optimizationClasses.push(className);
        }
    }

    /**
     * 应用类到body元素
     */
    private applyClassesToBody(): void {
        if (typeof document !== 'undefined') {
            const body = document.body;
            this.optimizationClasses.forEach(className => {
                body.classList.add(className);
            });
        }
    }

    /**
     * 获取设备信息
     */
    public getDeviceInfo(): DeviceInfo {
        return { ...this.deviceInfo };
    }

    /**
     * 获取优化信息
     */
    public getOptimizationInfo(): DeviceOptimization {
        return {
            cssClasses: [...this.optimizationClasses],
            features: this.getDeviceFeatures(),
            optimizations: this.getAppliedOptimizations()
        };
    }

    /**
     * 获取设备特性
     */
    private getDeviceFeatures(): string[] {
        const features: string[] = [];
        const { deviceInfo } = this;

        if (deviceInfo.isTouch) features.push('touch');
        if (deviceInfo.isHighDPI) features.push('high-dpi');
        if (deviceInfo.supportsHover) features.push('hover');
        if (deviceInfo.supportsTouch) features.push('coarse-pointer');
        if (deviceInfo.isLowMemory) features.push('low-memory');
        if (deviceInfo.isSlowNetwork) features.push('slow-network');
        if (deviceInfo.isLowBattery) features.push('low-battery');

        return features;
    }

    /**
     * 获取应用的优化
     */
    private getAppliedOptimizations(): string[] {
        return this.optimizationClasses.map(className => {
            switch (className) {
                case 'ios-optimized':
                    return 'iOS系统优化';
                case 'android-optimized':
                    return 'Android系统优化';
                case 'high-dpi':
                    return '高分辨率优化';
                case 'touch-device':
                    return '触摸设备优化';
                case 'low-memory':
                    return '低内存优化';
                case 'slow-network':
                    return '慢速网络优化';
                case 'landscape-optimized':
                    return '横屏优化';
                case 'virtual-keyboard':
                    return '虚拟键盘优化';
                default:
                    return className;
            }
        });
    }

    /**
     * 监听设备变化
     */
    public startMonitoring(): void {
        // 监听屏幕方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.deviceInfo.orientation = window.screen.width > window.screen.height ? 'landscape' : 'portrait';
                this.updateOrientationClasses();
            }, 100);
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.deviceInfo.screenWidth = window.screen.width;
            this.deviceInfo.screenHeight = window.screen.height;
            this.updateScreenClasses();
        });

        // 监听网络变化
        if ('connection' in navigator) {
            (navigator as any).connection?.addEventListener('change', () => {
                this.deviceInfo.isSlowNetwork = this.detectSlowNetwork();
                this.updateNetworkClasses();
            });
        }
    }

    /**
     * 更新方向相关类
     */
    private updateOrientationClasses(): void {
        const body = document.body;
        body.classList.remove('portrait-mode', 'landscape-mode', 'landscape-optimized');

        if (this.deviceInfo.orientation === 'landscape') {
            body.classList.add('landscape-mode', 'landscape-optimized');
        } else {
            body.classList.add('portrait-mode');
        }
    }

    /**
     * 更新屏幕相关类
     */
    private updateScreenClasses(): void {
        const body = document.body;
        body.classList.remove('screen-small', 'screen-medium', 'screen-large', 'screen-extra-large');

        if (this.deviceInfo.screenWidth < 375) {
            body.classList.add('screen-small');
        } else if (this.deviceInfo.screenWidth < 768) {
            body.classList.add('screen-medium');
        } else if (this.deviceInfo.screenWidth < 1024) {
            body.classList.add('screen-large');
        } else {
            body.classList.add('screen-extra-large');
        }
    }

    /**
     * 更新网络相关类
     */
    private updateNetworkClasses(): void {
        const body = document.body;
        body.classList.remove('slow-network');

        if (this.deviceInfo.isSlowNetwork) {
            body.classList.add('slow-network');
        }
    }

    /**
     * 获取设备摘要信息
     */
    public getDeviceSummary(): string {
        const { deviceInfo } = this;
        return `${deviceInfo.brand || 'Unknown'} ${deviceInfo.model || deviceInfo.type} (${deviceInfo.screenWidth}x${deviceInfo.screenHeight}, ${deviceInfo.pixelRatio}x)`;
    }
}

// 创建全局实例
const deviceDetector = new DeviceDetector();

// 导出实例和类型
export default deviceDetector;
export { DeviceDetector };
