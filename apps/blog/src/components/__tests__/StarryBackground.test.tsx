import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';


import StarryBackground from '@/components/StarryBackground'

// 模拟 Canvas API
const mockCanvas = {
    getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        fillStyle: '',
        globalAlpha: 0,
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        closePath: vi.fn(),
    })),
    width: 800,
    height: 600,
    style: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
}

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 16)
    return 1
})

global.cancelAnimationFrame = vi.fn()

describe('StarryBackground 组件', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        
        // 模拟 canvas 元素
        Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
            value: mockCanvas.getContext,
        })
        
        Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
            get: () => mockCanvas.width,
            set: vi.fn(),
        })
        
        Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
            get: () => mockCanvas.height,
            set: vi.fn(),
        })
    })

    it('应该正确渲染星空背景容器', () => {
        render(
            <StarryBackground>
                <div data-testid="content">测试内容</div>
            </StarryBackground>
        )

        // 检查容器是否存在
        const container = screen.getByTestId('starry-background')
        expect(container).toBeInTheDocument()
        expect(container).toHaveClass('relative', 'min-h-screen', 'overflow-hidden')
    })

    it('应该渲染canvas元素', () => {
        render(
            <StarryBackground>
                <div>测试内容</div>
            </StarryBackground>
        )

        const canvas = screen.getByTestId('starry-canvas')
        expect(canvas).toBeInTheDocument()
        expect(canvas).toHaveClass('fixed', 'inset-0', 'w-full', 'h-full', 'pointer-events-none')
    })

    it('应该渲染子内容', () => {
        render(
            <StarryBackground>
                <div data-testid="child-content">子内容</div>
            </StarryBackground>
        )

        const childContent = screen.getByTestId('child-content')
        expect(childContent).toBeInTheDocument()
        expect(childContent).toHaveTextContent('子内容')
    })

    it('应该设置canvas的z-index为-1', () => {
        render(
            <StarryBackground>
                <div>测试内容</div>
            </StarryBackground>
        )

        const canvas = screen.getByTestId('starry-canvas')
        expect(canvas).toHaveStyle({ zIndex: '-1' })
    })

    it('应该设置内容容器的z-index为1', () => {
        render(
            <StarryBackground>
                <div>测试内容</div>
            </StarryBackground>
        )

        const contentContainer = screen.getByTestId('starry-content')
        expect(contentContainer).toBeInTheDocument()
        expect(contentContainer).toHaveClass('relative', 'z-10')
    })

    it('应该在没有子内容时仍然渲染容器', () => {
        render(<StarryBackground />)

        const container = screen.getByTestId('starry-background')
        expect(container).toBeInTheDocument()
        
        const canvas = screen.getByTestId('starry-canvas')
        expect(canvas).toBeInTheDocument()
    })

    it('应该应用正确的CSS类名', () => {
        render(
            <StarryBackground>
                <div>测试内容</div>
            </StarryBackground>
        )

        const container = screen.getByTestId('starry-background')
        expect(container).toHaveClass(
            'relative',
            'min-h-screen',
            'overflow-hidden',
            'bg-gradient-to-br',
            'from-space-950',
            'via-space-900',
            'to-space-950'
        )
    })
})
