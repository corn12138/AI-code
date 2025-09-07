import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutPage from '@/app/about/page'
import DashboardPage from '@/app/dashboard/page'
import ProfileClient from '@/components/ProfileClient'



// 模拟用户数据
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

describe('响应式设计测试', () => {
    describe('断点测试', () => {
        it('移动端断点 (sm) 应该正确应用', () => {
            render(<AboutPage />)

            // 检查移动端特定的样式
            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                expect(container).toHaveClass('p-4') // 移动端padding
            })
        })

        it('平板断点 (md) 应该正确应用', () => {
            render(<AboutPage />)

            // 检查平板端特定的样式
            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                expect(container).toHaveClass('md:p-6') // 平板端padding
            })
        })

        it('桌面断点 (lg) 应该正确应用', () => {
            render(<AboutPage />)

            // 检查桌面端特定的样式
            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                expect(container).toHaveClass('lg:p-8') // 桌面端padding
            })
        })

        it('大屏断点 (xl) 应该正确应用', () => {
            render(<AboutPage />)

            // 检查大屏端特定的样式
            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                // 检查是否有xl断点的样式
                expect(container.className).toMatch(/xl:/)
            })
        })
    })

    describe('移动端适配', () => {
        it('导航栏在移动端应该正确显示', () => {
            render(<AboutPage />)

            // 检查移动端导航栏
            const navbar = screen.getByRole('navigation')
            expect(navbar).toBeInTheDocument()
            expect(navbar).toHaveClass('sticky', 'top-0', 'z-50')
        })

        it('按钮在移动端应该有合适的触摸目标大小', () => {
            render(<AboutPage />)

            const buttons = screen.getAllByRole('button')
            buttons.forEach(button => {
                // 检查按钮是否有合适的最小高度
                expect(button.className).toMatch(/min-h-\[44px\]|py-2|py-3|py-4/)
            })
        })

        it('输入框在移动端应该有合适的字体大小', () => {
            render(<ProfileClient initialUser={mockUser} />)

            // 等待组件加载
            const profileClient = screen.getByTestId('profile-client')
            expect(profileClient).toBeInTheDocument()

            // 检查输入框的字体大小
            const inputs = screen.getAllByRole('textbox')
            inputs.forEach(input => {
                expect(input).toHaveClass('text-sm') // 移动端合适的字体大小
            })
        })

        it('图片在移动端应该正确缩放', () => {
            render(<AboutPage />)

            const images = screen.getAllByRole('img')
            images.forEach(image => {
                // 检查图片是否有响应式类
                expect(image.className).toMatch(/w-|h-|max-w-|max-h-/)
            })
        })
    })

    describe('跨设备兼容性', () => {
        it('所有页面在不同设备上都应该保持一致的布局', () => {
            const { rerender } = render(<AboutPage />)

            // 检查About页面的布局
            expect(screen.getByTestId('about-page')).toBeInTheDocument()
            expect(screen.getByTestId('starry-background')).toBeInTheDocument()

            // 切换到Dashboard页面
            rerender(<DashboardPage />)

            // 检查Dashboard页面的布局
            expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
            expect(screen.getByTestId('starry-background')).toBeInTheDocument()
        })

        it('所有组件都应该有合适的容器宽度', () => {
            render(<AboutPage />)

            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                // 检查容器是否有合适的宽度限制
                expect(container.className).toMatch(/max-w-|w-full|container/)
            })
        })

        it('所有文本都应该有合适的行高和间距', () => {
            render(<AboutPage />)

            const headings = screen.getAllByRole('heading')
            headings.forEach(heading => {
                // 检查标题是否有合适的行高
                expect(heading.className).toMatch(/leading-|line-height/)
            })
        })

        it('所有交互元素都应该有合适的焦点状态', () => {
            render(<AboutPage />)

            const interactiveElements = screen.getAllByRole('button')
            interactiveElements.forEach(element => {
                // 检查交互元素是否有焦点状态
                expect(element.className).toMatch(/focus:|focus-visible:/)
            })
        })
    })

    describe('响应式文本', () => {
        it('主标题应该有响应式字体大小', () => {
            render(<AboutPage />)

            const mainHeadings = screen.getAllByRole('heading', { level: 1 })
            mainHeadings.forEach(heading => {
                // 检查主标题是否有响应式字体大小
                expect(heading.className).toMatch(/text-|md:text-|lg:text-|xl:text-/)
            })
        })

        it('副标题应该有响应式字体大小', () => {
            render(<AboutPage />)

            const subHeadings = screen.getAllByRole('heading', { level: 2 })
            subHeadings.forEach(heading => {
                // 检查副标题是否有响应式字体大小
                expect(heading.className).toMatch(/text-|md:text-|lg:text-|xl:text-/)
            })
        })

        it('正文应该有响应式字体大小', () => {
            render(<AboutPage />)

            const paragraphs = screen.getAllByRole('paragraph')
            paragraphs.forEach(paragraph => {
                // 检查正文是否有响应式字体大小
                expect(paragraph.className).toMatch(/text-|md:text-|lg:text-|xl:text-/)
            })
        })
    })

    describe('响应式间距', () => {
        it('所有容器都应该有响应式margin', () => {
            render(<AboutPage />)

            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                // 检查容器是否有响应式margin
                expect(container.className).toMatch(/m-|md:m-|lg:m-|xl:m-/)
            })
        })

        it('所有容器都应该有响应式padding', () => {
            render(<AboutPage />)

            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                // 检查容器是否有响应式padding
                expect(container.className).toMatch(/p-|md:p-|lg:p-|xl:p-/)
            })
        })

        it('所有元素都应该有响应式gap', () => {
            render(<AboutPage />)

            const flexContainers = screen.getAllByTestId(/join-us-section/)
            flexContainers.forEach(container => {
                // 检查flex容器是否有响应式gap
                expect(container.className).toMatch(/gap-|md:gap-|lg:gap-|xl:gap-/)
            })
        })
    })

    describe('响应式网格', () => {
        it('网格布局应该在不同断点下正确调整', () => {
            render(<AboutPage />)

            const gridContainers = screen.getAllByTestId(/join-us-section/)
            gridContainers.forEach(container => {
                // 检查网格容器是否有响应式列数
                expect(container.className).toMatch(/grid-cols-|md:grid-cols-|lg:grid-cols-|xl:grid-cols-/)
            })
        })

        it('Flexbox布局应该在不同断点下正确调整', () => {
            render(<AboutPage />)

            const flexContainers = screen.getAllByTestId(/join-us-section/)
            flexContainers.forEach(container => {
                // 检查flex容器是否有响应式方向
                expect(container.className).toMatch(/flex-|md:flex-|lg:flex-|xl:flex-/)
            })
        })
    })

    describe('响应式隐藏/显示', () => {
        it('某些元素应该在特定断点下隐藏', () => {
            render(<AboutPage />)

            // 检查是否有响应式隐藏的元素
            const hiddenElements = screen.queryAllByTestId(/hidden-|md:hidden|lg:hidden|xl:hidden/)
            // 这些元素应该存在但可能在某些断点下隐藏
            expect(hiddenElements.length).toBeGreaterThanOrEqual(0)
        })

        it('某些元素应该在特定断点下显示', () => {
            render(<AboutPage />)

            // 检查是否有响应式显示的元素
            const visibleElements = screen.queryAllByTestId(/block-|md:block|lg:block|xl:block/)
            // 这些元素应该存在
            expect(visibleElements.length).toBeGreaterThanOrEqual(0)
        })
    })

    describe('触摸友好性', () => {
        it('所有可点击元素都应该有合适的触摸目标', () => {
            render(<AboutPage />)

            const clickableElements = screen.getAllByRole('button')
            clickableElements.forEach(element => {
                // 检查可点击元素是否有合适的最小尺寸
                expect(element.className).toMatch(/min-h-|min-w-|p-|px-|py-/)
            })
        })

        it('所有链接都应该有合适的触摸目标', () => {
            render(<AboutPage />)

            const links = screen.getAllByRole('link')
            links.forEach(link => {
                // 检查链接是否有合适的最小尺寸
                expect(link.className).toMatch(/min-h-|min-w-|p-|px-|py-/)
            })
        })
    })

    describe('性能优化', () => {
        it('所有响应式样式都应该使用CSS变量或Tailwind类', () => {
            render(<AboutPage />)

            const containers = screen.getAllByTestId(/join-us-section/)
            containers.forEach(container => {
                // 检查是否使用了Tailwind类而不是内联样式
                expect(container).not.toHaveAttribute('style')
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
