/**
 * 通知状态管理
 * 管理应用内通知、消息等
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AppNotification {
    id: string
    title: string
    content: string
    type: 'info' | 'success' | 'warning' | 'error' | 'system'
    read: boolean
    createdAt: string
    updatedAt?: string
    data?: Record<string, any>
    actions?: Array<{
        text: string
        action: string
        style?: 'default' | 'primary' | 'danger'
    }>
}

interface NotificationState {
    // 状态
    notifications: AppNotification[]
    unreadCount: number
    maxNotifications: number

    // Actions
    addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    clearAll: () => void
    clearByType: (type: AppNotification['type']) => void

    // Getters
    getUnreadNotifications: () => AppNotification[]
    getNotificationsByType: (type: AppNotification['type']) => AppNotification[]
    getRecentNotifications: (count?: number) => AppNotification[]
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            // 初始状态
            notifications: [],
            unreadCount: 0,
            maxNotifications: 100,

            // Actions
            addNotification: (notificationData) => {
                const notification: AppNotification = {
                    ...notificationData,
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    read: false,
                    createdAt: new Date().toISOString(),
                }

                set((state) => {
                    let notifications = [notification, ...state.notifications]

                    // 限制通知数量
                    if (notifications.length > state.maxNotifications) {
                        notifications = notifications.slice(0, state.maxNotifications)
                    }

                    return {
                        notifications,
                        unreadCount: notifications.filter(n => !n.read).length,
                    }
                })
            },

            markAsRead: (id) => set((state) => {
                const notifications = state.notifications.map(n =>
                    n.id === id ? { ...n, read: true, updatedAt: new Date().toISOString() } : n
                )
                return {
                    notifications,
                    unreadCount: notifications.filter(n => !n.read).length,
                }
            }),

            markAllAsRead: () => set((state) => {
                const now = new Date().toISOString()
                const notifications = state.notifications.map(n => ({
                    ...n,
                    read: true,
                    updatedAt: now
                }))
                return {
                    notifications,
                    unreadCount: 0,
                }
            }),

            removeNotification: (id) => set((state) => {
                const notifications = state.notifications.filter(n => n.id !== id)
                return {
                    notifications,
                    unreadCount: notifications.filter(n => !n.read).length,
                }
            }),

            clearAll: () => set({
                notifications: [],
                unreadCount: 0,
            }),

            clearByType: (type) => set((state) => {
                const notifications = state.notifications.filter(n => n.type !== type)
                return {
                    notifications,
                    unreadCount: notifications.filter(n => !n.read).length,
                }
            }),

            // Getters
            getUnreadNotifications: () => {
                return get().notifications.filter(n => !n.read)
            },

            getNotificationsByType: (type) => {
                return get().notifications.filter(n => n.type === type)
            },

            getRecentNotifications: (count = 10) => {
                return get().notifications
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, count)
            },
        }),
        {
            name: 'notification-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                notifications: state.notifications.slice(0, 50), // 只持久化最近50条
            }),
        }
    )
)
