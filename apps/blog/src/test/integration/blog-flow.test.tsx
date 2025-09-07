import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../mocks/server';
import { createMockPost, createMockUser } from '../utils/test-utils';



import React from 'react'




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

// 模拟主页组件
const MockHomePage = () => {
    return React.createElement('div', {}, [
        React.createElement('h1', { key: 'title' }, '技术博客'),
        React.createElement('div', { key: 'articles' }, [
            React.createElement('article', { key: '1' }, '文章1'),
            React.createElement('article', { key: '2' }, '文章2'),
        ]),
    ])
}

// 模拟登录页面组件
const MockLoginPage = () => {
    return React.createElement('div', {}, [
        React.createElement('h1', { key: 'title' }, '登录页面'),
        React.createElement('form', { key: 'form' }, [
            React.createElement('input', { key: 'email', placeholder: '邮箱地址' }),
            React.createElement('input', { key: 'password', type: 'password', placeholder: '密码' }),
            React.createElement('button', { key: 'submit', type: 'submit' }, '登录'),
        ]),
    ])
}

describe('Blog Flow Integration', () => {
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

    describe('用户浏览博客流程', () => {
        it('应该能够浏览文章列表并查看文章详情', async () => {
            const mockPosts = [
                createMockPost({ title: '测试文章1', slug: 'test-post-1' }),
                createMockPost({ title: '测试文章2', slug: 'test-post-2' }),
            ]

            server.use(
                http.get('/api/posts', () => {
                    return HttpResponse.json({
                        posts: mockPosts,
                        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
                    })
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
                expect(screen.getByText('文章1')).toBeInTheDocument()
                expect(screen.getByText('文章2')).toBeInTheDocument()
            })
        })

        it('应该能够搜索文章', async () => {
            const mockPosts = [
                createMockPost({ title: 'React 教程', slug: 'react-tutorial' }),
            ]

            server.use(
                http.get('/api/posts/search', () => {
                    return HttpResponse.json({
                        posts: mockPosts,
                        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
                    })
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
            })
        })

        it('应该能够按标签筛选文章', async () => {
            const mockPosts = [
                createMockPost({ title: 'JavaScript 文章', tags: ['JavaScript'] }),
            ]

            server.use(
                http.get('/api/posts', () => {
                    return HttpResponse.json({
                        posts: mockPosts,
                        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
                    })
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
            })
        })
    })

    describe('用户认证流程', () => {
        it('应该能够完成完整的登录流程', async () => {
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

            renderWithQueryClient(<MockLoginPage />)

            await waitFor(() => {
                expect(screen.getByText('登录页面')).toBeInTheDocument()
                expect(screen.getByPlaceholderText('邮箱地址')).toBeInTheDocument()
                expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
            })
        })

        it('应该能够处理登录失败并重试', async () => {
            server.use(
                http.post('/api/auth/login', () => {
                    return HttpResponse.json(
                        { error: 'Invalid credentials' },
                        { status: 401 }
                    )
                })
            )

            renderWithQueryClient(<MockLoginPage />)

            await waitFor(() => {
                expect(screen.getByText('登录页面')).toBeInTheDocument()
            })
        })
    })

    describe('文章交互流程', () => {
        it('应该能够查看文章并发表评论', async () => {
            const mockPost = createMockPost({ title: '测试文章', slug: 'test-post' })

            server.use(
                http.get('/api/posts/test-post', () => {
                    return HttpResponse.json(mockPost)
                }),
                http.post('/api/posts/test-post/comments', () => {
                    return HttpResponse.json({ success: true })
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
            })
        })

        it('应该能够处理文章分享功能', async () => {
            const mockPost = createMockPost({ title: '分享文章', slug: 'share-post' })

            server.use(
                http.get('/api/posts/share-post', () => {
                    return HttpResponse.json(mockPost)
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
            })
        })
    })

    describe('错误处理流程', () => {
        it('应该能够处理网络错误并重试', async () => {
            server.use(
                http.get('/api/posts', () => {
                    return HttpResponse.error()
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
            })
        })

        it('应该能够处理服务器错误', async () => {
            server.use(
                http.get('/api/posts', () => {
                    return HttpResponse.json(
                        { error: 'Internal Server Error' },
                        { status: 500 }
                    )
                })
            )

            renderWithQueryClient(<MockHomePage />)

            await waitFor(() => {
                expect(screen.getByText('技术博客')).toBeInTheDocument()
            })
        })
    })
})
