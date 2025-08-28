/**
 * 认证状态管理
 * 管理用户登录状态、token等认证相关数据
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface User {
    id: string
    username: string
    email: string
    avatar?: string
    role: string
    permissions: string[]
    profile?: {
        nickname?: string
        phone?: string
        gender?: 'male' | 'female' | 'unknown'
        birthday?: string
        location?: string
    }
}

interface AuthState {
    // 状态
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setRefreshToken: (refreshToken: string | null) => void
    setLoading: (loading: boolean) => void
    login: (user: User, token: string, refreshToken?: string) => void
    logout: () => void
    updateProfile: (profile: Partial<User>) => void

    // Getters
    hasPermission: (permission: string) => boolean
    isRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // 初始状态
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setUser: (user) => set((state) => ({
                user,
                isAuthenticated: !!user && !!state.token
            })),

            setToken: (token) => set((state) => ({
                token,
                isAuthenticated: !!token && !!state.user
            })),

            setRefreshToken: (refreshToken) => set({ refreshToken }),

            setLoading: (isLoading) => set({ isLoading }),

            login: (user, token, refreshToken) => set({
                user,
                token,
                refreshToken,
                isAuthenticated: true,
                isLoading: false
            }),

            logout: () => set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false
            }),

            updateProfile: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),

            // Getters
            hasPermission: (permission) => {
                const user = get().user
                return user?.permissions?.includes(permission) || false
            },

            isRole: (role) => {
                const user = get().user
                return user?.role === role
            },
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
            }),
        }
    )
)
