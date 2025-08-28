import { headerConfig } from '@/config/env'
import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { NavBar } from 'antd-mobile'
import { history, useLocation } from 'umi'
import './Header.css'

export default function Header() {
  const location = useLocation()
  const { isMobile } = useDeviceInfo()

  // 从配置中获取头部配置 - 已直接导入

  const title = headerConfig.pageTitles[location.pathname] || '移动端应用'
  const showBack = location.pathname !== '/' && headerConfig.backButton.show

  const handleBack = () => {
    if (window.history.length > 1) {
      history.back()
    } else {
      history.push('/')
    }
  }

  return (
    <div className={`header-container ${isMobile ? 'mobile' : ''}`}>
      <NavBar
        className="custom-navbar"
        onBack={showBack ? handleBack : undefined}
        style={headerConfig.style}
      >
        <span style={headerConfig.titleStyle}>{title}</span>
      </NavBar>
    </div>
  )
}
