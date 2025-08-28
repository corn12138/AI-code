/**
 * 应用状态管理
 * 管理应用级别的配置和状态
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'zh-CN' | 'en-US'

interface AppSettings {
    theme: Theme
    language: Language
    notifications: boolean
    sounds: boolean
    autoPlay: boolean
    fontSize: 'small' | 'medium' | 'large'
    enableVibration: boolean
}

interface AppState {
    // 设置
    settings: AppSettings

    // 应用状态
    isOnline: boolean
    lastActiveTime: number

    // Actions
    updateSettings: (settings: Partial<AppSettings>) => void
    setTheme: (theme: Theme) => void
    setLanguage: (language: Language) => void
    setOnlineStatus: (isOnline: boolean) => void
    updateLastActiveTime: () => void
    resetSettings: () => void
}

const defaultSettings: AppSettings = {
    theme: 'auto',
    language: 'zh-CN',
    notifications: true,
    sounds: true,
    autoPlay: false,
    fontSize: 'medium',
    enableVibration: true,
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // 初始状态
            settings: defaultSettings,
            isOnline: navigator.onLine,
            lastActiveTime: Date.now(),

            // Actions
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            setTheme: (theme) => set((state) => ({
                settings: { ...state.settings, theme }
            })),

            setLanguage: (language) => set((state) => ({
                settings: { ...state.settings, language }
            })),

            setOnlineStatus: (isOnline) => set({ isOnline }),

            updateLastActiveTime: () => set({ lastActiveTime: Date.now() }),

            resetSettings: () => set({ settings: defaultSettings }),
        }),
        {
            name: 'app-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
)

// 监听网络状态变化
window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true)
})

window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false)
})

// 监听页面活动状态
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        useAppStore.getState().updateLastActiveTime()
    }
})
