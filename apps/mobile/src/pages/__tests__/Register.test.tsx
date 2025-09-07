import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from '../Auth/Register';

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

describe('Register页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染注册页面', () => {
        render(<Register />);

        expect(screen.getByText('创建账户')).toBeInTheDocument();
        expect(screen.getByText('请填写以下信息完成注册')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
    });

    it('应该显示注册表单', () => {
        render(<Register />);

        expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('请输入邮箱')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('请确认密码')).toBeInTheDocument();
    });

    it('应该处理注册表单提交', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Register />);

        const usernameInput = screen.getByPlaceholderText('请输入用户名');
        const emailInput = screen.getByPlaceholderText('请输入邮箱');
        const passwordInput = screen.getByPlaceholderText('请输入密码');
        const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith({
                icon: 'success',
                content: '注册成功',
            });
        });
    });

    it('应该处理返回登录功能', () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Register />);

        const backToLoginLink = screen.getByText('已有账户？返回登录');
        fireEvent.click(backToLoginLink);

        expect(mockToastShow).toHaveBeenCalledWith('返回登录功能待开发');
    });

    it('应该验证密码一致性', async () => {
        render(<Register />);

        const passwordInput = screen.getByPlaceholderText('请输入密码');
        const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
        fireEvent.click(submitButton);

        // 应该显示密码不一致的错误信息
        await waitFor(() => {
            expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
        });
    });

    it('应该显示加载状态', async () => {
        render(<Register />);

        const submitButton = screen.getByRole('button', { name: '注册' });
        const usernameInput = screen.getByPlaceholderText('请输入用户名');
        const emailInput = screen.getByPlaceholderText('请输入邮箱');
        const passwordInput = screen.getByPlaceholderText('请输入密码');
        const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // 检查按钮是否显示加载状态
        expect(submitButton).toHaveAttribute('loading');
    });
});
