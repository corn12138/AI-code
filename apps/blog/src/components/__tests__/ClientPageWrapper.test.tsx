import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';


import ClientPageWrapper from '@/components/ClientPageWrapper'

// 模拟 Suspense
vi.mock('react', async () => {
    const actual = await vi.importActual('react')
    return {
        ...actual,
        Suspense: ({ children, fallback }: any) => (
            <div data-testid="suspense">
                {fallback}
                {children}
            </div>
        ),
    }
})

// 模拟 StarryBackground 和 StarryParticles
vi.mock('@/components/StarryBackground', () => ({
    default: ({ children }: any) => (
        <div data-testid="starry-background">
            {children}
        </div>
    ),
}))

vi.mock('@/components/StarryParticles', () => ({
    default: () => <div data-testid="starry-particles" />,
}))

describe('ClientPageWrapper 组件', () => {
    it('应该正确渲染页面包装器', () => {
        render(
            <ClientPageWrapper>
                <div data-testid="page-content">页面内容</div>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('client-page-wrapper')).toBeInTheDocument()
        expect(screen.getByTestId('page-content')).toBeInTheDocument()
    })

    it('应该包含StarryBackground组件', () => {
        render(
            <ClientPageWrapper>
                <div>页面内容</div>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('starry-background')).toBeInTheDocument()
    })

    it('应该包含StarryParticles组件', () => {
        render(
            <ClientPageWrapper>
                <div>页面内容</div>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('starry-particles')).toBeInTheDocument()
    })

    it('应该包含Suspense包装器', () => {
        render(
            <ClientPageWrapper>
                <div>页面内容</div>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('suspense')).toBeInTheDocument()
    })

    it('应该渲染子组件', () => {
        const testContent = '测试页面内容'
        render(
            <ClientPageWrapper>
                <div data-testid="test-content">{testContent}</div>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('test-content')).toBeInTheDocument()
        expect(screen.getByText(testContent)).toBeInTheDocument()
    })

    it('应该应用正确的CSS类名', () => {
        render(
            <ClientPageWrapper>
                <div>页面内容</div>
            </ClientPageWrapper>
        )

        const wrapper = screen.getByTestId('client-page-wrapper')
        expect(wrapper).toHaveClass('min-h-screen', 'bg-space-950')
    })

    it('应该处理多个子组件', () => {
        render(
            <ClientPageWrapper>
                <div data-testid="child-1">子组件1</div>
                <div data-testid="child-2">子组件2</div>
                <div data-testid="child-3">子组件3</div>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('child-1')).toBeInTheDocument()
        expect(screen.getByTestId('child-2')).toBeInTheDocument()
        expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('应该处理空子组件', () => {
        render(<ClientPageWrapper />)

        expect(screen.getByTestId('client-page-wrapper')).toBeInTheDocument()
        expect(screen.getByTestId('starry-background')).toBeInTheDocument()
        expect(screen.getByTestId('starry-particles')).toBeInTheDocument()
    })

    it('应该处理null子组件', () => {
        render(<ClientPageWrapper>{null}</ClientPageWrapper>)

        expect(screen.getByTestId('client-page-wrapper')).toBeInTheDocument()
        expect(screen.getByTestId('starry-background')).toBeInTheDocument()
    })

    it('应该处理undefined子组件', () => {
        render(<ClientPageWrapper>{undefined}</ClientPageWrapper>)

        expect(screen.getByTestId('client-page-wrapper')).toBeInTheDocument()
        expect(screen.getByTestId('starry-background')).toBeInTheDocument()
    })

    it('应该正确嵌套组件结构', () => {
        render(
            <ClientPageWrapper>
                <div data-testid="nested-content">嵌套内容</div>
            </ClientPageWrapper>
        )

        const wrapper = screen.getByTestId('client-page-wrapper')
        const starryBackground = screen.getByTestId('starry-background')
        const starryParticles = screen.getByTestId('starry-particles')
        const nestedContent = screen.getByTestId('nested-content')

        // 检查组件嵌套结构
        expect(wrapper).toContainElement(starryBackground)
        expect(starryBackground).toContainElement(starryParticles)
        expect(starryBackground).toContainElement(nestedContent)
    })

    it('应该处理复杂的子组件结构', () => {
        render(
            <ClientPageWrapper>
                <header data-testid="header">
                    <h1>页面标题</h1>
                </header>
                <main data-testid="main">
                    <section data-testid="section">
                        <p>页面内容段落</p>
                    </section>
                </main>
                <footer data-testid="footer">
                    <p>页面底部</p>
                </footer>
            </ClientPageWrapper>
        )

        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByTestId('main')).toBeInTheDocument()
        expect(screen.getByTestId('section')).toBeInTheDocument()
        expect(screen.getByTestId('footer')).toBeInTheDocument()
        expect(screen.getByText('页面标题')).toBeInTheDocument()
        expect(screen.getByText('页面内容段落')).toBeInTheDocument()
        expect(screen.getByText('页面底部')).toBeInTheDocument()
    })
})
