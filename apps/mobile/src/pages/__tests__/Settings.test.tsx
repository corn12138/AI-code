import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Settings from '../Settings/Settings';

// Mock hooks
vi.mock('@/hooks/useDeviceInfo', () => ({
    useDeviceInfo: vi.fn(() => ({
        isMobile: true,
        isTablet: false,
        deviceType: 'mobile',
    })),
}));

// Mock Toast
vi.mock('antd-mobile', async () => {
    const actual = await vi.importActual('antd-mobile');
    return {
        ...actual,
        Toast: {
            show: vi.fn(),
        },
    };
});

// Mock 路由
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Settings页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染设置页面', () => {
        render(<Settings />);

        expect(screen.getByText('设置')).toBeInTheDocument();
        expect(screen.getByText('系统设置')).toBeInTheDocument();
    });

    it('应该显示设置选项', () => {
        render(<Settings />);

        expect(screen.getByText('账户设置')).toBeInTheDocument();
        expect(screen.getByText('隐私设置')).toBeInTheDocument();
        expect(screen.getByText('通知设置')).toBeInTheDocument();
        expect(screen.getByText('主题设置')).toBeInTheDocument();
        expect(screen.getByText('语言设置')).toBeInTheDocument();
    });

    it('应该处理账户设置点击', () => {
        render(<Settings />);

        const accountSettings = screen.getByText('账户设置');
        fireEvent.click(accountSettings);

        expect(mockNavigate).toHaveBeenCalledWith('/settings/account');
    });

    it('应该处理隐私设置点击', () => {
        render(<Settings />);

        const privacySettings = screen.getByText('隐私设置');
        fireEvent.click(privacySettings);

        expect(mockNavigate).toHaveBeenCalledWith('/settings/privacy');
    });

    it('应该处理通知设置切换', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Settings />);

        const notificationToggle = screen.getByRole('switch');
        fireEvent.click(notificationToggle);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith('通知设置已更新');
        });
    });

    it('应该处理主题切换', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Settings />);

        const themeToggle = screen.getByText('深色模式');
        fireEvent.click(themeToggle);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith('主题已切换');
        });
    });

    it('应该处理语言设置', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Settings />);

        const languageButton = screen.getByText('简体中文');
        fireEvent.click(languageButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith('语言设置已更新');
        });
    });

    it('应该处理清除缓存', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Settings />);

        const clearCacheButton = screen.getByText('清除缓存');
        fireEvent.click(clearCacheButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith({
                icon: 'success',
                content: '缓存已清除',
            });
        });
    });

    it('应该处理关于我们', () => {
        render(<Settings />);

        const aboutButton = screen.getByText('关于我们');
        fireEvent.click(aboutButton);

        expect(mockNavigate).toHaveBeenCalledWith('/settings/about');
    });

    it('应该处理帮助中心', () => {
        render(<Settings />);

        const helpButton = screen.getByText('帮助中心');
        fireEvent.click(helpButton);

        expect(mockNavigate).toHaveBeenCalledWith('/settings/help');
    });

    it('应该处理意见反馈', () => {
        render(<Settings />);

        const feedbackButton = screen.getByText('意见反馈');
        fireEvent.click(feedbackButton);

        expect(mockNavigate).toHaveBeenCalledWith('/settings/feedback');
    });
});
