/**
 * 网络测试工具
 * 用于测试网络连接质量、原生桥接功能和弱网环境处理
 */

import { nativeBridge } from './nativeBridge';
import { networkManager } from './networkManager';

export interface NetworkTestResult {
    timestamp: number;
    isOnline: boolean;
    networkQuality: 'excellent' | 'good' | 'poor' | 'none';
    networkType: string;
    signalStrength: number;
    pingTime?: number;
    downloadSpeed?: number;
    uploadSpeed?: number;
    nativeBridgeWorking: boolean;
    errors: string[];
}

export interface BridgeTestResult {
    method: string;
    success: boolean;
    responseTime: number;
    error?: string;
}

class NetworkTester {
    private testResults: NetworkTestResult[] = [];
    private isRunning = false;

    /**
     * 运行完整的网络测试
     */
    async runFullTest(): Promise<NetworkTestResult> {
        if (this.isRunning) {
            throw new Error('网络测试正在进行中');
        }

        this.isRunning = true;
        const startTime = Date.now();
        const errors: string[] = [];

        try {
            console.log('开始网络测试...');

            // 1. 基础网络状态测试
            const networkStatus = await this.testNetworkStatus();

            // 2. 原生桥接功能测试
            const bridgeResults = await this.testNativeBridge();

            // 3. 网络连接质量测试
            const qualityResults = await this.testNetworkQuality();

            const result: NetworkTestResult = {
                timestamp: startTime,
                isOnline: networkStatus.isOnline,
                networkQuality: networkStatus.quality,
                networkType: networkStatus.type,
                signalStrength: networkStatus.strength,
                pingTime: qualityResults.pingTime,
                downloadSpeed: qualityResults.downloadSpeed,
                uploadSpeed: qualityResults.uploadSpeed,
                nativeBridgeWorking: bridgeResults.every(r => r.success),
                errors
            };

            this.testResults.push(result);
            console.log('网络测试完成:', result);

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            errors.push(errorMessage);

            const result: NetworkTestResult = {
                timestamp: startTime,
                isOnline: false,
                networkQuality: 'none',
                networkType: 'unknown',
                signalStrength: 0,
                nativeBridgeWorking: false,
                errors
            };

            this.testResults.push(result);
            throw error;

        } finally {
            this.isRunning = false;
        }
    }

    /**
     * 测试网络状态
     */
    private async testNetworkStatus() {
        try {
            const networkInfo = await nativeBridge.getNetworkStatus({
                timeout: 5000,
                retries: 2
            });

            return {
                isOnline: networkInfo.isConnected,
                quality: networkInfo.quality,
                type: networkInfo.type,
                strength: networkInfo.strength
            };
        } catch (error) {
            console.error('网络状态测试失败:', error);
            throw error;
        }
    }

    /**
     * 测试原生桥接功能
     */
    private async testNativeBridge(): Promise<BridgeTestResult[]> {
        const results: BridgeTestResult[] = [];
        const testMethods = [
            'getDeviceInfo',
            'getNetworkStatus',
            'showToast'
        ];

        for (const method of testMethods) {
            const result = await this.testBridgeMethod(method);
            results.push(result);
        }

        return results;
    }

    /**
     * 测试单个桥接方法
     */
    private async testBridgeMethod(method: string): Promise<BridgeTestResult> {
        const startTime = Date.now();

        try {
            switch (method) {
                case 'getDeviceInfo':
                    await nativeBridge.getDeviceInfo({
                        timeout: 3000,
                        retries: 1
                    });
                    break;

                case 'getNetworkStatus':
                    await nativeBridge.getNetworkStatus({
                        timeout: 3000,
                        retries: 1
                    });
                    break;

                case 'showToast':
                    await nativeBridge.showToast('网络测试中...', 'short', {
                        timeout: 2000,
                        retries: 1
                    });
                    break;

                default:
                    throw new Error(`未知的测试方法: ${method}`);
            }

            return {
                method,
                success: true,
                responseTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                method,
                success: false,
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    }

    /**
     * 测试网络连接质量
     */
    private async testNetworkQuality() {
        const results = {
            pingTime: undefined as number | undefined,
            downloadSpeed: undefined as number | undefined,
            uploadSpeed: undefined as number | undefined
        };

        try {
            // 测试Ping时间
            results.pingTime = await this.testPing();

            // 测试下载速度
            results.downloadSpeed = await this.testDownloadSpeed();

            // 测试上传速度
            results.uploadSpeed = await this.testUploadSpeed();

        } catch (error) {
            console.warn('网络质量测试失败:', error);
        }

        return results;
    }

    /**
     * 测试Ping时间
     */
    private async testPing(): Promise<number> {
        const testUrls = [
            'https://www.baidu.com',
            'https://www.google.com',
            'https://www.github.com'
        ];

        const pingTimes: number[] = [];

        for (const url of testUrls) {
            try {
                const startTime = Date.now();
                const response = await fetch(url, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                const endTime = Date.now();

                if (response.ok || response.type === 'opaque') {
                    pingTimes.push(endTime - startTime);
                }
            } catch (error) {
                console.warn(`Ping测试失败 ${url}:`, error);
            }
        }

        if (pingTimes.length === 0) {
            throw new Error('所有Ping测试都失败了');
        }

        // 返回平均Ping时间
        return Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
    }

    /**
     * 测试下载速度
     */
    private async testDownloadSpeed(): Promise<number> {
        const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB测试文件
        const startTime = Date.now();

        try {
            const response = await fetch(testUrl, {
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error('下载测试失败');
            }

            const data = await response.arrayBuffer();
            const endTime = Date.now();

            const duration = (endTime - startTime) / 1000; // 转换为秒
            const sizeInKB = data.byteLength / 1024;
            const speedInKBps = sizeInKB / duration;

            return Math.round(speedInKBps);

        } catch (error) {
            console.warn('下载速度测试失败:', error);
            throw error;
        }
    }

    /**
     * 测试上传速度
     */
    private async testUploadSpeed(): Promise<number> {
        const testData = new ArrayBuffer(1024); // 1KB测试数据
        const startTime = Date.now();

        try {
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: testData,
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });

            if (!response.ok) {
                throw new Error('上传测试失败');
            }

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000; // 转换为秒
            const sizeInKB = testData.byteLength / 1024;
            const speedInKBps = sizeInKB / duration;

            return Math.round(speedInKBps);

        } catch (error) {
            console.warn('上传速度测试失败:', error);
            throw error;
        }
    }

    /**
     * 模拟弱网环境
     */
    async simulateWeakNetwork(): Promise<void> {
        console.log('模拟弱网环境...');

        // 模拟网络延迟
        await this.simulateNetworkDelay(2000);

        // 模拟网络错误
        await this.simulateNetworkError();

        // 模拟网络超时
        await this.simulateNetworkTimeout();
    }

    /**
     * 模拟网络延迟
     */
    private async simulateNetworkDelay(delay: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }

    /**
     * 模拟网络错误
     */
    private async simulateNetworkError(): Promise<void> {
        try {
            await fetch('https://invalid-url-that-will-fail.com');
        } catch (error) {
            console.log('模拟网络错误:', error);
        }
    }

    /**
     * 模拟网络超时
     */
    private async simulateNetworkTimeout(): Promise<void> {
        try {
            await fetch('https://httpbin.org/delay/10', {
                signal: AbortSignal.timeout(1000) // 1秒超时
            });
        } catch (error) {
            console.log('模拟网络超时:', error);
        }
    }

    /**
     * 测试离线功能
     */
    async testOfflineFunctionality(): Promise<boolean> {
        console.log('测试离线功能...');

        try {
            // 缓存一些测试数据
            await networkManager.cacheData('test_offline_data', {
                id: 1,
                name: '离线测试数据',
                timestamp: Date.now()
            });

            // 获取缓存数据
            const cachedData = networkManager.getCachedData('test_offline_data');

            if (!cachedData) {
                throw new Error('离线缓存功能测试失败');
            }

            console.log('离线功能测试成功');
            return true;

        } catch (error) {
            console.error('离线功能测试失败:', error);
            return false;
        }
    }

    /**
     * 获取测试历史
     */
    getTestHistory(): NetworkTestResult[] {
        return [...this.testResults];
    }

    /**
     * 获取最新的测试结果
     */
    getLatestTestResult(): NetworkTestResult | null {
        if (this.testResults.length === 0) {
            return null;
        }

        return this.testResults[this.testResults.length - 1];
    }

    /**
     * 清除测试历史
     */
    clearTestHistory(): void {
        this.testResults = [];
    }

    /**
     * 生成测试报告
     */
    generateTestReport(): string {
        if (this.testResults.length === 0) {
            return '暂无测试数据';
        }

        const latest = this.getLatestTestResult()!;
        const totalTests = this.testResults.length;
        const successfulTests = this.testResults.filter(r => r.isOnline).length;
        const successRate = Math.round((successfulTests / totalTests) * 100);

        return `
网络测试报告
============

最新测试结果:
- 时间: ${new Date(latest.timestamp).toLocaleString()}
- 在线状态: ${latest.isOnline ? '在线' : '离线'}
- 网络质量: ${latest.networkQuality}
- 网络类型: ${latest.networkType}
- 信号强度: ${latest.signalStrength}%
- 原生桥接: ${latest.nativeBridgeWorking ? '正常' : '异常'}
${latest.pingTime ? `- Ping时间: ${latest.pingTime}ms` : ''}
${latest.downloadSpeed ? `- 下载速度: ${latest.downloadSpeed}KB/s` : ''}
${latest.uploadSpeed ? `- 上传速度: ${latest.uploadSpeed}KB/s` : ''}

历史统计:
- 总测试次数: ${totalTests}
- 成功率: ${successRate}%
- 错误数量: ${latest.errors.length}

${latest.errors.length > 0 ? `错误信息:\n${latest.errors.join('\n')}` : ''}
        `.trim();
    }

    /**
     * 检查是否正在运行测试
     */
    isTestRunning(): boolean {
        return this.isRunning;
    }
}

// 创建单例实例
export const networkTester = new NetworkTester();

// 导出类型
export type { BridgeTestResult, NetworkTester, NetworkTestResult };

