import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Apps from '../Apps/Apps';

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

describe('Apps页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染应用页面', () => {
        render(<Apps />);

        expect(screen.getByText('应用')).toBeInTheDocument();
        expect(screen.getByText('我的应用')).toBeInTheDocument();
    });

    it('应该显示应用列表', () => {
        render(<Apps />);

        expect(screen.getByText('暂无应用')).toBeInTheDocument();
    });

    it('应该处理应用点击', () => {
        render(<Apps />);

        // 模拟有应用的情况
        const appItem = screen.getByText('测试应用');
        if (appItem) {
            fireEvent.click(appItem);
            expect(mockNavigate).toHaveBeenCalledWith('/apps/detail/1');
        }
    });

    it('应该处理搜索功能', async () => {
        render(<Apps />);

        const searchInput = screen.getByPlaceholderText('搜索应用');
        fireEvent.change(searchInput, { target: { value: '测试' } });

        await waitFor(() => {
            expect(searchInput).toHaveValue('测试');
        });
    });

    it('应该处理分类筛选', () => {
        render(<Apps />);

        const categoryButton = screen.getByText('全部');
        fireEvent.click(categoryButton);

        expect(categoryButton).toHaveClass('active');
    });

    it('应该处理刷新功能', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Apps />);

        const refreshButton = screen.getByRole('button', { name: /刷新/i });
        fireEvent.click(refreshButton);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith('刷新成功');
        });
    });

    it('应该处理应用安装', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Apps />);

        const installButton = screen.getByText('安装');
        if (installButton) {
            fireEvent.click(installButton);

            await waitFor(() => {
                expect(mockToastShow).toHaveBeenCalledWith({
                    icon: 'success',
                    content: '应用安装成功',
                });
            });
        }
    });

    it('应该处理应用卸载', async () => {
        const mockToastShow = vi.fn();
        vi.mocked(require('antd-mobile').Toast.show).mockImplementation(mockToastShow);

        render(<Apps />);

        const uninstallButton = screen.getByText('卸载');
        if (uninstallButton) {
            fireEvent.click(uninstallButton);

            await waitFor(() => {
                expect(mockToastShow).toHaveBeenCalledWith({
                    icon: 'success',
                    content: '应用卸载成功',
                });
            });
        }
    });
});
