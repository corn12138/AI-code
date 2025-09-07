import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from '../Layout/Layout';

// Mock hooks
vi.mock('@/hooks/useDeviceInfo', () => ({
    useDeviceInfo: vi.fn(() => ({
        isMobile: true,
        isTablet: false,
        deviceType: 'mobile',
    })),
}));

// Mock 路由
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Outlet: () => <div data-testid="outlet">页面内容</div>,
    };
});

describe('Layout组件', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染布局组件', () => {
        render(<Layout />);

        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('应该显示页面内容', () => {
        render(<Layout />);

        expect(screen.getByText('页面内容')).toBeInTheDocument();
    });

    it('应该应用移动端样式', () => {
        render(<Layout />);

        const layoutElement = screen.getByTestId('outlet').parentElement;
        expect(layoutElement).toHaveClass('mobile');
    });

    it('应该处理响应式布局', () => {
        // 模拟平板设备
        vi.mocked(require('@/hooks/useDeviceInfo').useDeviceInfo).mockReturnValue({
            isMobile: false,
            isTablet: true,
            deviceType: 'tablet',
        });

        render(<Layout />);

        const layoutElement = screen.getByTestId('outlet').parentElement;
        expect(layoutElement).toHaveClass('tablet');
    });
});
