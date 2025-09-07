import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userStore } from '../userStore';

// Mock API服务
vi.mock('@/services/user', () => ({
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    getNotifications: vi.fn(),
}));

describe('UserStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 重置store状态
        userStore.setState({
            user: null,
            notifications: [],
            loading: false,
            error: null,
        });
    });

    describe('初始状态', () => {
        it('应该初始化正确的默认状态', () => {
            const state = userStore.getState();

            expect(state.user).toBeNull();
            expect(state.notifications).toEqual([]);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('setUser', () => {
        it('应该正确设置用户信息', () => {
            const mockUser = { id: 1, name: '测试用户', email: 'test@example.com' };

            userStore.getState().setUser(mockUser);

            expect(userStore.getState().user).toEqual(mockUser);
        });

        it('应该清除错误状态', () => {
            // 先设置一个错误
            userStore.getState().setError('测试错误');
            expect(userStore.getState().error).toBe('测试错误');

            // 设置用户信息应该清除错误
            const mockUser = { id: 1, name: '测试用户' };
            userStore.getState().setUser(mockUser);

            expect(userStore.getState().error).toBeNull();
        });
    });

    describe('setLoading', () => {
        it('应该正确设置加载状态', () => {
            userStore.getState().setLoading(true);
            expect(userStore.getState().loading).toBe(true);

            userStore.getState().setLoading(false);
            expect(userStore.getState().loading).toBe(false);
        });
    });

    describe('setError', () => {
        it('应该正确设置错误信息', () => {
            const errorMessage = '测试错误信息';

            userStore.getState().setError(errorMessage);

            expect(userStore.getState().error).toBe(errorMessage);
        });

        it('应该清除错误信息', () => {
            userStore.getState().setError('测试错误');
            expect(userStore.getState().error).toBe('测试错误');

            userStore.getState().setError(null);
            expect(userStore.getState().error).toBeNull();
        });
    });

    describe('setNotifications', () => {
        it('应该正确设置通知列表', () => {
            const mockNotifications = [
                { id: 1, title: '通知1', read: false },
                { id: 2, title: '通知2', read: true },
            ];

            userStore.getState().setNotifications(mockNotifications);

            expect(userStore.getState().notifications).toEqual(mockNotifications);
        });

        it('应该支持空通知列表', () => {
            userStore.getState().setNotifications([]);
            expect(userStore.getState().notifications).toEqual([]);
        });
    });

    describe('addNotification', () => {
        it('应该在列表开头添加新通知', () => {
            const existingNotifications = [
                { id: 1, title: '旧通知', read: false },
            ];

            userStore.getState().setNotifications(existingNotifications);

            const newNotification = { id: 2, title: '新通知', read: false };
            userStore.getState().addNotification(newNotification);

            const currentNotifications = userStore.getState().notifications;
            expect(currentNotifications).toHaveLength(2);
            expect(currentNotifications[0]).toEqual(newNotification);
            expect(currentNotifications[1]).toEqual(existingNotifications[0]);
        });
    });

    describe('markNotificationAsRead', () => {
        it('应该正确标记通知为已读', () => {
            const notifications = [
                { id: 1, title: '通知1', read: false },
                { id: 2, title: '通知2', read: false },
            ];

            userStore.getState().setNotifications(notifications);
            userStore.getState().markNotificationAsRead(1);

            const currentNotifications = userStore.getState().notifications;
            expect(currentNotifications[0].read).toBe(true);
            expect(currentNotifications[1].read).toBe(false);
        });

        it('应该处理不存在的通知ID', () => {
            const notifications = [
                { id: 1, title: '通知1', read: false },
            ];

            userStore.getState().setNotifications(notifications);
            userStore.getState().markNotificationAsRead(999);

            const currentNotifications = userStore.getState().notifications;
            expect(currentNotifications[0].read).toBe(false);
        });
    });

    describe('removeNotification', () => {
        it('应该正确删除指定通知', () => {
            const notifications = [
                { id: 1, title: '通知1', read: false },
                { id: 2, title: '通知2', read: false },
            ];

            userStore.getState().setNotifications(notifications);
            userStore.getState().removeNotification(1);

            const currentNotifications = userStore.getState().notifications;
            expect(currentNotifications).toHaveLength(1);
            expect(currentNotifications[0].id).toBe(2);
        });

        it('应该处理不存在的通知ID', () => {
            const notifications = [
                { id: 1, title: '通知1', read: false },
            ];

            userStore.getState().setNotifications(notifications);
            userStore.getState().removeNotification(999);

            const currentNotifications = userStore.getState().notifications;
            expect(currentNotifications).toHaveLength(1);
        });
    });

    describe('clearNotifications', () => {
        it('应该清空所有通知', () => {
            const notifications = [
                { id: 1, title: '通知1', read: false },
                { id: 2, title: '通知2', read: false },
            ];

            userStore.getState().setNotifications(notifications);
            userStore.getState().clearNotifications();

            expect(userStore.getState().notifications).toEqual([]);
        });
    });

    describe('getUnreadCount', () => {
        it('应该正确计算未读通知数量', () => {
            const notifications = [
                { id: 1, title: '通知1', read: false },
                { id: 2, title: '通知2', read: true },
                { id: 3, title: '通知3', read: false },
            ];

            userStore.getState().setNotifications(notifications);

            const unreadCount = userStore.getState().getUnreadCount();
            expect(unreadCount).toBe(2);
        });

        it('应该在没有通知时返回0', () => {
            userStore.getState().setNotifications([]);

            const unreadCount = userStore.getState().getUnreadCount();
            expect(unreadCount).toBe(0);
        });
    });

    describe('reset', () => {
        it('应该重置store到初始状态', () => {
            // 设置一些状态
            userStore.getState().setUser({ id: 1, name: '测试用户' });
            userStore.getState().setNotifications([{ id: 1, title: '通知', read: false }]);
            userStore.getState().setError('测试错误');
            userStore.getState().setLoading(true);

            // 重置
            userStore.getState().reset();

            const state = userStore.getState();
            expect(state.user).toBeNull();
            expect(state.notifications).toEqual([]);
            expect(state.error).toBeNull();
            expect(state.loading).toBe(false);
        });
    });

    describe('订阅功能', () => {
        it('应该在状态变化时通知订阅者', () => {
            const mockSubscriber = vi.fn();
            const unsubscribe = userStore.subscribe(mockSubscriber);

            userStore.getState().setUser({ id: 1, name: '测试用户' });

            expect(mockSubscriber).toHaveBeenCalled();

            unsubscribe();
        });

        it('应该支持取消订阅', () => {
            const mockSubscriber = vi.fn();
            const unsubscribe = userStore.subscribe(mockSubscriber);

            unsubscribe();

            userStore.getState().setUser({ id: 1, name: '测试用户' });

            expect(mockSubscriber).toHaveBeenCalledTimes(0);
        });
    });
});
