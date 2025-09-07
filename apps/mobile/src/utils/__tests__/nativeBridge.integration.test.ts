import { beforeEach, describe, expect, it, vi } from 'vitest';

// 模拟原生环境
const mockNativeEnvironment = () => {
    const mockWindow = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0',
        screen: {
            width: 375,
            height: 812
        },
        devicePixelRatio: 3,
        onLine: true,
        NativeBridge: {
            getDeviceInfo: vi.fn(),
            getNetworkStatus: vi.fn(),
            openCamera: vi.fn(),
            pickImage: vi.fn(),
            showToast: vi.fn(),
            getStorage: vi.fn(),
            setStorage: vi.fn(),
            callback: vi.fn()
        },
        webkit: {
            messageHandlers: {
                NativeBridge: {
                    postMessage: vi.fn()
                }
            }
        }
    };

    Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true
    });

    return mockWindow;
};

describe('NativeBridge Integration Tests', () => {
    let mockWindow: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockWindow = mockNativeEnvironment();
    });

    describe('Platform Detection Integration', () => {
        it('should correctly detect iOS platform in native environment', () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            // 重新创建nativeBridge实例以触发平台检测
            const { nativeBridge: newBridge } = require('../nativeBridge');

            expect(newBridge.getPlatform()).toBe('ios');
            expect(newBridge.isNativeEnvironment()).toBe(true);
        });

        it('should correctly detect Android platform in native environment', () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            expect(newBridge.getPlatform()).toBe('android');
            expect(newBridge.isNativeEnvironment()).toBe(true);
        });

        it('should fallback to web platform when not in native app', () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            expect(newBridge.getPlatform()).toBe('web');
            expect(newBridge.isNativeEnvironment()).toBe(false);
        });
    });

    describe('Device Info Integration', () => {
        it('should return native device info when in iOS environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            const mockDeviceInfo = {
                platform: 'ios',
                version: '14.0',
                model: 'iPhone',
                brand: 'Apple',
                screenWidth: 375,
                screenHeight: 812,
                density: 3
            };

            // 模拟原生回调
            mockWindow.NativeBridge.getDeviceInfo.mockImplementation((callbackId) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true,
                        data: JSON.stringify(mockDeviceInfo)
                    }));
                }, 0);
            });

            const deviceInfo = await newBridge.getDeviceInfo();

            expect(deviceInfo).toEqual(mockDeviceInfo);
            expect(mockWindow.NativeBridge.getDeviceInfo).toHaveBeenCalled();
        });

        it('should return web device info when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            const deviceInfo = await newBridge.getDeviceInfo();

            expect(deviceInfo).toEqual({
                platform: 'web',
                version: mockWindow.userAgent,
                model: 'Web Browser',
                brand: 'Web',
                screenWidth: 375,
                screenHeight: 812,
                density: 3
            });
        });
    });

    describe('Network Status Integration', () => {
        it('should return native network info when in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            const mockNetworkInfo = {
                isConnected: true,
                type: 'wifi',
                strength: 80
            };

            mockWindow.NativeBridge.getNetworkStatus.mockImplementation((callbackId) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true,
                        data: JSON.stringify(mockNetworkInfo)
                    }));
                }, 0);
            });

            const networkInfo = await newBridge.getNetworkStatus();

            expect(networkInfo).toEqual(mockNetworkInfo);
            expect(mockWindow.NativeBridge.getNetworkStatus).toHaveBeenCalled();
        });

        it('should return web network info when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            const networkInfo = await newBridge.getNetworkStatus();

            expect(networkInfo).toEqual({
                isConnected: true,
                type: 'web',
                strength: 100
            });
        });
    });

    describe('Camera Integration', () => {
        it('should call native camera when in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            const mockImagePath = '/path/to/image.jpg';

            mockWindow.NativeBridge.openCamera.mockImplementation((callbackId) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true,
                        data: mockImagePath
                    }));
                }, 0);
            });

            const imagePath = await newBridge.openCamera();

            expect(imagePath).toBe(mockImagePath);
            expect(mockWindow.NativeBridge.openCamera).toHaveBeenCalled();
        });

        it('should throw error when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            await expect(newBridge.openCamera()).rejects.toThrow('Web环境不支持相机功能');
        });
    });

    describe('Image Picker Integration', () => {
        it('should call native image picker when in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            const mockImagePaths = ['/path/to/image1.jpg', '/path/to/image2.jpg'];

            mockWindow.NativeBridge.pickImage.mockImplementation((callbackId, maxCount) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true,
                        data: mockImagePaths
                    }));
                }, 0);
            });

            const imagePaths = await newBridge.pickImage(2);

            expect(imagePaths).toEqual(mockImagePaths);
            expect(mockWindow.NativeBridge.pickImage).toHaveBeenCalledWith(expect.any(String), 2);
        });

        it('should throw error when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            await expect(newBridge.pickImage()).rejects.toThrow('Web环境不支持图片选择功能');
        });
    });

    describe('Storage Integration', () => {
        it('should use native storage when in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            // 模拟原生存储
            mockWindow.NativeBridge.getStorage.mockImplementation((callbackId, key) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true,
                        data: 'test-value'
                    }));
                }, 0);
            });

            mockWindow.NativeBridge.setStorage.mockImplementation((callbackId, key, value) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true
                    }));
                }, 0);
            });

            // 测试获取存储
            const value = await newBridge.getStorage('test-key');
            expect(value).toBe('test-value');
            expect(mockWindow.NativeBridge.getStorage).toHaveBeenCalledWith(expect.any(String), 'test-key');

            // 测试设置存储
            await newBridge.setStorage('test-key', 'test-value');
            expect(mockWindow.NativeBridge.setStorage).toHaveBeenCalledWith(expect.any(String), 'test-key', 'test-value');
        });

        it('should use localStorage when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            // 模拟localStorage
            const localStorageMock = {
                getItem: vi.fn(),
                setItem: vi.fn()
            };
            Object.defineProperty(mockWindow, 'localStorage', {
                value: localStorageMock,
                writable: true
            });

            const { nativeBridge: newBridge } = require('../nativeBridge');

            // 测试获取存储
            localStorageMock.getItem.mockReturnValue('test-value');
            const value = await newBridge.getStorage('test-key');
            expect(value).toBe('test-value');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');

            // 测试设置存储
            await newBridge.setStorage('test-key', 'test-value');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'test-value');
        });
    });

    describe('Toast Integration', () => {
        it('should call native toast when in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            mockWindow.NativeBridge.showToast.mockImplementation((callbackId, message, duration) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: true
                    }));
                }, 0);
            });

            await newBridge.showToast('Test message', 'long');

            expect(mockWindow.NativeBridge.showToast).toHaveBeenCalledWith(expect.any(String), 'Test message', 'long');
        });

        it('should use alert when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const alertSpy = vi.spyOn(mockWindow, 'alert').mockImplementation(() => { });

            const { nativeBridge: newBridge } = require('../nativeBridge');

            await newBridge.showToast('Test message');

            expect(alertSpy).toHaveBeenCalledWith('Test message');
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle native callback errors', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            mockWindow.NativeBridge.getDeviceInfo.mockImplementation((callbackId) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback(JSON.stringify({
                        callbackId,
                        success: false,
                        error: '设备信息获取失败'
                    }));
                }, 0);
            });

            await expect(newBridge.getDeviceInfo()).rejects.toThrow('设备信息获取失败');
        });

        it('should handle JSON parsing errors', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            mockWindow.NativeBridge.getDeviceInfo.mockImplementation((callbackId) => {
                setTimeout(() => {
                    mockWindow.NativeBridge.callback('invalid-json');
                }, 0);
            });

            await expect(newBridge.getDeviceInfo()).rejects.toThrow();
        });
    });
});
