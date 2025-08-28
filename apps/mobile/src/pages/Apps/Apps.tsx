import { homeConfig } from '@/config/env'
import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { Card, Grid } from 'antd-mobile'
import './Apps.css'

export default function Apps() {
    const { isMobile, isTablet } = useDeviceInfo()
    // 配置已直接导入

    const handleAppClick = (link: string) => {
        // TODO: 实现应用跳转逻辑
        console.log('跳转到应用:', link)
    }

    return (
        <div className={`apps-page ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
            <div className="page-container">
                <Card className="apps-card">
                    <h2 className="section-title">应用中心</h2>

                    <Grid columns={isMobile ? 4 : 6} gap={16}>
                        {homeConfig.quickActions.map((item: any) => {
                            // 这里可以根据 icon 字符串动态导入图标组件
                            return (
                                <Grid.Item key={item.id}>
                                    <div
                                        className="app-item"
                                        onClick={() => handleAppClick(item.link)}
                                    >
                                        <div
                                            className="app-icon"
                                            style={{
                                                backgroundColor: item.color,
                                                width: isMobile ? '48px' : '56px',
                                                height: isMobile ? '48px' : '56px',
                                            }}
                                        >
                                            {/* 这里应该渲染对应的图标 */}
                                            <span className="icon-placeholder">{item.title.charAt(0)}</span>
                                        </div>
                                        <div className="app-title">{item.title}</div>
                                        {item.badge && (
                                            <div className="app-badge">{item.badge}</div>
                                        )}
                                    </div>
                                </Grid.Item>
                            )
                        })}
                    </Grid>
                </Card>

                {/* 最近使用 */}
                <Card className="recent-apps-card">
                    <h3 className="section-title">最近使用</h3>
                    <div className="recent-apps">
                        {homeConfig.quickActions.slice(0, 4).map((item: any) => (
                            <div
                                key={`recent-${item.id}`}
                                className="recent-app-item"
                                onClick={() => handleAppClick(item.link)}
                            >
                                <div
                                    className="recent-app-icon"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <span className="icon-placeholder">{item.title.charAt(0)}</span>
                                </div>
                                <span className="recent-app-title">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 分类应用 */}
                <Card className="category-apps-card">
                    <h3 className="section-title">分类应用</h3>
                    <div className="category-list">
                        <div className="category-item">
                            <h4>办公工具</h4>
                            <div className="category-apps">
                                {homeConfig.quickActions.slice(0, 3).map((item: any) => (
                                    <span
                                        key={`office-${item.id}`}
                                        className="category-app-tag"
                                        onClick={() => handleAppClick(item.link)}
                                    >
                                        {item.title}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="category-item">
                            <h4>沟通协作</h4>
                            <div className="category-apps">
                                {homeConfig.quickActions.slice(3, 6).map((item: any) => (
                                    <span
                                        key={`comm-${item.id}`}
                                        className="category-app-tag"
                                        onClick={() => handleAppClick(item.link)}
                                    >
                                        {item.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
