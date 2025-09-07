/**
 * Store 统一入口
 * 导出所有状态管理store和相关类型
 */

// Auth Store
export { useAuthStore, type User } from './auth/useAuthStore'

// App Store  
export { useAppStore, type Language, type Theme } from './app/useAppStore'

// Notification Store
export { useNotificationStore, type AppNotification } from './notification/useNotificationStore'

// UI Store
export { loading, toast, useUIStore, type ModalState, type ToastMessage } from './ui/useUIStore'

// Task Process Store
export { useTaskProcessStore } from './taskProcess/useTaskProcessStore'
export type { TaskProcessStore } from './taskProcess/useTaskProcessStore'

// Task Process Types
export {
    TaskPriority,
    TaskStatus,
    type Organization,
    type Pagination,
    type ProcessRecord,
    type ProcessStep,
    type TaskDetail,
    type TaskFilter,
    type TaskItem
} from './taskProcess/types'

// Store工具函数
export const resetAllStores = () => {
    // 重置所有store到初始状态（除了持久化的数据）
    useAuthStore.getState().logout()
    useAppStore.getState().resetSettings()
    useNotificationStore.getState().clearAll()
    useUIStore.getState().clearToasts()
}

// Store状态选择器 - 提供更好的性能
export const authSelectors = {
    user: (state: ReturnType<typeof useAuthStore.getState>) => state.user,
    isAuthenticated: (state: ReturnType<typeof useAuthStore.getState>) => state.isAuthenticated,
    token: (state: ReturnType<typeof useAuthStore.getState>) => state.token,
    hasPermission: (permission: string) =>
        (state: ReturnType<typeof useAuthStore.getState>) => state.hasPermission(permission),
}

export const appSelectors = {
    theme: (state: ReturnType<typeof useAppStore.getState>) => state.settings.theme,
    language: (state: ReturnType<typeof useAppStore.getState>) => state.settings.language,
    isOnline: (state: ReturnType<typeof useAppStore.getState>) => state.isOnline,
}

export const notificationSelectors = {
    unreadCount: (state: ReturnType<typeof useNotificationStore.getState>) => state.unreadCount,
    recentNotifications: (state: ReturnType<typeof useNotificationStore.getState>) =>
        state.getRecentNotifications(5),
}

export const uiSelectors = {
    globalLoading: (state: ReturnType<typeof useUIStore.getState>) => state.globalLoading,
    toasts: (state: ReturnType<typeof useUIStore.getState>) => state.toasts,
    isModalOpen: (key: string) =>
        (state: ReturnType<typeof useUIStore.getState>) => state.isModalOpen(key),
}
