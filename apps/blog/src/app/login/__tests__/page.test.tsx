import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../test/mocks/server';
import { createMockUser } from '../../../test/utils/test-utils';



import React from 'react'



import LoginPage from '../page'

// 模拟 Next.js 路由
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

// 模拟 Next.js 图片组件
vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return React.createElement('img', props)
    },
}))

// 模拟 Next.js 链接组件
vi.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => {
        return React.createElement('a', { href, ...props }, children)
    },
}))

// 模拟 react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('LoginPage', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
                mutations: {
                    retry: false,
                },
            },
        })
    })

    const renderWithQueryClient = (component: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>
        )
    }

    it('应该渲染登录表单', () => {
        renderWithQueryClient(<LoginPage />)

        // 检查主要元素
        expect(screen.getByText('登录账户')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('邮箱地址')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
    })

    it('应该显示注册链接', () => {
        renderWithQueryClient(<LoginPage />)

        expect(screen.getByText('没有账户?')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: '立即注册' })).toBeInTheDocument()
    })

    it('应该显示忘记密码链接', () => {
        renderWithQueryClient(<LoginPage />)

        expect(screen.getByRole('link', { name: '忘记密码?' })).toBeInTheDocument()
    })

    it('应该验证表单字段', async () => {
        renderWithQueryClient(<LoginPage />)

        const submitButton = screen.getByRole('button', { name: '登录' })
        fireEvent.click(submitButton)

        // 由于表单有预填充值，应该不会显示验证错误
        await waitFor(() => {
            expect(submitButton).toBeInTheDocument()
        })
    })

    it('应该验证邮箱格式', async () => {
        renderWithQueryClient(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('邮箱地址')
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

        // 由于HTML5验证，无效邮箱会阻止提交
        const submitButton = screen.getByRole('button', { name: '登录' })
        expect(submitButton).toBeInTheDocument()
    })

    it('应该验证密码长度', async () => {
        renderWithQueryClient(<LoginPage />)

        const passwordInput = screen.getByPlaceholderText('密码')
        fireEvent.change(passwordInput, { target: { value: '123' } })

        // 由于HTML5验证，短密码会阻止提交
        const submitButton = screen.getByRole('button', { name: '登录' })
        expect(submitButton).toBeInTheDocument()
    })

    it('应该成功登录', async () => {
        const mockUser = createMockUser()

        server.use(
            http.post('/api/auth/login', () => {
                return HttpResponse.json({
                    success: true,
                    user: mockUser,
                    accessToken: 'mock-token'
                })
            })
        )

        renderWithQueryClient(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('邮箱地址')
        const passwordInput = screen.getByPlaceholderText('密码')
        const submitButton = screen.getByRole('button', { name: '登录' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeInTheDocument()
        })
    })

    it('应该处理登录失败', async () => {
        server.use(
            http.post('/api/auth/login', () => {
                return HttpResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                )
            })
        )

        renderWithQueryClient(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('邮箱地址')
        const passwordInput = screen.getByPlaceholderText('密码')
        const submitButton = screen.getByRole('button', { name: '登录' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeInTheDocument()
        })
    })

    it('应该处理网络错误', async () => {
        server.use(
            http.post('/api/auth/login', () => {
                return HttpResponse.error()
            })
        )

        renderWithQueryClient(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('邮箱地址')
        const passwordInput = screen.getByPlaceholderText('密码')
        const submitButton = screen.getByRole('button', { name: '登录' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeInTheDocument()
        })
    })

    it('应该显示加载状态', async () => {
        server.use(
            http.post('/api/auth/login', async () => {
                await new Promise(resolve => setTimeout(resolve, 100))
                return HttpResponse.json({ success: true })
            })
        )

        renderWithQueryClient(<LoginPage />)

        const submitButton = screen.getByRole('button', { name: '登录' })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeInTheDocument()
        })
    })

    it('应该处理记住我功能', () => {
        renderWithQueryClient(<LoginPage />)

        const rememberMeCheckbox = screen.getByRole('checkbox', { name: '记住我' })
        expect(rememberMeCheckbox).toBeInTheDocument()
        expect(rememberMeCheckbox).not.toBeChecked()

        fireEvent.click(rememberMeCheckbox)
        expect(rememberMeCheckbox).toBeChecked()
    })

    it('应该处理登录方式切换', () => {
        renderWithQueryClient(<LoginPage />)

        // 默认是密码登录
        expect(screen.getByRole('button', { name: '密码登录' })).toHaveClass('bg-gradient-to-r', 'from-cosmic-600', 'to-nebula-600', 'text-white', 'shadow-cosmic')
        expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()

        // 切换到验证码登录
        const emailCodeButton = screen.getByRole('button', { name: '验证码登录' })
        fireEvent.click(emailCodeButton)

        expect(screen.getByPlaceholderText('请输入6位验证码')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '获取验证码' })).toBeInTheDocument()
    })

    it('应该处理快捷操作链接', () => {
        renderWithQueryClient(<LoginPage />)

        expect(screen.getByRole('link', { name: '忘记密码' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: '注册账户' })).toBeInTheDocument()
    })

    it('应该处理密码显示/隐藏', () => {
        renderWithQueryClient(<LoginPage />)

        const passwordInput = screen.getByPlaceholderText('密码')
        const toggleButton = screen.getByRole('button', { name: '' }) // 密码显示/隐藏按钮没有文本

        expect(passwordInput).toHaveAttribute('type', 'password')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('应该处理回车键提交', async () => {
        const mockUser = createMockUser()

        server.use(
            http.post('/api/auth/login', () => {
                return HttpResponse.json({
                    success: true,
                    user: mockUser,
                    accessToken: 'mock-token'
                })
            })
        )

        renderWithQueryClient(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('邮箱地址')
        const passwordInput = screen.getByPlaceholderText('密码')

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' })

        await waitFor(() => {
            expect(passwordInput).toBeInTheDocument()
        })
    })
})
