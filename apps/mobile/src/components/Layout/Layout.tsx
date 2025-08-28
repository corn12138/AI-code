import { tabBarConfig } from '@/config/env'
import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { useUIStore } from '@/stores/ui/useUIStore'
import { Mask, SpinLoading, TabBar } from 'antd-mobile'
import { useEffect } from 'react'
import { history, Outlet, useLocation } from 'umi'
import Header from './Header'
import './Layout.css'

export default function Layout() {
  const location = useLocation()
  const { isMobile, isTablet, deviceType } = useDeviceInfo()
  const { globalLoading, loadingText } = useUIStore()

  // 从配置中获取 Tab 配置 - 已直接导入

  useEffect(() => {
    // 根据设备类型添加相应的类名
    document.body.className = `device-${deviceType} ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`

    // 移动端优化
    if (isMobile) {
      // 禁用双击缩放
      document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
          event.preventDefault()
        }
      }, { passive: false })

      let lastTouchEnd = 0
      document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      }, { passive: false })
    }
  }, [isMobile, isTablet, deviceType])

  const handleTabChange = (key: string) => {
    history.push(key)
  }

  return (
    <div className={`layout ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {/* 头部 */}
      <Header />

      {/* 主内容区域 */}
      <main className="layout-content">
        <div className="responsive-container">
          <Outlet />
        </div>
      </main>

      {/* 底部导航栏 */}
      <div className="layout-tabbar">
        <TabBar
          activeKey={location.pathname}
          onChange={handleTabChange}
          className="custom-tabbar"
          style={tabBarConfig.style}
        >
          {tabBarConfig.tabs.map(item => {
            const IconComponent = location.pathname === item.key ? item.activeIcon : item.icon
            return (
              <TabBar.Item
                key={item.key}
                icon={IconComponent ? <IconComponent /> : null}
                title={item.title}
                badge={item.badge}
              />
            )
          })}
        </TabBar>
      </div>

      {/* 全局加载遮罩 */}
      <Mask visible={globalLoading} opacity={0.5}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <SpinLoading color="#ffffff" style={{ fontSize: 48 }} />
          <div style={{ marginTop: 12, fontSize: 16 }}>{loadingText}</div>
        </div>
      </Mask>
    </div>
  )
}