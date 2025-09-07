import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Message from '../Message/Message';

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

describe('Message页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染消息页面', () => {
        render(<Message />);

        expect(screen.getByText('消息')).toBeInTheDocument();
        expect(screen.getByText('系统通知')).toBeInTheDocument();
    });

    it('应该显示消息列表', () => {
        render(<Message />);

        expect(screen.getByText('暂无消息')).toBeInTheDocument();
    });

    it('应该处理消息点击', () => {
        render(<Message />);

        // 模拟有消息的情况
        const messageItem = screen.getByText('测试消息');
        if (messageItem) {
            fireEvent.click(messageItem);
            expect(mockNavigate).toHaveBeenCalledWith('/message/detail/1');
        }
    });

    it('应该处理刷新功能', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Message />);

        const refreshButton = screen.getByRole('button', { name: /刷新/i });
        fireEvent.click(refreshButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith('刷新成功');
        });
    });

    it('应该处理消息分类切换', () => {
        render(<Message />);

        const systemTab = screen.getByText('系统通知');
        const personalTab = screen.getByText('个人消息');

        fireEvent.click(personalTab);
        expect(personalTab).toHaveClass('active');

        fireEvent.click(systemTab);
        expect(systemTab).toHaveClass('active');
    });
});
