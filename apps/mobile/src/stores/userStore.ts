/**
 * 用户状态管理
 * 使用React Context + useReducer实现，不依赖外部库
 */

import React, { createContext, ReactNode, useCallback, useContext, useReducer } from 'react'

// 用户相关类型定义
interface User {
    id: string
    name: string
    avatar?: string
    email?: string
    department?: string
    role?: string
}

interface UserState {
    currentUser: User | null
    userLoading: boolean
    userProfile: any | null
    profileLoading: boolean
    userPreferences: {
        theme: 'light' | 'dark'
        language: 'zh-CN' | 'en-US'
        notifications: boolean
    }
}

// Action类型定义
type UserAction =
    | { type: 'SET_CURRENT_USER'; payload: User | null }
    | { type: 'SET_USER_LOADING'; payload: boolean }
    | { type: 'SET_USER_PROFILE'; payload: any | null }
    | { type: 'SET_PROFILE_LOADING'; payload: boolean }
    | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<UserState['userPreferences']> }

// 初始状态
const initialState: UserState = {
    currentUser: null,
    userLoading: false,
    userProfile: null,
    profileLoading: false,
    userPreferences: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true
    }
}

// Reducer函数
const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'SET_CURRENT_USER':
            return { ...state, currentUser: action.payload }
        case 'SET_USER_LOADING':
            return { ...state, userLoading: action.payload }
        case 'SET_USER_PROFILE':
            return { ...state, userProfile: action.payload }
        case 'SET_PROFILE_LOADING':
            return { ...state, profileLoading: action.payload }
        case 'UPDATE_USER_PREFERENCES':
            return {
                ...state,
                userPreferences: { ...state.userPreferences, ...action.payload }
            }
        default:
            return state
    }
}

// Context定义
interface UserContextType {
    state: UserState
    dispatch: React.Dispatch<UserAction>
    // Actions
    loadCurrentUser: () => Promise<void>
    loadUserProfile: (userId: string) => Promise<void>
    updatePreferences: (preferences: Partial<UserState['userPreferences']>) => void
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider组件
interface UserProviderProps {
    children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState)

    const loadCurrentUser = useCallback(async () => {
        try {
            dispatch({ type: 'SET_USER_LOADING', payload: true })

            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockUser: User = {
                id: '1',
                name: '张三',
                avatar: 'https://via.placeholder.com/40',
                email: 'zhangsan@example.com',
                department: '技术部',
                role: 'developer'
            }

            dispatch({ type: 'SET_CURRENT_USER', payload: mockUser })
            console.log('✅ 用户信息加载完成:', mockUser)
        } catch (error) {
            console.error('❌ 加载用户信息失败:', error)
            dispatch({ type: 'SET_CURRENT_USER', payload: null })
        } finally {
            dispatch({ type: 'SET_USER_LOADING', payload: false })
        }
    }, [])

    const loadUserProfile = useCallback(async (userId: string) => {
        try {
            dispatch({ type: 'SET_PROFILE_LOADING', payload: true })

            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 800))

            const mockProfile = {
                userId,
                bio: '这是一个用户简介',
                skills: ['React', 'TypeScript', 'Node.js'],
                joinDate: '2023-01-01'
            }

            dispatch({ type: 'SET_USER_PROFILE', payload: mockProfile })
            console.log('✅ 用户档案加载完成:', mockProfile)
        } catch (error) {
            console.error('❌ 加载用户档案失败:', error)
            dispatch({ type: 'SET_USER_PROFILE', payload: null })
        } finally {
            dispatch({ type: 'SET_PROFILE_LOADING', payload: false })
        }
    }, [])

    const updatePreferences = useCallback((preferences: Partial<UserState['userPreferences']>) => {
        dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences })
        console.log('🎨 用户偏好更新:', preferences)
    }, [])

    const logout = useCallback(() => {
        dispatch({ type: 'SET_CURRENT_USER', payload: null })
        dispatch({ type: 'SET_USER_PROFILE', payload: null })
        console.log('👋 用户已登出')
    }, [])

    const contextValue: UserContextType = {
        state,
        dispatch,
        loadCurrentUser,
        loadUserProfile,
        updatePreferences,
        logout
    }

    return React.createElement(UserContext.Provider, { value: contextValue }, children)
}

// Hook
export const useUserStore = (): UserContextType => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUserStore must be used within a UserProvider')
    }
    return context
}
