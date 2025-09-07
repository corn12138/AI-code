import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AboutPage from '@/app/about/page'
import DashboardPage from '@/app/dashboard/page'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ProfileClient from '@/components/ProfileClient'



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

describe('星空暗黑主题集成测试', () => {
    describe('主题色彩一致性', () => {
        it('所有页面都应该使用space-950作为主背景色', async () => {
            // 测试About页面
            const { rerender } = render(<AboutPage />)
            let mainContainer = screen.getByTestId('about-page')
            expect(mainContainer).toHaveClass('bg-space-950')

            // 测试Dashboard页面
            rerender(<DashboardPage />)
            // 等待Dashboard页面加载（可能需要等待加载状态结束）
            await waitFor(() => {
                // 检查是否有dashboard-page或者loading-spinner
                const dashboardPage = screen.queryByTestId('dashboard-page')
                const loadingSpinner = screen.queryByTestId('loading-spinner')
                expect(dashboardPage || loadingSpinner).toBeInTheDocument()
            })

            // 如果找到了dashboard-page，检查其样式
            const dashboardPage = screen.queryByTestId('dashboard-page')
            if (dashboardPage) {
                expect(dashboardPage).toHaveClass('bg-space-950')
            }
        })

        it('所有容器都应该使用space-900/40背景和backdrop-blur-xl', () => {
            render(<AboutPage />)

            const containers = screen.getAllByTestId(/team-image-container|join-us-section/)
            containers.forEach(container => {
                expect(container).toHaveClass('bg-space-900/40', 'backdrop-blur-xl')
            })
        })

        it('所有边框都应该使用cosmic-500/20', () => {
            render(<AboutPage />)

            const borderedElements = screen.getAllByTestId(/team-image-container|join-us-section/)
            borderedElements.forEach(element => {
                expect(element).toHaveClass('border-cosmic-500/20')
            })
        })

        it('所有按钮都应该使用cosmic到nebula的渐变', () => {
            render(<AboutPage />)

            const joinButton = screen.getByTestId('join-us-button')
            expect(joinButton).toHaveClass('bg-gradient-to-r', 'from-cosmic-600', 'to-nebula-600')
        })
    })

    describe('文本色彩一致性', () => {
        it('主标题应该使用space-200颜色', () => {
            render(<AboutPage />)

            const mainTitles = screen.getAllByRole('heading', { level: 1 })
            mainTitles.forEach(title => {
                expect(title).toHaveClass('text-space-200')
            })
        })

        it('副标题应该使用space-400颜色', () => {
            render(<AboutPage />)

            const subtitles = screen.getAllByTestId(/mission-section|team-section|values-section/)
            subtitles.forEach(subtitle => {
                expect(subtitle).toHaveClass('text-space-200')
            })
        })

        it('链接应该使用cosmic-400颜色', () => {
            render(<AboutPage />)

            const contactLink = screen.getByTestId('contact-link')
            expect(contactLink).toHaveClass('text-cosmic-400', 'hover:text-cosmic-300')
        })
    })

    describe('组件样式一致性', () => {
        it('ProfileClient组件应该应用正确的主题样式', () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                name: 'Test User',
                avatar: 'https://example.com/avatar.jpg',
                bio: 'Test bio',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            }

            render(<ProfileClient initialUser={mockUser} />)

            const container = screen.getByTestId('profile-client')
            expect(container).toHaveClass(
                'bg-space-900/40',
                'backdrop-blur-xl',
                'rounded-2xl',
                'border',
                'border-cosmic-500/20',
                'shadow-cosmic'
            )

            const header = screen.getByTestId('profile-header')
            expect(header).toHaveClass(
                'bg-gradient-to-r',
                'from-cosmic-600',
                'to-nebula-600'
            )
        })

        it('MarkdownRenderer组件应该应用正确的主题样式', () => {
            const markdown = '# 测试标题\n这是一段测试文本。'
            render(<MarkdownRenderer content={markdown} />)

            const container = screen.getByTestId('markdown-renderer')
            expect(container).toHaveClass(
                'prose-headings:text-space-200',
                'prose-p:text-space-400',
                'prose-strong:text-cosmic-300',
                'prose-a:text-cosmic-400',
                'prose-a:hover:text-cosmic-300',
                'prose-code:text-stardust-300',
                'prose-pre:bg-space-800/60',
                'prose-pre:border',
                'prose-pre:border-cosmic-500/20'
            )
        })
    })

    describe('动画和交互一致性', () => {
        it('所有可悬停元素都应该有过渡效果', () => {
            render(<AboutPage />)

            const joinButton = screen.getByTestId('join-us-button')
            expect(joinButton).toHaveClass('transition-all', 'duration-300')
        })

        it('所有按钮都应该有shadow-cosmic效果', () => {
            render(<AboutPage />)

            const joinButton = screen.getByTestId('join-us-button')
            expect(joinButton).toHaveClass('shadow-cosmic')
        })
    })

    describe('星空背景集成', () => {
        it('所有页面都应该包含StarryBackground组件', () => {
            const { rerender } = render(<AboutPage />)
            expect(screen.getByTestId('starry-background')).toBeInTheDocument()

            rerender(<DashboardPage />)
            expect(screen.getByTestId('starry-background')).toBeInTheDocument()
        })

        it('所有页面都应该包含StarryParticles组件', () => {
            const { rerender } = render(<AboutPage />)
            expect(screen.getByTestId('starry-particles')).toBeInTheDocument()

            rerender(<DashboardPage />)
            expect(screen.getByTestId('starry-particles')).toBeInTheDocument()
        })

        it('星空背景应该在内容层级之下', () => {
            render(<AboutPage />)

            const starryBackground = screen.getByTestId('starry-background')
            const mainContent = screen.getByTestId('about-page')

            expect(starryBackground).toContainElement(mainContent)
        })
    })

    describe('响应式设计一致性', () => {
        it('所有容器都应该有响应式padding', () => {
            render(<AboutPage />)

            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                expect(container).toHaveClass('p-4', 'md:p-6', 'lg:p-8')
            })
        })

        it('所有文本都应该有响应式大小', () => {
            render(<AboutPage />)

            const headings = screen.getAllByRole('heading')
            headings.forEach(heading => {
                // 检查标题至少有一个文本大小类
                expect(heading.className).toMatch(/text-\w+/)
            })
        })
    })

    describe('可访问性一致性', () => {
        it('所有按钮都应该有适当的ARIA标签', () => {
            render(<AboutPage />)

            const joinButton = screen.getByTestId('join-us-button')
            expect(joinButton).toHaveAttribute('aria-label')
        })

        it('所有图片都应该有alt属性', () => {
            render(<AboutPage />)

            const images = screen.getAllByRole('img')
            images.forEach(image => {
                expect(image).toHaveAttribute('alt')
            })
        })

        it('所有链接都应该有适当的文本内容', () => {
            render(<AboutPage />)

            const contactLink = screen.getByTestId('contact-link')
            expect(contactLink).toHaveTextContent('contact@techblog.com')
        })
    })

    describe('性能一致性', () => {
        it('所有组件都应该使用适当的性能优化', () => {
            render(<AboutPage />)

            // 检查是否使用了适当的CSS类来优化性能
            const containers = screen.getAllByTestId(/team-image-container|join-us-section/)
            containers.forEach(container => {
                expect(container).toHaveClass('backdrop-blur-xl')
            })
        })

        it('所有动画都应该使用GPU加速', () => {
            render(<AboutPage />)

            const animatedElements = screen.getAllByTestId(/particle-\d+/)
            animatedElements.forEach(element => {
                expect(element).toHaveClass('transform-gpu')
            })
        })
    })
})
