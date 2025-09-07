import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCallback, useState } from 'react';


import React from 'react'


// 示例 Hook - 用户管理


interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

interface UseUserManagementReturn {
    users: User[]
    loading: boolean
    error: string | null
    addUser: (user: Omit<User, 'id'>) => Promise<void>
    updateUser: (id: string, updates: Partial<User>) => Promise<void>
    deleteUser: (id: string) => Promise<void>
    getUser: (id: string) => User | undefined
}

const useUserManagement = (): UseUserManagementReturn => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
        setLoading(true)
        setError(null)

        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 100))

            const newUser: User = {
                ...userData,
                id: Date.now().toString()
            }

            setUsers(prev => [...prev, newUser])
        } catch (err) {
            setError(err instanceof Error ? err.message : '添加用户失败')
        } finally {
            setLoading(false)
        }
    }, [])

    const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
        setLoading(true)
        setError(null)

        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 100))

            setUsers(prev =>
                prev.map(user =>
                    user.id === id ? { ...user, ...updates } : user
                )
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新用户失败')
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteUser = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 100))

            setUsers(prev => prev.filter(user => user.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : '删除用户失败')
        } finally {
            setLoading(false)
        }
    }, [])

    const getUser = useCallback((id: string) => {
        return users.find(user => user.id === id)
    }, [users])

    return {
        users,
        loading,
        error,
        addUser,
        updateUser,
        deleteUser,
        getUser
    }
}

// 测试包装器
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUserManagement Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('初始状态', () => {
        it('应该返回正确的初始状态', () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            expect(result.current.users).toEqual([])
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
            expect(typeof result.current.addUser).toBe('function')
            expect(typeof result.current.updateUser).toBe('function')
            expect(typeof result.current.deleteUser).toBe('function')
            expect(typeof result.current.getUser).toBe('function')
        })
    })

    describe('添加用户', () => {
        it('应该成功添加用户', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            const newUser = {
                name: '张三',
                email: 'zhangsan@example.com',
                avatar: 'https://example.com/avatar.jpg'
            }

            await act(async () => {
                await result.current.addUser(newUser)
            })

            expect(result.current.users).toHaveLength(1)
            expect(result.current.users[0]).toMatchObject(newUser)
            expect(result.current.users[0].id).toBeDefined()
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('应该处理添加用户时的错误', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 模拟错误情况
            const originalSetTimeout = global.setTimeout
            global.setTimeout = vi.fn(() => {
                throw new Error('网络错误')
            }) as any

            const newUser = {
                name: '张三',
                email: 'zhangsan@example.com'
            }

            await act(async () => {
                await result.current.addUser(newUser)
            })

            expect(result.current.error).toBe('网络错误')
            expect(result.current.loading).toBe(false)
            expect(result.current.users).toHaveLength(0)

            // 恢复原始setTimeout
            global.setTimeout = originalSetTimeout
        })

        it('应该在添加用户时显示加载状态', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            const newUser = {
                name: '张三',
                email: 'zhangsan@example.com'
            }

            // 开始添加用户
            const addUserPromise = result.current.addUser(newUser)

            // 等待加载状态更新
            await waitFor(() => {
                expect(result.current.loading).toBe(true)
            })

            // 等待完成
            await act(async () => {
                await addUserPromise
            })

            // 检查加载状态已结束
            expect(result.current.loading).toBe(false)
        })
    })

    describe('更新用户', () => {
        it('应该成功更新用户信息', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 先添加一个用户
            const originalUser = {
                name: '张三',
                email: 'zhangsan@example.com'
            }

            await act(async () => {
                await result.current.addUser(originalUser)
            })

            const userId = result.current.users[0].id
            const updates = {
                name: '李四',
                email: 'lisi@example.com'
            }

            await act(async () => {
                await result.current.updateUser(userId, updates)
            })

            expect(result.current.users[0]).toMatchObject(updates)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('应该只更新指定用户的字段', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 添加两个用户
            await act(async () => {
                await result.current.addUser({ name: '张三', email: 'zhangsan@example.com' })
                await result.current.addUser({ name: '李四', email: 'lisi@example.com' })
            })

            const firstUserId = result.current.users[0].id
            const secondUserId = result.current.users[1].id

            // 只更新第一个用户
            await act(async () => {
                await result.current.updateUser(firstUserId, { name: '王五' })
            })

            expect(result.current.users[0].name).toBe('王五')
            expect(result.current.users[0].email).toBe('zhangsan@example.com')
            expect(result.current.users[1].name).toBe('李四')
            expect(result.current.users[1].email).toBe('lisi@example.com')
        })
    })

    describe('删除用户', () => {
        it('应该成功删除用户', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 先添加一个用户
            await act(async () => {
                await result.current.addUser({ name: '张三', email: 'zhangsan@example.com' })
            })

            const userId = result.current.users[0].id
            expect(result.current.users).toHaveLength(1)

            await act(async () => {
                await result.current.deleteUser(userId)
            })

            expect(result.current.users).toHaveLength(0)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('应该只删除指定的用户', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 添加两个用户
            await act(async () => {
                await result.current.addUser({ name: '张三', email: 'zhangsan@example.com' })
                await result.current.addUser({ name: '李四', email: 'lisi@example.com' })
            })

            expect(result.current.users).toHaveLength(2)

            const firstUserId = result.current.users[0].id

            // 只删除第一个用户
            await act(async () => {
                await result.current.deleteUser(firstUserId)
            })

            expect(result.current.users).toHaveLength(1)
            expect(result.current.users[0].name).toBe('李四')
        })
    })

    describe('获取用户', () => {
        it('应该正确获取指定用户', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 添加用户
            await act(async () => {
                await result.current.addUser({ name: '张三', email: 'zhangsan@example.com' })
            })

            const userId = result.current.users[0].id
            const user = result.current.getUser(userId)

            expect(user).toBeDefined()
            expect(user?.name).toBe('张三')
            expect(user?.email).toBe('zhangsan@example.com')
        })

        it('应该返回undefined当用户不存在时', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            const user = result.current.getUser('non-existent-id')
            expect(user).toBeUndefined()
        })
    })

    describe('状态管理', () => {
        it('应该在操作过程中正确管理loading状态', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 测试添加用户时的loading状态
            const addPromise = result.current.addUser({ name: '张三', email: 'zhangsan@example.com' })

            await waitFor(() => {
                expect(result.current.loading).toBe(true)
            })
            await act(async () => {
                await addPromise
            })
            expect(result.current.loading).toBe(false)

            const userId = result.current.users[0].id

            // 测试更新用户时的loading状态
            const updatePromise = result.current.updateUser(userId, { name: '李四' })

            await waitFor(() => {
                expect(result.current.loading).toBe(true)
            })
            await act(async () => {
                await updatePromise
            })
            expect(result.current.loading).toBe(false)

            // 测试删除用户时的loading状态
            const deletePromise = result.current.deleteUser(userId)

            await waitFor(() => {
                expect(result.current.loading).toBe(true)
            })
            await act(async () => {
                await deletePromise
            })
            expect(result.current.loading).toBe(false)
        })

        it('应该正确清除错误状态', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 先触发一个错误
            const originalSetTimeout = global.setTimeout
            global.setTimeout = vi.fn(() => {
                throw new Error('网络错误')
            }) as any

            await act(async () => {
                await result.current.addUser({ name: '张三', email: 'zhangsan@example.com' })
            })

            expect(result.current.error).toBe('网络错误')

            // 恢复原始setTimeout
            global.setTimeout = originalSetTimeout

            // 执行成功操作，错误应该被清除
            await act(async () => {
                await result.current.addUser({ name: '李四', email: 'lisi@example.com' })
            })

            expect(result.current.error).toBeNull()
        })
    })

    describe('边界情况', () => {
        it('应该处理空用户数据', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            await act(async () => {
                await result.current.addUser({ name: '', email: '' })
            })

            expect(result.current.users).toHaveLength(1)
            expect(result.current.users[0].name).toBe('')
            expect(result.current.users[0].email).toBe('')
        })

        it('应该处理特殊字符', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            const specialUser = {
                name: '用户@#$%^&*()',
                email: 'user+tag@example.com'
            }

            await act(async () => {
                await result.current.addUser(specialUser)
            })

            expect(result.current.users[0]).toMatchObject(specialUser)
        })

        it('应该处理并发操作', async () => {
            const { result } = renderHook(() => useUserManagement(), {
                wrapper: createWrapper()
            })

            // 同时执行多个操作
            await act(async () => {
                await Promise.all([
                    result.current.addUser({ name: '张三', email: 'zhangsan@example.com' }),
                    result.current.addUser({ name: '李四', email: 'lisi@example.com' }),
                    result.current.addUser({ name: '王五', email: 'wangwu@example.com' })
                ])
            })

            expect(result.current.users).toHaveLength(3)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
        })
    })
})
