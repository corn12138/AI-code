import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';


import DashboardPage from '../dashboard/page'

// 模拟认证hook
vi.mock('@shared/hooks', () => ({
    useAuth: () => ({
        user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
        },
        isLoading: false,
        error: null,
    }),
}))

// 模拟数据获取函数
vi.mock('@/lib/posts', () => ({
    getPosts: vi.fn().mockResolvedValue([]),
    getPostCount: vi.fn().mockResolvedValue(10),
}))

vi.mock('@/lib/users', () => ({
    getUserCount: vi.fn().mockResolvedValue(5),
}))

describe('Dashboard 页面', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应该正确渲染仪表板页面', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('仪表板')).toBeInTheDocument()
            expect(screen.getByText('Dashboard')).toBeInTheDocument()
        })
    })

    it('应该显示欢迎信息', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText(/欢迎回来/)).toBeInTheDocument()
            expect(screen.getByText('Test User')).toBeInTheDocument()
        })
    })

    it('应该渲染统计卡片', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('总文章数')).toBeInTheDocument()
            expect(screen.getByText('总用户数')).toBeInTheDocument()
            expect(screen.getByText('今日访问')).toBeInTheDocument()
            expect(screen.getByText('系统状态')).toBeInTheDocument()
        })
    })

    it('应该显示统计数值', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument() // 文章数
            expect(screen.getByText('5')).toBeInTheDocument()  // 用户数
        })
    })

    it('应该渲染快速操作按钮', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /写文章/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /管理用户/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /查看统计/i })).toBeInTheDocument()
        })
    })

    it('应该渲染AI模型使用情况', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('AI 模型使用情况')).toBeInTheDocument()
            expect(screen.getByText('AI Model Usage')).toBeInTheDocument()
        })
    })

    it('应该渲染最近活动', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('最近活动')).toBeInTheDocument()
            expect(screen.getByText('Recent Activities')).toBeInTheDocument()
        })
    })

    it('应该显示加载状态', () => {
        // 模拟加载状态
        vi.mocked(require('@shared/hooks').useAuth).mockReturnValue({
            user: null,
            isLoading: true,
            error: null,
        })

        render(<DashboardPage />)

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('应该显示错误状态', () => {
        // 模拟错误状态
        vi.mocked(require('@shared/hooks').useAuth).mockReturnValue({
            user: null,
            isLoading: false,
            error: '认证失败',
        })

        render(<DashboardPage />)

        expect(screen.getByText('认证失败')).toBeInTheDocument()
    })

    it('应该显示未认证状态', () => {
        // 模拟未认证状态
        vi.mocked(require('@shared/hooks').useAuth).mockReturnValue({
            user: null,
            isLoading: false,
            error: null,
        })

        render(<DashboardPage />)

        expect(screen.getByText('请先登录')).toBeInTheDocument()
    })

    it('应该应用正确的CSS类名', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const mainContainer = screen.getByTestId('dashboard-page')
            expect(mainContainer).toHaveClass('min-h-screen', 'bg-space-950')
        })
    })

    it('应该为统计卡片应用正确的样式', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const statCards = screen.getAllByTestId(/stat-card-/)
            statCards.forEach(card => {
                expect(card).toHaveClass(
                    'bg-space-900/40',
                    'backdrop-blur-xl',
                    'rounded-2xl',
                    'border',
                    'border-cosmic-500/20',
                    'p-6',
                    'hover:shadow-cosmic'
                )
            })
        })
    })

    it('应该为快速操作按钮应用正确的样式', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const actionButtons = screen.getAllByRole('button')
            actionButtons.forEach(button => {
                if (button.textContent?.includes('写文章') || 
                    button.textContent?.includes('管理用户') || 
                    button.textContent?.includes('查看统计')) {
                    expect(button).toHaveClass(
                        'bg-gradient-to-r',
                        'from-cosmic-600',
                        'to-nebula-600',
                        'shadow-cosmic'
                    )
                }
            })
        })
    })

    it('应该为用户欢迎卡片应用正确的样式', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const welcomeCard = screen.getByTestId('welcome-card')
            expect(welcomeCard).toHaveClass(
                'bg-gradient-to-r',
                'from-cosmic-500/20',
                'to-nebula-500/20',
                'backdrop-blur-xl',
                'rounded-2xl',
                'border',
                'border-cosmic-500/20'
            )
        })
    })

    it('应该为AI使用情况部分应用正确的样式', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const aiUsageSection = screen.getByTestId('ai-usage-section')
            expect(aiUsageSection).toHaveClass(
                'bg-space-900/40',
                'backdrop-blur-xl',
                'rounded-2xl',
                'border',
                'border-cosmic-500/20'
            )
        })
    })

    it('应该为最近活动部分应用正确的样式', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const recentActivitiesSection = screen.getByTestId('recent-activities-section')
            expect(recentActivitiesSection).toHaveClass(
                'bg-space-900/40',
                'backdrop-blur-xl',
                'rounded-2xl',
                'border',
                'border-cosmic-500/20'
            )
        })
    })

    it('应该包含StarryBackground组件', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByTestId('starry-background')).toBeInTheDocument()
        })
    })

    it('应该包含StarryParticles组件', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByTestId('starry-particles')).toBeInTheDocument()
        })
    })

    it('应该正确嵌套组件结构', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const starryBackground = screen.getByTestId('starry-background')
            const starryParticles = screen.getByTestId('starry-particles')
            const dashboardContent = screen.getByTestId('dashboard-page')

            expect(starryBackground).toContainElement(starryParticles)
            expect(starryBackground).toContainElement(dashboardContent)
        })
    })

    it('应该显示页面图标', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            const icons = screen.getAllByTestId(/icon-/)
            expect(icons.length).toBeGreaterThan(0)
        })
    })

    it('应该显示页面描述', async () => {
        render(<DashboardPage />)

        await waitFor(() => {
            expect(screen.getByText(/管理您的博客内容和数据/)).toBeInTheDocument()
        })
    })
})
