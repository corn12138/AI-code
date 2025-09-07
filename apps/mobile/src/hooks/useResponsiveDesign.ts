/**
 * 响应式设计Hook
 * 提供设备检测、屏幕适配、安全区域处理等功能
 */

import { useCallback, useEffect, useState } from 'react'

export interface ViewportInfo {
    width: number
    height: number
    aspectRatio: number
    orientation: 'portrait' | 'landscape'
    deviceType: 'phone' | 'tablet' | 'desktop'
    isSmallScreen: boolean
    isMediumScreen: boolean
    isLargeScreen: boolean
}

export interface SafeAreaInsets {
    top: number
    right: number
    bottom: number
    left: number
}

export interface DeviceFeatures {
    hasNotch: boolean // 是否有刘海屏
    hasDynamicIsland: boolean // 是否有灵动岛
    supportsSafeArea: boolean // 是否支持安全区域
    supportsHover: boolean // 是否支持悬停
    supportsTouch: boolean // 是否支持触摸
    prefersReducedMotion: boolean // 是否偏好减少动画
    prefersColorScheme: 'light' | 'dark' | 'no-preference'
}

/**
 * 响应式设计Hook
 * 
 * TODO: CSS优化预留接口 - 现代响应式设计支持
 * 
 * 功能说明：
 * 1. 设备类型检测（手机、平板、桌面）
 * 2. 屏幕方向检测（横屏、竖屏）
 * 3. 安全区域处理（刘海屏、灵动岛适配）
 * 4. 现代CSS特性检测
 * 5. 用户偏好设置检测
 * 
 * 适配策略：
 * - 手机端：单列布局，底部导航
 * - 平板端：双列布局，侧边导航
 * - 横屏模式：调整布局比例，优化空间利用
 * - 刘海屏：避开安全区域，调整顶部间距
 * - 灵动岛：适配新的安全区域规范
 */
export const useResponsiveDesign = () => {
    const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
        aspectRatio: window.innerWidth / window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        deviceType: getDeviceType(window.innerWidth),
        isSmallScreen: window.innerWidth < 768,
        isMediumScreen: window.innerWidth >= 768 && window.innerWidth < 1024,
        isLargeScreen: window.innerWidth >= 1024
    }))

    const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>(() => ({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }))

    const [deviceFeatures, setDeviceFeatures] = useState<DeviceFeatures>(() => ({
        hasNotch: false,
        hasDynamicIsland: false,
        supportsSafeArea: CSS.supports('padding-top', 'env(safe-area-inset-top)'),
        supportsHover: window.matchMedia('(hover: hover)').matches,
        supportsTouch: 'ontouchstart' in window,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersColorScheme: getPreferredColorScheme()
    }))

    // 获取设备类型
    function getDeviceType(width: number): 'phone' | 'tablet' | 'desktop' {
        if (width < 768) return 'phone'
        if (width < 1024) return 'tablet'
        return 'desktop'
    }

    // 获取用户偏好的颜色方案
    function getPreferredColorScheme(): 'light' | 'dark' | 'no-preference' {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
        if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
        return 'no-preference'
    }

    // 检测刘海屏和灵动岛
    const detectNotchAndDynamicIsland = useCallback(() => {
        // 通过CSS环境变量检测安全区域
        const testElement = document.createElement('div')
        testElement.style.position = 'fixed'
        testElement.style.top = 'env(safe-area-inset-top, 0px)'
        testElement.style.left = 'env(safe-area-inset-left, 0px)'
        testElement.style.visibility = 'hidden'
        document.body.appendChild(testElement)

        const computedStyle = window.getComputedStyle(testElement)
        const topInset = parseInt(computedStyle.top) || 0
        const leftInset = parseInt(computedStyle.left) || 0
        const rightInset = parseInt(computedStyle.right) || 0
        const bottomInset = parseInt(computedStyle.bottom) || 0

        document.body.removeChild(testElement)

        // 更新安全区域信息
        setSafeAreaInsets({
            top: topInset,
            left: leftInset,
            right: rightInset,
            bottom: bottomInset
        })

        // 检测是否有刘海屏或灵动岛
        const hasNotch = topInset > 20 // 一般刘海屏的顶部安全区域大于20px
        const hasDynamicIsland = topInset > 40 && window.innerWidth >= 390 // iPhone 14 Pro系列的灵动岛

        setDeviceFeatures(prev => ({
            ...prev,
            hasNotch,
            hasDynamicIsland
        }))
    }, [])

    // 更新视口信息
    const updateViewportInfo = useCallback(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        const aspectRatio = width / height
        const orientation = width > height ? 'landscape' : 'portrait'
        const deviceType = getDeviceType(width)

        setViewportInfo({
            width,
            height,
            aspectRatio,
            orientation,
            deviceType,
            isSmallScreen: width < 768,
            isMediumScreen: width >= 768 && width < 1024,
            isLargeScreen: width >= 1024
        })

        // 重新检测安全区域
        detectNotchAndDynamicIsland()
    }, [detectNotchAndDynamicIsland])

    // 获取响应式类名
    const getResponsiveClassName = useCallback((baseClass: string) => {
        const { deviceType, orientation, isSmallScreen, isMediumScreen, isLargeScreen } = viewportInfo
        const { hasNotch, hasDynamicIsland } = deviceFeatures

        const classNames = [baseClass]

        // 设备类型
        classNames.push(`${baseClass}--${deviceType}`)

        // 屏幕方向
        classNames.push(`${baseClass}--${orientation}`)

        // 屏幕尺寸
        if (isSmallScreen) classNames.push(`${baseClass}--small`)
        if (isMediumScreen) classNames.push(`${baseClass}--medium`)
        if (isLargeScreen) classNames.push(`${baseClass}--large`)

        // 特殊特性
        if (hasNotch) classNames.push(`${baseClass}--notch`)
        if (hasDynamicIsland) classNames.push(`${baseClass}--dynamic-island`)

        return classNames.join(' ')
    }, [viewportInfo, deviceFeatures])

    // 获取安全区域样式
    const getSafeAreaStyles = useCallback((options: {
        top?: boolean
        right?: boolean
        bottom?: boolean
        left?: boolean
        fallback?: number
    } = {}) => {
        const { top = true, right = true, bottom = true, left = true, fallback = 0 } = options
        const styles: React.CSSProperties = {}

        if (deviceFeatures.supportsSafeArea) {
            // 使用CSS环境变量
            if (top) styles.paddingTop = `max(${fallback}px, env(safe-area-inset-top))`
            if (right) styles.paddingRight = `max(${fallback}px, env(safe-area-inset-right))`
            if (bottom) styles.paddingBottom = `max(${fallback}px, env(safe-area-inset-bottom))`
            if (left) styles.paddingLeft = `max(${fallback}px, env(safe-area-inset-left))`
        } else {
            // 降级处理
            if (top && safeAreaInsets.top) styles.paddingTop = Math.max(fallback, safeAreaInsets.top)
            if (right && safeAreaInsets.right) styles.paddingRight = Math.max(fallback, safeAreaInsets.right)
            if (bottom && safeAreaInsets.bottom) styles.paddingBottom = Math.max(fallback, safeAreaInsets.bottom)
            if (left && safeAreaInsets.left) styles.paddingLeft = Math.max(fallback, safeAreaInsets.left)
        }

        return styles
    }, [deviceFeatures.supportsSafeArea, safeAreaInsets])

    // 获取媒体查询结果
    const matchMedia = useCallback((query: string) => {
        return window.matchMedia(query).matches
    }, [])

    // 检查是否支持CSS特性
    const supportsCSS = useCallback((property: string, value: string) => {
        return CSS.supports(property, value)
    }, [])

    // 获取容器查询样式（如果支持）
    const getContainerQueryStyles = useCallback(() => {
        if (supportsCSS('container-type', 'inline-size')) {
            return {
                containerType: 'inline-size',
                containerName: 'responsive-container'
            } as React.CSSProperties
        }
        return {}
    }, [supportsCSS])

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            updateViewportInfo()
        }

        const handleOrientationChange = () => {
            // 延迟处理方向变化，因为某些设备需要时间更新viewport
            setTimeout(updateViewportInfo, 100)
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleOrientationChange)

        // 监听媒体查询变化
        const mediaQueries = [
            window.matchMedia('(prefers-color-scheme: dark)'),
            window.matchMedia('(prefers-reduced-motion: reduce)'),
            window.matchMedia('(hover: hover)')
        ]

        const handleMediaQueryChange = () => {
            setDeviceFeatures(prev => ({
                ...prev,
                prefersColorScheme: getPreferredColorScheme(),
                prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                supportsHover: window.matchMedia('(hover: hover)').matches
            }))
        }

        mediaQueries.forEach(mq => {
            mq.addEventListener('change', handleMediaQueryChange)
        })

        // 初始化检测
        detectNotchAndDynamicIsland()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleOrientationChange)
            mediaQueries.forEach(mq => {
                mq.removeEventListener('change', handleMediaQueryChange)
            })
        }
    }, [updateViewportInfo, detectNotchAndDynamicIsland])

    return {
        // 视口信息
        viewportInfo,
        safeAreaInsets,
        deviceFeatures,

        // 工具方法
        getResponsiveClassName,
        getSafeAreaStyles,
        getContainerQueryStyles,
        matchMedia,
        supportsCSS,

        // 便捷属性
        isPhone: viewportInfo.deviceType === 'phone',
        isTablet: viewportInfo.deviceType === 'tablet',
        isDesktop: viewportInfo.deviceType === 'desktop',
        isPortrait: viewportInfo.orientation === 'portrait',
        isLandscape: viewportInfo.orientation === 'landscape',
        isSmallScreen: viewportInfo.isSmallScreen,
        isMediumScreen: viewportInfo.isMediumScreen,
        isLargeScreen: viewportInfo.isLargeScreen,
        hasNotch: deviceFeatures.hasNotch,
        hasDynamicIsland: deviceFeatures.hasDynamicIsland,
        isDarkMode: deviceFeatures.prefersColorScheme === 'dark',
        prefersReducedMotion: deviceFeatures.prefersReducedMotion
    }
}

export default useResponsiveDesign
