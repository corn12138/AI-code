/**
 * 用户状态管理测试
 */

import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { UserProvider, useUserStore } from '../userStore'

// 测试用的包装器
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
)

describe('stores/userStore', () => {
    it('should throw when used outside Provider', () => {
        expect(() => {
            renderHook(() => useUserStore())
        }).toThrow('useUserStore must be used within a UserProvider')
    })

    it('should provide initial state', () => {
        const { result } = renderHook(() => useUserStore(), { wrapper })

        expect(result.current.state.currentUser).toBeNull()
        expect(result.current.state.userLoading).toBe(false)
        expect(result.current.state.userProfile).toBeNull()
        expect(result.current.state.profileLoading).toBe(false)
        expect(result.current.state.userPreferences).toEqual({
            theme: 'light',
            language: 'zh-CN',
            notifications: true
        })
    })

    it('loadCurrentUser should update state correctly', async () => {
        const { result } = renderHook(() => useUserStore(), { wrapper })

        await act(async () => {
            await result.current.loadCurrentUser()
        })

        expect(result.current.state.userLoading).toBe(false)
        expect(result.current.state.currentUser).toEqual({
            id: '1',
            name: '张三',
            avatar: 'https://via.placeholder.com/40',
            email: 'zhangsan@example.com',
            department: '技术部',
            role: 'developer'
        })
    })

    it('loadUserProfile should update profile state', async () => {
        const { result } = renderHook(() => useUserStore(), { wrapper })

        await act(async () => {
            await result.current.loadUserProfile('1')
        })

        expect(result.current.state.profileLoading).toBe(false)
        expect(result.current.state.userProfile).toEqual({
            userId: '1',
            bio: '这是一个用户简介',
            skills: ['React', 'TypeScript', 'Node.js'],
            joinDate: '2023-01-01'
        })
    })

    it('updatePreferences should merge preferences correctly', () => {
        const { result } = renderHook(() => useUserStore(), { wrapper })

        act(() => {
            result.current.updatePreferences({ theme: 'dark' })
        })

        expect(result.current.state.userPreferences).toEqual({
            theme: 'dark',
            language: 'zh-CN',
            notifications: true
        })

        act(() => {
            result.current.updatePreferences({ language: 'en-US', notifications: false })
        })

        expect(result.current.state.userPreferences).toEqual({
            theme: 'dark',
            language: 'en-US',
            notifications: false
        })
    })

    it('logout should clear user data', () => {
        const { result } = renderHook(() => useUserStore(), { wrapper })

        // 先设置一些数据
        act(() => {
            result.current.dispatch({ type: 'SET_CURRENT_USER', payload: { id: '1', name: 'Test' } })
            result.current.dispatch({ type: 'SET_USER_PROFILE', payload: { bio: 'test' } })
        })

        expect(result.current.state.currentUser).not.toBeNull()
        expect(result.current.state.userProfile).not.toBeNull()

        // 登出
        act(() => {
            result.current.logout()
        })

        expect(result.current.state.currentUser).toBeNull()
        expect(result.current.state.userProfile).toBeNull()
    })

    it('should handle loading states correctly', async () => {
        const { result } = renderHook(() => useUserStore(), { wrapper })

        // 测试用户加载状态
        act(() => {
            result.current.dispatch({ type: 'SET_USER_LOADING', payload: true })
        })
        expect(result.current.state.userLoading).toBe(true)

        // 测试档案加载状态
        act(() => {
            result.current.dispatch({ type: 'SET_PROFILE_LOADING', payload: true })
        })
        expect(result.current.state.profileLoading).toBe(true)
    })
})
