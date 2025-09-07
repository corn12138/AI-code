import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window object
const mockWindow = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0',
    screen: {
        width: 375,
        height: 812
    },
    devicePixelRatio: 3,
    onLine: true,
    NativeBridge: {},
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

describe('NativeBridge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window object
        Object.assign(mockWindow, {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0',
            screen: {
                width: 375,
                height: 812
            },
            devicePixelRatio: 3,
            onLine: true,
            NativeBridge: {},
            webkit: {
                messageHandlers: {
                    NativeBridge: {
                        postMessage: vi.fn()
                    }
                }
            }
        });
    });

    describe('Platform Detection', () => {
        it('should detect iOS platform correctly', () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            // Recreate nativeBridge to trigger platform detection
            const { nativeBridge: newBridge } = require('../nativeBridge');

            expect(newBridge.getPlatform()).toBe('ios');
            expect(newBridge.isNativeEnvironment()).toBe(true);
        });

        it('should detect Android platform correctly', () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 WorkbenchApp/1.0.0';

            // Recreate nativeBridge to trigger platform detection
            const { nativeBridge: newBridge } = require('../nativeBridge');

            expect(newBridge.getPlatform()).toBe('android');
            expect(newBridge.isNativeEnvironment()).toBe(true);
        });

        it('should detect web platform when not in native app', () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            // Recreate nativeBridge to trigger platform detection
            const { nativeBridge: newBridge } = require('../nativeBridge');

            expect(newBridge.getPlatform()).toBe('web');
            expect(newBridge.isNativeEnvironment()).toBe(false);
        });
    });

    describe('Device Info', () => {
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

        it('should call native method when in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 WorkbenchApp/1.0.0';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            // Mock the native callback
            const mockDeviceInfo = {
                platform: 'ios',
                version: '14.0',
                model: 'iPhone',
                brand: 'Apple',
                screenWidth: 375,
                screenHeight: 812,
                density: 3
            };

            mockWindow.NativeBridge.getDeviceInfo = vi.fn().mockImplementation((callbackId) => {
                // Simulate native callback
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
    });

    describe('Network Status', () => {
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

    describe('Storage Operations', () => {
        it('should use localStorage when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            // Mock localStorage
            const localStorageMock = {
                getItem: vi.fn(),
                setItem: vi.fn()
            };
            Object.defineProperty(mockWindow, 'localStorage', {
                value: localStorageMock,
                writable: true
            });

            const { nativeBridge: newBridge } = require('../nativeBridge');

            // Test getStorage
            localStorageMock.getItem.mockReturnValue('test-value');
            const value = await newBridge.getStorage('test-key');
            expect(value).toBe('test-value');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');

            // Test setStorage
            await newBridge.setStorage('test-key', 'test-value');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'test-value');
        });
    });

    describe('Toast Messages', () => {
        it('should use alert when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const alertSpy = vi.spyOn(mockWindow, 'alert').mockImplementation(() => { });

            const { nativeBridge: newBridge } = require('../nativeBridge');

            await newBridge.showToast('Test message');

            expect(alertSpy).toHaveBeenCalledWith('Test message');
        });
    });

    describe('Camera and Image Picker', () => {
        it('should throw error when not in native environment', async () => {
            mockWindow.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';

            const { nativeBridge: newBridge } = require('../nativeBridge');

            await expect(newBridge.openCamera()).rejects.toThrow('Web环境不支持相机功能');
            await expect(newBridge.pickImage()).rejects.toThrow('Web环境不支持图片选择功能');
        });
    });
});
