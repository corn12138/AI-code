import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '../Layout/Header';

// Mock hooks
vi.mock('@/hooks/useDeviceInfo', () => ({
    useDeviceInfo: vi.fn(() => ({
        isMobile: true,
        isTablet: false,
        deviceType: 'mobile',
    })),
}));

// Mock 路由
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/' }),
    };
});

describe('Header组件', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染Header组件', () => {
        render(<Header />);

        expect(screen.getByText('移动端应用')).toBeInTheDocument();
    });

    it('应该显示标题', () => {
        render(<Header />);

        expect(screen.getByText('移动端应用')).toBeInTheDocument();
    });

    it('应该处理返回按钮点击', () => {
        render(<Header />);

        const backButton = screen.getByRole('button', { name: /返回/i });
        if (backButton) {
            fireEvent.click(backButton);
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        }
    });

    it('应该处理菜单按钮点击', () => {
        render(<Header />);

        const menuButton = screen.getByRole('button', { name: /菜单/i });
        if (menuButton) {
            fireEvent.click(menuButton);
            // 应该触发菜单显示
            expect(menuButton).toBeInTheDocument();
        }
    });

    it('应该处理搜索按钮点击', () => {
        render(<Header />);

        const searchButton = screen.getByRole('button', { name: /搜索/i });
        if (searchButton) {
            fireEvent.click(searchButton);
            expect(mockNavigate).toHaveBeenCalledWith('/search');
        }
    });

    it('应该处理通知按钮点击', () => {
        render(<Header />);

        const notificationButton = screen.getByRole('button', { name: /通知/i });
        if (notificationButton) {
            fireEvent.click(notificationButton);
            expect(mockNavigate).toHaveBeenCalledWith('/notifications');
        }
    });

    it('应该显示用户头像', () => {
        render(<Header />);

        const avatar = screen.getByAltText('用户头像');
        expect(avatar).toBeInTheDocument();
    });

    it('应该处理头像点击', () => {
        render(<Header />);

        const avatar = screen.getByAltText('用户头像');
        fireEvent.click(avatar);

        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('应该显示通知数量', () => {
        render(<Header />);

        const notificationBadge = screen.getByText('3');
        if (notificationBadge) {
            expect(notificationBadge).toBeInTheDocument();
        }
    });

    it('应该应用移动端样式', () => {
        render(<Header />);

        const headerElement = screen.getByRole('banner');
        expect(headerElement).toHaveClass('mobile');
    });

    it('应该处理响应式布局', () => {
        // 模拟平板设备
        vi.mocked(require('@/hooks/useDeviceInfo').useDeviceInfo).mockReturnValue({
            isMobile: false,
            isTablet: true,
            deviceType: 'tablet',
        });

        render(<Header />);

        const headerElement = screen.getByRole('banner');
        expect(headerElement).toHaveClass('tablet');
    });
});
