import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../auth/useAuthStore';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

describe('useAuthStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 重置store状态 - 使用logout而不是reset
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.logout();
        });
    });

    describe('初始状态', () => {
        it('应该返回正确的初始状态', () => {
            const { result } = renderHook(() => useAuthStore());

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBeNull();
            expect(result.current.isLoading).toBe(false);
            expect(result.current.token).toBeNull();
        });
    });

    describe('登录功能', () => {
        it('应该成功登录', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                permissions: ['read']
            };
            const mockToken = 'mock-token';

            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.login(mockUser, mockToken);
            });

            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.token).toBe(mockToken);
        });

        it('应该处理登录状态变化', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                permissions: ['read']
            };

            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setUser(mockUser);
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isAuthenticated).toBe(false); // 没有token

            act(() => {
                result.current.setToken('mock-token');
            });

            expect(result.current.isAuthenticated).toBe(true);
        });
    });

    describe('登出功能', () => {
        it('应该成功登出', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                permissions: ['read']
            };

            const { result } = renderHook(() => useAuthStore());

            // 先登录
            act(() => {
                result.current.login(mockUser, 'mock-token');
            });

            expect(result.current.isAuthenticated).toBe(true);

            // 然后登出
            act(() => {
                result.current.logout();
            });

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBeNull();
            expect(result.current.isLoading).toBe(false);
            expect(result.current.token).toBeNull();
        });
    });

    describe('用户信息更新', () => {
        it('应该更新用户信息', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                permissions: ['read']
            };

            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setUser(mockUser);
            });

            act(() => {
                result.current.updateProfile({ username: 'updateduser' });
            });

            expect(result.current.user?.username).toBe('updateduser');
        });

        it('应该处理空用户更新', () => {
            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.updateProfile({ username: 'updateduser' });
            });

            expect(result.current.user).toBeNull();
        });
    });

    describe('权限检查', () => {
        it('应该检查用户权限', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin',
                permissions: ['read', 'write', 'delete']
            };

            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setUser(mockUser);
            });

            expect(result.current.hasPermission('read')).toBe(true);
            expect(result.current.hasPermission('write')).toBe(true);
            expect(result.current.hasPermission('delete')).toBe(true);
            expect(result.current.hasPermission('admin')).toBe(false);
        });

        it('应该检查用户角色', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin',
                permissions: ['read']
            };

            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setUser(mockUser);
            });

            expect(result.current.isRole('admin')).toBe(true);
            expect(result.current.isRole('user')).toBe(false);
        });

        it('应该处理无用户状态', () => {
            const { result } = renderHook(() => useAuthStore());

            expect(result.current.hasPermission('read')).toBe(false);
            expect(result.current.isRole('admin')).toBe(false);
        });
    });

    describe('加载状态', () => {
        it('应该设置加载状态', () => {
            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('Token管理', () => {
        it('应该设置token', () => {
            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setToken('new-token');
            });

            expect(result.current.token).toBe('new-token');
        });

        it('应该设置refresh token', () => {
            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setRefreshToken('refresh-token');
            });

            expect(result.current.refreshToken).toBe('refresh-token');
        });

        it('应该清除token', () => {
            const { result } = renderHook(() => useAuthStore());

            act(() => {
                result.current.setToken('test-token');
            });

            expect(result.current.token).toBe('test-token');

            act(() => {
                result.current.setToken(null);
            });

            expect(result.current.token).toBeNull();
        });
    });

    describe('认证状态逻辑', () => {
        it('应该正确计算认证状态', () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                permissions: ['read']
            };

            const { result } = renderHook(() => useAuthStore());

            // 只有用户，没有token
            act(() => {
                result.current.setUser(mockUser);
            });
            expect(result.current.isAuthenticated).toBe(false);

            // 只有token，没有用户
            act(() => {
                result.current.setUser(null);
                result.current.setToken('token');
            });
            expect(result.current.isAuthenticated).toBe(false);

            // 用户和token都有
            act(() => {
                result.current.setUser(mockUser);
                result.current.setToken('token');
            });
            expect(result.current.isAuthenticated).toBe(true);
        });
    });
});
