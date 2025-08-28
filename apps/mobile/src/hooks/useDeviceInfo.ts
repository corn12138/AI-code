import { useEffect, useState } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  screenWidth: number
  screenHeight: number
  isLandscape: boolean
  isPortrait: boolean
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  pixelRatio: number
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop' as const,
        screenWidth: 1920,
        screenHeight: 1080,
        isLandscape: true,
        isPortrait: false,
        isTouchDevice: false,
        isIOS: false,
        isAndroid: false,
        pixelRatio: 1,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent.toLowerCase()
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const pixelRatio = window.devicePixelRatio || 1

    // 设备类型检测
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024 && isTouchDevice
    const isDesktop = width >= 1024 && !isTouchDevice

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
    if (isMobile) deviceType = 'mobile'
    else if (isTablet) deviceType = 'tablet'

    // 操作系统检测
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    // 屏幕方向
    const isLandscape = width > height
    const isPortrait = height > width

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType,
      screenWidth: width,
      screenHeight: height,
      isLandscape,
      isPortrait,
      isTouchDevice,
      isIOS,
      isAndroid,
      pixelRatio,
    }
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const pixelRatio = window.devicePixelRatio || 1

      // 设备类型检测
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024 && isTouchDevice
      const isDesktop = width >= 1024 && !isTouchDevice

      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (isMobile) deviceType = 'mobile'
      else if (isTablet) deviceType = 'tablet'

      // 操作系统检测
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)

      // 屏幕方向
      const isLandscape = width > height
      const isPortrait = height > width

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        screenWidth: width,
        screenHeight: height,
        isLandscape,
        isPortrait,
        isTouchDevice,
        isIOS,
        isAndroid,
        pixelRatio,
      })
    }

    // 监听窗口大小变化
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
