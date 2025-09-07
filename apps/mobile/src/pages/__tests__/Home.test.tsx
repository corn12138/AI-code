import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../Home/Home';

// Mock hooks
vi.mock('@/hooks/useDeviceInfo', () => ({
    useDeviceInfo: vi.fn(() => ({
        isMobile: true,
        isTablet: false,
        deviceType: 'mobile',
    })),
}));

// Mock nativeBridge
vi.mock('@/utils/nativeBridge', () => ({
    default: {
        getDeviceInfo: vi.fn(),
        isNative: false,
        showToast: vi.fn(),
        showAlert: vi.fn(),
        showConfirm: vi.fn(),
        setStorage: vi.fn(),
        getStorage: vi.fn(),
        getNetworkStatus: vi.fn(),
    },
}));

// Mock 路由
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Home页面', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正确渲染页面标题', () => {
        render(<Home />);
        expect(screen.getByText('欢迎使用工作台')).toBeInTheDocument();
    });

    it('应该显示环境信息', async () => {
        render(<Home />);
        await waitFor(() => {
            expect(screen.getByText('运行环境')).toBeInTheDocument();
        });
    });

    it('应该渲染功能卡片', () => {
        render(<Home />);

        expect(screen.getByText('调试工具')).toBeInTheDocument();
        expect(screen.getByText('原生功能测试')).toBeInTheDocument();
        expect(screen.getByText('快捷入口')).toBeInTheDocument();
    });

    it('应该处理Toast测试按钮点击', async () => {
        const mockShowToast = vi.fn();
        vi.mocked(require('@/utils/nativeBridge').default.showToast).mockImplementation(mockShowToast);

        render(<Home />);

        const toastButton = screen.getByText('Toast 消息');
        fireEvent.click(toastButton);

        expect(mockShowToast).toHaveBeenCalled();
    });

    it('应该处理Alert测试按钮点击', async () => {
        const mockShowAlert = vi.fn().mockResolvedValue(undefined);
        vi.mocked(require('@/utils/nativeBridge').default.showAlert).mockImplementation(mockShowAlert);

        render(<Home />);

        const alertButton = screen.getByText('Alert 弹窗');
        fireEvent.click(alertButton);

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith('原生弹窗', '这是通过原生Bridge调用的弹窗');
        });
    });

    it('应该处理存储测试按钮点击', async () => {
        const mockSetStorage = vi.fn().mockResolvedValue(undefined);
        const mockGetStorage = vi.fn().mockResolvedValue({ message: 'Hello from H5', timestamp: Date.now() });
        const mockShowToast = vi.fn();

        vi.mocked(require('@/utils/nativeBridge').default.setStorage).mockImplementation(mockSetStorage);
        vi.mocked(require('@/utils/nativeBridge').default.getStorage).mockImplementation(mockGetStorage);
        vi.mocked(require('@/utils/nativeBridge').default.showToast).mockImplementation(mockShowToast);

        render(<Home />);

        const storageButton = screen.getByText('存储测试');
        fireEvent.click(storageButton);

        await waitFor(() => {
            expect(mockSetStorage).toHaveBeenCalled();
            expect(mockGetStorage).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalled();
        });
    });

    it('应该处理网络状态测试按钮点击', async () => {
        const mockGetNetworkStatus = vi.fn().mockResolvedValue({ isConnected: true, connectionType: 'wifi' });
        const mockShowToast = vi.fn();

        vi.mocked(require('@/utils/nativeBridge').default.getNetworkStatus).mockImplementation(mockGetNetworkStatus);
        vi.mocked(require('@/utils/nativeBridge').default.showToast).mockImplementation(mockShowToast);

        render(<Home />);

        const networkButton = screen.getByText('网络状态');
        fireEvent.click(networkButton);

        await waitFor(() => {
            expect(mockGetNetworkStatus).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalled();
        });
    });

    it('应该显示设备信息', async () => {
        const mockGetDeviceInfo = vi.fn().mockResolvedValue({
            platform: 'ios',
            version: '15.0',
            model: 'iPhone 13',
            appVersion: '1.0.0'
        });

        vi.mocked(require('@/utils/nativeBridge').default.getDeviceInfo).mockImplementation(mockGetDeviceInfo);

        render(<Home />);

        await waitFor(() => {
            expect(mockGetDeviceInfo).toHaveBeenCalled();
        });
    });

    it('应该处理设备信息获取失败', async () => {
        const mockGetDeviceInfo = vi.fn().mockRejectedValue(new Error('Failed to get device info'));

        vi.mocked(require('@/utils/nativeBridge').default.getDeviceInfo).mockImplementation(mockGetDeviceInfo);

        render(<Home />);

        await waitFor(() => {
            expect(mockGetDeviceInfo).toHaveBeenCalled();
        });
    });

    it('应该显示快捷入口', () => {
        render(<Home />);

        expect(screen.getByText('数据看板')).toBeInTheDocument();
        expect(screen.getByText('任务管理')).toBeInTheDocument();
        expect(screen.getByText('团队协作')).toBeInTheDocument();
        expect(screen.getByText('业绩统计')).toBeInTheDocument();
        expect(screen.getByText('系统设置')).toBeInTheDocument();
        expect(screen.getByText('帮助中心')).toBeInTheDocument();
    });
});
