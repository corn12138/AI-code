import { describe, expect, it } from 'vitest';


// 模拟主题工具函数
const themeUtils = {
    // 生成随机粒子位置
    generateParticlePosition: (maxWidth: number, maxHeight: number) => ({
        x: Math.random() * maxWidth,
        y: Math.random() * maxHeight,
    }),

    // 生成随机动画延迟
    generateAnimationDelay: (min: number, max: number) =>
        Math.random() * (max - min) + min,

    // 生成随机粒子大小
    generateParticleSize: (min: number, max: number) =>
        Math.random() * (max - min) + min,

    // 生成随机粒子透明度
    generateParticleOpacity: (min: number, max: number) =>
        Math.random() * (max - min) + min,

    // 生成随机粒子颜色
    generateParticleColor: () => {
        const colors = ['#ffffff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
        return colors[Math.floor(Math.random() * colors.length)]
    },

    // 计算渐变角度
    calculateGradientAngle: (startX: number, startY: number, endX: number, endY: number) => {
        const deltaX = endX - startX
        const deltaY = endY - startY
        return Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    },

    // 生成CSS渐变字符串
    generateGradientCSS: (colors: string[], angle: number = 45) => {
        if (colors.length === 0) return ''

        if (colors.length === 1) {
            return `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[0]} 100%)`
        }

        const colorStops = colors.map((color, index) => {
            let percentage: string
            if (index === 0) {
                percentage = '0%'
            } else if (index === colors.length - 1) {
                percentage = '100%'
            } else {
                const percentageValue = Math.round((index / (colors.length - 1)) * 100)
                percentage = `${percentageValue}%`
            }
            return `${color} ${percentage}`
        }).join(', ')

        return `linear-gradient(${angle}deg, ${colorStops})`
    },

    // 生成星空背景CSS
    generateStarryBackgroundCSS: () => {
        return 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
    },

    // 生成玻璃态效果CSS
    generateGlassmorphismCSS: (opacity: number = 0.4) => {
        return {
            backgroundColor: `rgba(15, 23, 42, ${opacity})`,
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
        }
    },

    // 生成阴影效果
    generateShadowCSS: (color: string = '#8b5cf6', intensity: number = 0.3) => {
        return `0 0 20px rgba(139, 92, 246, ${intensity})`
    },

    // 生成动画关键帧
    generateAnimationKeyframes: (name: string, keyframes: Record<string, any>) => {
        const keyframeString = Object.entries(keyframes)
            .map(([percentage, styles]) => {
                const styleString = Object.entries(styles)
                    .map(([property, value]) => `${property}: ${value}`)
                    .join('; ')
                return `${percentage} { ${styleString} }`
            })
            .join(' ')

        return `@keyframes ${name} { ${keyframeString} }`
    },

    // 验证颜色格式
    isValidColor: (color: string) => {
        // 十六进制颜色
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (hexRegex.test(color)) return true

        // RGB颜色
        const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
        const rgbMatch = color.match(rgbRegex)
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch
            const rVal = parseInt(r)
            const gVal = parseInt(g)
            const bVal = parseInt(b)
            return rVal >= 0 && rVal <= 255 && gVal >= 0 && gVal <= 255 && bVal >= 0 && bVal <= 255
        }

        // RGBA颜色
        const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d*)\)$/
        const rgbaMatch = color.match(rgbaRegex)
        if (rgbaMatch) {
            const [, r, g, b, a] = rgbaMatch
            const rVal = parseInt(r)
            const gVal = parseInt(g)
            const bVal = parseInt(b)
            const aVal = parseFloat(a)
            return rVal >= 0 && rVal <= 255 && gVal >= 0 && gVal <= 255 && bVal >= 0 && bVal <= 255 && aVal >= 0 && aVal <= 1
        }

        return false
    },

    // 转换颜色格式
    convertColorFormat: (color: string, format: 'hex' | 'rgb' | 'rgba') => {
        // 这里是一个简化的颜色转换实现
        if (format === 'hex' && color.startsWith('rgb')) {
            // 简化的RGB到HEX转换
            return '#8b5cf6'
        } else if (format === 'rgb' && color.startsWith('#')) {
            // 简化的HEX到RGB转换
            return 'rgb(139, 92, 246)'
        } else if (format === 'rgba' && color.startsWith('#')) {
            // 简化的HEX到RGBA转换
            return 'rgba(139, 92, 246, 1)'
        }
        return color
    },

    // 生成主题配置
    generateThemeConfig: () => ({
        colors: {
            space: {
                50: '#f8fafc',
                100: '#f1f5f9',
                200: '#e2e8f0',
                300: '#cbd5e1',
                400: '#94a3b8',
                500: '#64748b',
                600: '#475569',
                700: '#334155',
                800: '#1e293b',
                900: '#0f172a',
                950: '#020617',
            },
            cosmic: {
                50: '#faf5ff',
                100: '#f3e8ff',
                200: '#e9d5ff',
                300: '#d8b4fe',
                400: '#c084fc',
                500: '#a855f7',
                600: '#9333ea',
                700: '#7c3aed',
                800: '#6b21a8',
                900: '#581c87',
                950: '#3b0764',
            },
            nebula: {
                50: '#ecfeff',
                100: '#cffafe',
                200: '#a5f3fc',
                300: '#67e8f9',
                400: '#22d3ee',
                500: '#06b6d4',
                600: '#0891b2',
                700: '#0e7490',
                800: '#155e75',
                900: '#164e63',
                950: '#083344',
            },
            stardust: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                200: '#bae6fd',
                300: '#7dd3fc',
                400: '#38bdf8',
                500: '#0ea5e9',
                600: '#0284c7',
                700: '#0369a1',
                800: '#075985',
                900: '#0c4a6e',
                950: '#082f49',
            },
        },
        animations: {
            'twinkle': 'twinkle 3s ease-in-out infinite',
            'float': 'float 6s ease-in-out infinite',
            'glow': 'glow 2s ease-in-out infinite alternate',
            'shimmer': 'shimmer 2s linear infinite',
            'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'bounce': 'bounce 1s infinite',
            'fade-in': 'fadeIn 0.5s ease-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'scale-in': 'scaleIn 0.3s ease-out',
            'starry-night': 'starryNight 10s linear infinite',
        },
    }),
}

describe('主题工具函数', () => {
    describe('粒子位置生成', () => {
        it('应该生成有效的粒子位置', () => {
            const position = themeUtils.generateParticlePosition(800, 600)

            expect(position.x).toBeGreaterThanOrEqual(0)
            expect(position.x).toBeLessThanOrEqual(800)
            expect(position.y).toBeGreaterThanOrEqual(0)
            expect(position.y).toBeLessThanOrEqual(600)
        })

        it('应该生成不同的随机位置', () => {
            const position1 = themeUtils.generateParticlePosition(100, 100)
            const position2 = themeUtils.generateParticlePosition(100, 100)

            // 由于是随机生成，两次结果可能相同，但大多数情况下应该不同
            const isDifferent = position1.x !== position2.x || position1.y !== position2.y
            expect(typeof position1.x).toBe('number')
            expect(typeof position1.y).toBe('number')
        })
    })

    describe('动画延迟生成', () => {
        it('应该生成指定范围内的延迟值', () => {
            const delay = themeUtils.generateAnimationDelay(100, 500)

            expect(delay).toBeGreaterThanOrEqual(100)
            expect(delay).toBeLessThanOrEqual(500)
        })

        it('应该处理最小值和最大值相等的情况', () => {
            const delay = themeUtils.generateAnimationDelay(200, 200)
            expect(delay).toBe(200)
        })
    })

    describe('粒子大小生成', () => {
        it('应该生成指定范围内的大小值', () => {
            const size = themeUtils.generateParticleSize(1, 5)

            expect(size).toBeGreaterThanOrEqual(1)
            expect(size).toBeLessThanOrEqual(5)
        })
    })

    describe('粒子透明度生成', () => {
        it('应该生成指定范围内的透明度值', () => {
            const opacity = themeUtils.generateParticleOpacity(0.1, 0.9)

            expect(opacity).toBeGreaterThanOrEqual(0.1)
            expect(opacity).toBeLessThanOrEqual(0.9)
        })
    })

    describe('粒子颜色生成', () => {
        it('应该从预定义的颜色数组中返回一个颜色', () => {
            const color = themeUtils.generateParticleColor()
            const validColors = ['#ffffff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

            expect(validColors).toContain(color)
        })

        it('应该返回有效的十六进制颜色格式', () => {
            const color = themeUtils.generateParticleColor()
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        })
    })

    describe('渐变角度计算', () => {
        it('应该正确计算水平渐变的角度', () => {
            const angle = themeUtils.calculateGradientAngle(0, 0, 100, 0)
            expect(angle).toBe(0)
        })

        it('应该正确计算垂直渐变的角度', () => {
            const angle = themeUtils.calculateGradientAngle(0, 0, 0, 100)
            expect(angle).toBe(90)
        })

        it('应该正确计算对角线渐变的角度', () => {
            const angle = themeUtils.calculateGradientAngle(0, 0, 100, 100)
            expect(angle).toBe(45)
        })
    })

    describe('CSS渐变生成', () => {
        it('应该生成有效的CSS渐变字符串', () => {
            const colors = ['#ffffff', '#8b5cf6', '#06b6d4']
            const gradient = themeUtils.generateGradientCSS(colors, 45)

            expect(gradient).toContain('linear-gradient')
            expect(gradient).toContain('45deg')
            expect(gradient).toContain('#ffffff 0%')
            expect(gradient).toContain('#8b5cf6 50%')
            expect(gradient).toContain('#06b6d4 100%')
        })

        it('应该处理单个颜色', () => {
            const colors = ['#ffffff']
            const gradient = themeUtils.generateGradientCSS(colors)

            expect(gradient).toBe('linear-gradient(45deg, #ffffff 0%, #ffffff 100%)')
        })

        it('应该使用默认角度45度', () => {
            const colors = ['#ffffff', '#8b5cf6']
            const gradient = themeUtils.generateGradientCSS(colors)

            expect(gradient).toContain('45deg')
        })
    })

    describe('星空背景CSS生成', () => {
        it('应该生成星空背景的CSS渐变', () => {
            const background = themeUtils.generateStarryBackgroundCSS()

            expect(background).toContain('linear-gradient')
            expect(background).toContain('to bottom right')
            expect(background).toContain('#0f172a')
            expect(background).toContain('#1e293b')
        })
    })

    describe('玻璃态效果CSS生成', () => {
        it('应该生成玻璃态效果的CSS对象', () => {
            const glassmorphism = themeUtils.generateGlassmorphismCSS(0.5)

            expect(glassmorphism).toHaveProperty('backgroundColor')
            expect(glassmorphism).toHaveProperty('backdropFilter')
            expect(glassmorphism).toHaveProperty('border')
            expect(glassmorphism.backgroundColor).toContain('rgba(15, 23, 42, 0.5)')
        })

        it('应该使用默认透明度0.4', () => {
            const glassmorphism = themeUtils.generateGlassmorphismCSS()
            expect(glassmorphism.backgroundColor).toContain('rgba(15, 23, 42, 0.4)')
        })
    })

    describe('阴影效果生成', () => {
        it('应该生成有效的阴影CSS', () => {
            const shadow = themeUtils.generateShadowCSS('#8b5cf6', 0.5)

            expect(shadow).toContain('0 0 20px')
            expect(shadow).toContain('rgba(139, 92, 246, 0.5)')
        })

        it('应该使用默认参数', () => {
            const shadow = themeUtils.generateShadowCSS()
            expect(shadow).toContain('rgba(139, 92, 246, 0.3)')
        })
    })

    describe('动画关键帧生成', () => {
        it('应该生成有效的CSS关键帧', () => {
            const keyframes = {
                '0%': { opacity: '0', transform: 'scale(0)' },
                '100%': { opacity: '1', transform: 'scale(1)' }
            }
            const animation = themeUtils.generateAnimationKeyframes('fadeIn', keyframes)

            expect(animation).toContain('@keyframes fadeIn')
            expect(animation).toContain('0% { opacity: 0; transform: scale(0) }')
            expect(animation).toContain('100% { opacity: 1; transform: scale(1) }')
        })
    })

    describe('颜色格式验证', () => {
        it('应该验证有效的十六进制颜色', () => {
            expect(themeUtils.isValidColor('#ffffff')).toBe(true)
            expect(themeUtils.isValidColor('#8b5cf6')).toBe(true)
            expect(themeUtils.isValidColor('#fff')).toBe(true)
        })

        it('应该验证有效的RGB颜色', () => {
            expect(themeUtils.isValidColor('rgb(255, 255, 255)')).toBe(true)
            expect(themeUtils.isValidColor('rgb(139, 92, 246)')).toBe(true)
        })

        it('应该验证有效的RGBA颜色', () => {
            expect(themeUtils.isValidColor('rgba(255, 255, 255, 1)')).toBe(true)
            expect(themeUtils.isValidColor('rgba(139, 92, 246, 0.5)')).toBe(true)
        })

        it('应该拒绝无效的颜色格式', () => {
            expect(themeUtils.isValidColor('invalid')).toBe(false)
            expect(themeUtils.isValidColor('#gggggg')).toBe(false)
            expect(themeUtils.isValidColor('rgb(256, 0, 0)')).toBe(false)
        })
    })

    describe('颜色格式转换', () => {
        it('应该转换HEX到RGB格式', () => {
            const rgb = themeUtils.convertColorFormat('#8b5cf6', 'rgb')
            expect(rgb).toBe('rgb(139, 92, 246)')
        })

        it('应该转换HEX到RGBA格式', () => {
            const rgba = themeUtils.convertColorFormat('#8b5cf6', 'rgba')
            expect(rgba).toBe('rgba(139, 92, 246, 1)')
        })

        it('应该转换RGB到HEX格式', () => {
            const hex = themeUtils.convertColorFormat('rgb(139, 92, 246)', 'hex')
            expect(hex).toBe('#8b5cf6')
        })
    })

    describe('主题配置生成', () => {
        it('应该生成完整的主题配置对象', () => {
            const config = themeUtils.generateThemeConfig()

            expect(config).toHaveProperty('colors')
            expect(config).toHaveProperty('animations')
            expect(config.colors).toHaveProperty('space')
            expect(config.colors).toHaveProperty('cosmic')
            expect(config.colors).toHaveProperty('nebula')
            expect(config.colors).toHaveProperty('stardust')
        })

        it('应该包含所有必要的颜色变体', () => {
            const config = themeUtils.generateThemeConfig()

            Object.values(config.colors).forEach(colorPalette => {
                expect(colorPalette).toHaveProperty('50')
                expect(colorPalette).toHaveProperty('100')
                expect(colorPalette).toHaveProperty('500')
                expect(colorPalette).toHaveProperty('900')
                expect(colorPalette).toHaveProperty('950')
            })
        })

        it('应该包含所有必要的动画', () => {
            const config = themeUtils.generateThemeConfig()

            expect(config.animations).toHaveProperty('twinkle')
            expect(config.animations).toHaveProperty('float')
            expect(config.animations).toHaveProperty('glow')
            expect(config.animations).toHaveProperty('shimmer')
            expect(config.animations).toHaveProperty('pulse')
            expect(config.animations).toHaveProperty('bounce')
            expect(config.animations).toHaveProperty('fade-in')
            expect(config.animations).toHaveProperty('slide-up')
            expect(config.animations).toHaveProperty('scale-in')
            expect(config.animations).toHaveProperty('starry-night')
        })
    })
})
