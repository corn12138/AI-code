import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../useAuth';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock API服务
vi.mock('@/services/auth', () => ({
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
}));

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('应该初始化未登录状态', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('应该从localStorage恢复登录状态', () => {
        const mockUser = { id: 1, name: '测试用户' };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
    });

    it('应该处理登录成功', async () => {
        const mockUser = { id: 1, name: '测试用户' };
        const { login } = await import('@/services/auth');
        (login as any).mockResolvedValue({ data: mockUser, token: 'mock-token' });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });

    it('应该处理登录失败', async () => {
        const { login } = await import('@/services/auth');
        (login as any).mockRejectedValue(new Error('登录失败'));

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            try {
                await result.current.login('test@example.com', 'wrong-password');
            } catch (error) {
                // 预期会抛出错误
            }
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeTruthy();
    });

    it('应该处理登出', async () => {
        const { logout } = await import('@/services/auth');
        (logout as any).mockResolvedValue({});

        const { result } = renderHook(() => useAuth());

        // 先设置登录状态
        act(() => {
            result.current.setUser({ id: 1, name: '测试用户' });
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('应该处理加载状态', async () => {
        const { login } = await import('@/services/auth');
        (login as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        const { result } = renderHook(() => useAuth());

        act(() => {
            result.current.login('test@example.com', 'password');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
        });

        expect(result.current.loading).toBe(false);
    });
});
