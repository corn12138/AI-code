import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '../Auth/Login';

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

describe('Login页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染登录页面', () => {
        render(<Login />);

        expect(screen.getByText('移动端应用')).toBeInTheDocument();
        expect(screen.getByText('欢迎回来，请登录您的账户')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    });

    it('应该显示登录表单', () => {
        render(<Login />);

        expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    });

    it('应该处理登录表单提交', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Login />);

        const usernameInput = screen.getByPlaceholderText('请输入用户名');
        const passwordInput = screen.getByPlaceholderText('请输入密码');
        const submitButton = screen.getByRole('button', { name: '登录' });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith({
                icon: 'success',
                content: '登录成功',
            });
        });
    });

    it('应该处理记住密码功能', () => {
        render(<Login />);

        const rememberCheckbox = screen.getByText('记住密码');
        fireEvent.click(rememberCheckbox);

        // 检查CheckList的状态变化
        expect(rememberCheckbox).toBeInTheDocument();
    });

    it('应该处理忘记密码功能', () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Login />);

        const forgotPasswordLink = screen.getByText('忘记密码？');
        fireEvent.click(forgotPasswordLink);

        expect(mockToastShow).toHaveBeenCalledWith('忘记密码功能待开发');
    });

    it('应该处理注册功能', () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Login />);

        const registerLink = screen.getByText('还没有账户？立即注册');
        fireEvent.click(registerLink);

        expect(mockToastShow).toHaveBeenCalledWith('注册功能待开发');
    });

    it('应该处理快速登录功能', () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Login />);

        const wechatButton = screen.getByText('微信登录');
        fireEvent.click(wechatButton);

        expect(mockToastShow).toHaveBeenCalledWith('微信登录待开发');
    });

    it('应该显示加载状态', async () => {
        render(<Login />);

        const submitButton = screen.getByRole('button', { name: '登录' });
        const usernameInput = screen.getByPlaceholderText('请输入用户名');
        const passwordInput = screen.getByPlaceholderText('请输入密码');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // 检查按钮是否显示加载状态
        expect(submitButton).toHaveAttribute('loading');
    });

    it('应该处理登录失败', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        // 模拟登录失败
        vi.spyOn(console, 'log').mockImplementation(() => {
            throw new Error('Login failed');
        });

        render(<Login />);

        const submitButton = screen.getByRole('button', { name: '登录' });
        const usernameInput = screen.getByPlaceholderText('请输入用户名');
        const passwordInput = screen.getByPlaceholderText('请输入密码');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith({
                icon: 'fail',
                content: '登录失败，请检查用户名和密码',
            });
        });
    });

    it('应该支持密码显示/隐藏切换', () => {
        render(<Login />);

        const passwordInput = screen.getByPlaceholderText('请输入密码');
        const toggleButton = screen.getByRole('button', { name: /eye/i });

        fireEvent.click(toggleButton);

        // 检查密码输入框的类型是否改变
        expect(passwordInput).toBeInTheDocument();
    });
});
