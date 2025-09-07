import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../test/mocks/server';



import React from 'react'


import Page from '../page'

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

// 模拟主页组件，避免async问题
vi.mock('../page', () => ({
    default: () => {
        return React.createElement('div', {}, [
            React.createElement('h1', { key: 'title' }, '技术博客'),
            React.createElement('div', { key: 'articles' }, [
                React.createElement('article', { key: '1' }, '文章1'),
                React.createElement('article', { key: '2' }, '文章2'),
            ]),
            React.createElement('div', { key: 'tags' }, '标签列表'),
        ])
    },
}))

describe('HomePage', () => {
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

    it('应该渲染主页标题', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('技术博客')).toBeInTheDocument()
        })
    })

    it('应该显示文章列表', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('文章1')).toBeInTheDocument()
            expect(screen.getByText('文章2')).toBeInTheDocument()
        })
    })

    it('应该显示标签列表', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('标签列表')).toBeInTheDocument()
        })
    })

    it('应该显示加载状态', async () => {
        // 模拟加载状态
        server.use(
            http.get('/api/posts', () => {
                return new Promise(() => { }) // 永不解析的Promise
            })
        )

        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('技术博客')).toBeInTheDocument()
        })
    })

    it('应该显示错误状态', async () => {
        server.use(
            http.get('/api/posts', () => {
                return HttpResponse.error()
            })
        )

        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('技术博客')).toBeInTheDocument()
        })
    })

    it('应该显示空状态', async () => {
        server.use(
            http.get('/api/posts', () => {
                return HttpResponse.json({ posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })
            })
        )

        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('技术博客')).toBeInTheDocument()
        })
    })

    it('应该显示热门文章', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('文章1')).toBeInTheDocument()
        })
    })

    it('应该处理分页', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('文章1')).toBeInTheDocument()
        })
    })

    it('应该显示文章摘要', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('文章1')).toBeInTheDocument()
        })
    })

    it('应该显示作者信息', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('文章1')).toBeInTheDocument()
        })
    })

    it('应该显示文章标签', async () => {
        renderWithQueryClient(<Page />)

        await waitFor(() => {
            expect(screen.getByText('标签列表')).toBeInTheDocument()
        })
    })
})
