/**
 * 主题工具函数
 * 提供星空暗黑主题相关的工具函数
 */

export const themeUtils = {
    /**
     * 生成粒子位置
     */
    generateParticlePosition: (): { top: number; left: number } => {
        return {
            top: Math.random() * 100,
            left: Math.random() * 100
        }
    },

    /**
     * 生成动画延迟
     */
    generateAnimationDelay: (): number => {
        return Math.random() * 3
    },

    /**
     * 生成粒子大小
     */
    generateParticleSize: (): number => {
        return Math.random() * 2 + 0.5
    },

    /**
     * 生成粒子透明度
     */
    generateParticleOpacity: (): number => {
        return Math.random() * 0.8 + 0.2
    },

    /**
     * 生成粒子颜色
     */
    generateParticleColor: (): string => {
        const colors = ['#ffffff', '#8b5cf6', '#06b6d4', '#f59e0b']
        return colors[Math.floor(Math.random() * colors.length)]
    },

    /**
     * 生成渐变角度
     */
    generateGradientAngle: (): number => {
        return Math.random() * 360
    },

    /**
 * 生成CSS渐变字符串
 */
    generateGradientCSS: (colors: string[], angle: number = 45): string => {
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

    /**
     * 生成玻璃态效果CSS
     */
    generateGlassmorphismCSS: (opacity: number = 0.4) => {
        return {
            backgroundColor: `rgba(15, 23, 42, ${opacity})`,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px'
        }
    },

    /**
     * 生成阴影CSS
     */
    generateShadowCSS: (color: string = '#8b5cf6', opacity: number = 0.3): string => {
        return `0 0 20px rgba(139, 92, 246, ${opacity})`
    },

    /**
     * 生成动画关键帧
     */
    generateAnimationKeyframes: (name: string, keyframes: Record<string, any>): string => {
        const keyframeStrings = Object.entries(keyframes).map(([percentage, styles]) => {
            const styleStrings = Object.entries(styles).map(([property, value]) => `${property}: ${value}`).join('; ')
            return `${percentage} { ${styleStrings} }`
        }).join('\n')

        return `@keyframes ${name} {\n${keyframeStrings}\n}`
    },

    /**
     * 验证颜色格式
     */
    isValidColor: (color: string): boolean => {
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

    /**
     * 转换颜色格式
     */
    convertColorFormat: (color: string, targetFormat: 'rgb' | 'hex' | 'rgba'): string => {
        // 简单的转换实现
        if (color.startsWith('#') && targetFormat === 'rgb') {
            const hex = color.replace('#', '')
            const r = parseInt(hex.substr(0, 2), 16)
            const g = parseInt(hex.substr(2, 2), 16)
            const b = parseInt(hex.substr(4, 2), 16)
            return `rgb(${r}, ${g}, ${b})`
        }

        return color
    },

    /**
     * 生成星空背景CSS
     */
    generateStarryBackgroundCSS: (): string => {
        return 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)'
    },

    /**
     * 生成主题色彩
     */
    generateThemeColors: () => {
        return {
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
                950: '#020617'
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
                950: '#3b0764'
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
                950: '#083344'
            },
            stardust: {
                50: '#fffbeb',
                100: '#fef3c7',
                200: '#fde68a',
                300: '#fcd34d',
                400: '#fbbf24',
                500: '#f59e0b',
                600: '#d97706',
                700: '#b45309',
                800: '#92400e',
                900: '#78350f',
                950: '#451a03'
            }
        }
    }
}
