import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Profile from '../Profile/Profile';

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

describe('Profile页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染个人资料页面', () => {
        render(<Profile />);

        expect(screen.getByText('个人资料')).toBeInTheDocument();
        expect(screen.getByText('编辑资料')).toBeInTheDocument();
    });

    it('应该显示用户基本信息', () => {
        render(<Profile />);

        expect(screen.getByText('用户名')).toBeInTheDocument();
        expect(screen.getByText('邮箱')).toBeInTheDocument();
        expect(screen.getByText('手机号')).toBeInTheDocument();
    });

    it('应该处理编辑资料按钮点击', () => {
        render(<Profile />);

        const editButton = screen.getByText('编辑资料');
        fireEvent.click(editButton);

        expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
    });

    it('应该处理退出登录', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Profile />);

        const logoutButton = screen.getByText('退出登录');
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith({
                icon: 'success',
                content: '已退出登录',
            });
        });
    });

    it('应该显示设置选项', () => {
        render(<Profile />);

        expect(screen.getByText('账户设置')).toBeInTheDocument();
        expect(screen.getByText('隐私设置')).toBeInTheDocument();
        expect(screen.getByText('通知设置')).toBeInTheDocument();
    });

    it('应该处理设置项点击', () => {
        render(<Profile />);

        const accountSettings = screen.getByText('账户设置');
        fireEvent.click(accountSettings);

        expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
});
