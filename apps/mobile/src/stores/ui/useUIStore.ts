/**
 * UI状态管理
 * 管理全局UI状态，如加载状态、模态框、Toast等
 */

import { create } from 'zustand'

export interface ToastMessage {
    id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    duration?: number
}

export interface ModalState {
    [key: string]: {
        visible: boolean
        data?: any
        props?: Record<string, any>
    }
}

interface UIState {
    // 加载状态
    globalLoading: boolean
    loadingText: string

    // Toast消息
    toasts: ToastMessage[]

    // 模态框状态
    modals: ModalState

    // 底部安全区域
    safeAreaBottom: number

    // 键盘状态
    keyboardVisible: boolean
    keyboardHeight: number

    // 页面状态
    pageLoading: Record<string, boolean>

    // Actions - Loading
    setGlobalLoading: (loading: boolean, text?: string) => void
    setPageLoading: (page: string, loading: boolean) => void

    // Actions - Toast
    showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void
    hideToast: (id: string) => void
    clearToasts: () => void

    // Actions - Modal
    openModal: (key: string, data?: any, props?: Record<string, any>) => void
    closeModal: (key: string) => void
    toggleModal: (key: string) => void
    isModalOpen: (key: string) => boolean
    getModalData: (key: string) => any

    // Actions - Layout
    setSafeAreaBottom: (height: number) => void
    setKeyboardState: (visible: boolean, height?: number) => void
}

export const useUIStore = create<UIState>((set, get) => ({
    // 初始状态
    globalLoading: false,
    loadingText: '加载中...',
    toasts: [],
    modals: {},
    safeAreaBottom: 0,
    keyboardVisible: false,
    keyboardHeight: 0,
    pageLoading: {},

    // Loading Actions
    setGlobalLoading: (globalLoading, loadingText = '加载中...') =>
        set({ globalLoading, loadingText }),

    setPageLoading: (page, loading) => set((state) => ({
        pageLoading: { ...state.pageLoading, [page]: loading }
    })),

    // Toast Actions
    showToast: (message, type = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const toast: ToastMessage = { id, message, type, duration }

        set((state) => ({
            toasts: [...state.toasts, toast]
        }))

        // 自动移除Toast
        if (duration > 0) {
            setTimeout(() => {
                get().hideToast(id)
            }, duration)
        }
    },

    hideToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
    })),

    clearToasts: () => set({ toasts: [] }),

    // Modal Actions
    openModal: (key, data, props) => set((state) => ({
        modals: {
            ...state.modals,
            [key]: { visible: true, data, props }
        }
    })),

    closeModal: (key) => set((state) => ({
        modals: {
            ...state.modals,
            [key]: { ...state.modals[key], visible: false }
        }
    })),

    toggleModal: (key) => set((state) => {
        const currentModal = state.modals[key]
        return {
            modals: {
                ...state.modals,
                [key]: {
                    ...currentModal,
                    visible: !currentModal?.visible
                }
            }
        }
    }),

    isModalOpen: (key) => {
        return !!get().modals[key]?.visible
    },

    getModalData: (key) => {
        return get().modals[key]?.data
    },

    // Layout Actions
    setSafeAreaBottom: (safeAreaBottom) => set({ safeAreaBottom }),

    setKeyboardState: (keyboardVisible, keyboardHeight = 0) =>
        set({ keyboardVisible, keyboardHeight }),
}))

// 全局Toast快捷方法
export const toast = {
    success: (message: string, duration?: number) =>
        useUIStore.getState().showToast(message, 'success', duration),

    error: (message: string, duration?: number) =>
        useUIStore.getState().showToast(message, 'error', duration),

    warning: (message: string, duration?: number) =>
        useUIStore.getState().showToast(message, 'warning', duration),

    info: (message: string, duration?: number) =>
        useUIStore.getState().showToast(message, 'info', duration),
}

// 全局Loading快捷方法
export const loading = {
    show: (text?: string) => useUIStore.getState().setGlobalLoading(true, text),
    hide: () => useUIStore.getState().setGlobalLoading(false),
    showPage: (page: string) => useUIStore.getState().setPageLoading(page, true),
    hidePage: (page: string) => useUIStore.getState().setPageLoading(page, false),
}
