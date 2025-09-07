import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';


import AboutPage from '../about/page'

// 模拟 Next.js 的 Metadata
vi.mock('next', () => ({
    metadata: {
        title: '关于我们',
        description: '了解我们的团队和使命',
    },
}))

describe('About 页面', () => {
    it('应该正确渲染关于我们页面', () => {
        render(<AboutPage />)

        // 检查页面标题
        expect(screen.getByText('关于我们')).toBeInTheDocument()
        expect(screen.getByText('About Us')).toBeInTheDocument()
    })

    it('应该渲染团队介绍部分', () => {
        render(<AboutPage />)

        expect(screen.getByText('我们的团队')).toBeInTheDocument()
        expect(screen.getByText('Our Team')).toBeInTheDocument()
    })

    it('应该渲染团队成员信息', () => {
        render(<AboutPage />)

        // 检查团队成员
        expect(screen.getByText('张三')).toBeInTheDocument()
        expect(screen.getByText('李四')).toBeInTheDocument()
        expect(screen.getByText('王五')).toBeInTheDocument()
    })

    it('应该显示团队成员的角色', () => {
        render(<AboutPage />)

        expect(screen.getByText('前端开发工程师')).toBeInTheDocument()
        expect(screen.getByText('后端开发工程师')).toBeInTheDocument()
        expect(screen.getByText('UI/UX 设计师')).toBeInTheDocument()
    })

    it('应该显示团队成员的个人简介', () => {
        render(<AboutPage />)

        expect(screen.getByText(/热爱前端技术/)).toBeInTheDocument()
        expect(screen.getByText(/专注于后端架构/)).toBeInTheDocument()
        expect(screen.getByText(/致力于用户体验设计/)).toBeInTheDocument()
    })

    it('应该渲染使命和愿景部分', () => {
        render(<AboutPage />)

        expect(screen.getByText('我们的使命')).toBeInTheDocument()
        expect(screen.getByText('Our Mission')).toBeInTheDocument()
        expect(screen.getByText('我们的愿景')).toBeInTheDocument()
        expect(screen.getByText('Our Vision')).toBeInTheDocument()
    })

    it('应该显示使命内容', () => {
        render(<AboutPage />)

        expect(screen.getByText(/为用户提供优质的内容和体验/)).toBeInTheDocument()
    })

    it('应该显示愿景内容', () => {
        render(<AboutPage />)

        expect(screen.getByText(/成为最受欢迎的博客平台/)).toBeInTheDocument()
    })

    it('应该渲染价值观部分', () => {
        render(<AboutPage />)

        expect(screen.getByText('我们的价值观')).toBeInTheDocument()
        expect(screen.getByText('Our Values')).toBeInTheDocument()
    })

    it('应该显示价值观列表', () => {
        render(<AboutPage />)

        expect(screen.getByText('创新')).toBeInTheDocument()
        expect(screen.getByText('质量')).toBeInTheDocument()
        expect(screen.getByText('用户至上')).toBeInTheDocument()
        expect(screen.getByText('团队合作')).toBeInTheDocument()
    })

    it('应该渲染加入我们部分', () => {
        render(<AboutPage />)

        expect(screen.getByText('加入我们')).toBeInTheDocument()
        expect(screen.getByText('Join Us')).toBeInTheDocument()
    })

    it('应该显示加入我们的描述', () => {
        render(<AboutPage />)

        expect(screen.getByText(/我们正在寻找优秀的人才/)).toBeInTheDocument()
    })

    it('应该包含联系按钮', () => {
        render(<AboutPage />)

        const contactButton = screen.getByRole('button', { name: /联系我们/i })
        expect(contactButton).toBeInTheDocument()
    })

    it('应该应用正确的CSS类名', () => {
        render(<AboutPage />)

        // 检查主容器
        const mainContainer = screen.getByTestId('about-page')
        expect(mainContainer).toHaveClass('min-h-screen', 'bg-space-950')

        // 检查标题样式
        const title = screen.getByText('关于我们')
        expect(title).toHaveClass('text-space-200')

        // 检查副标题样式
        const subtitle = screen.getByText('About Us')
        expect(subtitle).toHaveClass('text-space-400')
    })

    it('应该为团队图片容器应用正确的样式', () => {
        render(<AboutPage />)

        const teamImageContainer = screen.getByTestId('team-image-container')
        expect(teamImageContainer).toHaveClass(
            'rounded-2xl',
            'overflow-hidden',
            'border',
            'border-cosmic-500/20',
            'shadow-cosmic'
        )
    })

    it('应该为链接应用正确的样式', () => {
        render(<AboutPage />)

        const links = screen.getAllByRole('link')
        links.forEach(link => {
            expect(link).toHaveClass('text-cosmic-400', 'hover:text-cosmic-300')
        })
    })

    it('应该为加入我们部分应用正确的样式', () => {
        render(<AboutPage />)

        const joinUsSection = screen.getByTestId('join-us-section')
        expect(joinUsSection).toHaveClass(
            'bg-space-900/40',
            'backdrop-blur-xl',
            'rounded-2xl',
            'border',
            'border-cosmic-500/20',
            'shadow-cosmic'
        )
    })

    it('应该为联系按钮应用正确的样式', () => {
        render(<AboutPage />)

        const contactButton = screen.getByRole('button', { name: /联系我们/i })
        expect(contactButton).toHaveClass(
            'bg-gradient-to-r',
            'from-cosmic-600',
            'to-nebula-600',
            'shadow-cosmic'
        )
    })

    it('应该包含StarryBackground组件', () => {
        render(<AboutPage />)

        expect(screen.getByTestId('starry-background')).toBeInTheDocument()
    })

    it('应该包含StarryParticles组件', () => {
        render(<AboutPage />)

        expect(screen.getByTestId('starry-particles')).toBeInTheDocument()
    })

    it('应该正确嵌套组件结构', () => {
        render(<AboutPage />)

        const starryBackground = screen.getByTestId('starry-background')
        const starryParticles = screen.getByTestId('starry-particles')
        const mainContent = screen.getByTestId('about-page')

        expect(starryBackground).toContainElement(starryParticles)
        expect(starryBackground).toContainElement(mainContent)
    })
})
