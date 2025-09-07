import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import React, { ReactElement } from 'react'
import { Toaster } from 'react-hot-toast'
import { vi } from 'vitest'

// 测试用的 QueryClient
const createTestQueryClient = () => new QueryClient({
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

// 测试包装器组件
interface TestWrapperProps {
    children: React.ReactNode
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
    const queryClient = createTestQueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="light">
                {children}
                <Toaster position="top-right" />
            </ThemeProvider>
        </QueryClientProvider>
    )
}

// 自定义渲染器
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>
}

const customRender = (
    ui: ReactElement,
    options: CustomRenderOptions = {}
) => {
    const { wrapper: Wrapper = TestWrapper, ...renderOptions } = options

    return render(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    })
}

// 测试数据生成器
export const createMockUser = (overrides = {}) => ({
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
})

export const createMockPost = (overrides = {}) => ({
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    slug: 'test-post',
    published: true,
    authorId: '1',
    author: createMockUser(),
    tags: ['test', 'example'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
})

export const createMockComment = (overrides = {}) => ({
    id: '1',
    content: 'Test comment',
    authorId: '1',
    postId: '1',
    author: createMockUser(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
})

// 等待工具函数
export const waitForLoadingToFinish = () =>
    new Promise(resolve => setTimeout(resolve, 0))

// 模拟路由参数
export const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
}

// 模拟搜索参数
export const mockSearchParams = new URLSearchParams()

// 模拟路径名
export const mockPathname = '/'

// 重新导出所有测试库函数
export * from '@testing-library/react'
export { customRender as render, TestWrapper }

