import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';


import StarryParticles from '@/components/StarryParticles'

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 16)
    return 1
})

global.cancelAnimationFrame = vi.fn()

describe('StarryParticles 组件', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应该正确渲染星空粒子容器', () => {
        render(<StarryParticles />)

        const container = screen.getByTestId('starry-particles')
        expect(container).toBeInTheDocument()
        expect(container).toHaveClass('fixed', 'inset-0', 'pointer-events-none', 'z-0')
    })

    it('应该渲染多个粒子元素', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        expect(particles.length).toBeGreaterThan(0)
    })

    it('应该为每个粒子应用正确的CSS类', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            expect(particle).toHaveClass(
                'absolute',
                'w-1',
                'h-1',
                'bg-white',
                'rounded-full',
                'animate-twinkle'
            )
        })
    })

    it('应该设置粒子的z-index为0', () => {
        render(<StarryParticles />)

        const container = screen.getByTestId('starry-particles')
        expect(container).toHaveStyle({ zIndex: '0' })
    })

    it('应该禁用粒子的指针事件', () => {
        render(<StarryParticles />)

        const container = screen.getByTestId('starry-particles')
        expect(container).toHaveClass('pointer-events-none')
    })

    it('应该为粒子设置随机位置', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            const style = particle.getAttribute('style')
            expect(style).toMatch(/left:\s*\d+%/)
            expect(style).toMatch(/top:\s*\d+%/)
        })
    })

    it('应该为粒子设置随机动画延迟', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            const style = particle.getAttribute('style')
            expect(style).toMatch(/animation-delay:\s*\d+ms/)
        })
    })

    it('应该生成指定数量的粒子', () => {
        const particleCount = 50
        render(<StarryParticles count={particleCount} />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        expect(particles).toHaveLength(particleCount)
    })

    it('应该使用默认粒子数量', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        // 默认应该是100个粒子
        expect(particles).toHaveLength(100)
    })

    it('应该为粒子设置正确的尺寸', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            expect(particle).toHaveClass('w-1', 'h-1')
        })
    })

    it('应该为粒子设置白色背景', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            expect(particle).toHaveClass('bg-white')
        })
    })

    it('应该为粒子设置圆形样式', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            expect(particle).toHaveClass('rounded-full')
        })
    })

    it('应该应用闪烁动画', () => {
        render(<StarryParticles />)

        const particles = screen.getAllByTestId(/particle-\d+/)
        particles.forEach(particle => {
            expect(particle).toHaveClass('animate-twinkle')
        })
    })
})
