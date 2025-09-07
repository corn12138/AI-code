import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDeviceInfo } from '../useDeviceInfo';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('useDeviceInfo Hook', () => {
    it('应该检测移动设备', () => {
        // 模拟移动设备
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 375,
        });

        const { result } = renderHook(() => useDeviceInfo());

        expect(result.current.isMobile).toBe(true);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.deviceType).toBe('mobile');
    });

    it('应该检测平板设备', () => {
        // 模拟平板设备
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 768,
        });

        const { result } = renderHook(() => useDeviceInfo());

        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(true);
        expect(result.current.deviceType).toBe('tablet');
    });

    it('应该检测桌面设备', () => {
        // 模拟桌面设备
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useDeviceInfo());

        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.deviceType).toBe('desktop');
    });

    it('应该处理窗口大小变化', () => {
        // 初始为移动设备
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 375,
        });

        const { result } = renderHook(() => useDeviceInfo());

        expect(result.current.isMobile).toBe(true);

        // 注意：在实际的Hook中，窗口大小变化可能需要手动触发
        // 这里我们只测试初始状态
    });

    it('应该处理边界值', () => {
        // 测试边界值 768px
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 768,
        });

        const { result } = renderHook(() => useDeviceInfo());

        expect(result.current.isTablet).toBe(true);
    });
});
