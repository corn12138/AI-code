import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { Button, Space } from 'antd-mobile'
import { history } from 'umi'
import './NotFound.css'

export default function NotFound() {
    const { isMobile, isTablet } = useDeviceInfo()

    const handleGoHome = () => {
        history.push('/')
    }

    const handleGoBack = () => {
        if (window.history.length > 1) {
            history.back()
        } else {
            history.push('/')
        }
    }

    return (
        <div className={`not-found-page ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
            <div className="not-found-container">
                <div className="not-found-content">
                    {/* 404 图标 */}
                    <div className="error-icon">
                        <div className="error-number">404</div>
                        <div className="error-emoji">😵</div>
                    </div>

                    {/* 错误信息 */}
                    <div className="error-info">
                        <h2 className="error-title">页面不存在</h2>
                        <p className="error-description">
                            抱歉，您访问的页面可能已被删除、重命名或暂时不可用。
                        </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="error-actions">
                        <Space direction="vertical" block>
                            <Button
                                color="primary"
                                size="large"
                                block
                                onClick={handleGoHome}
                            >
                                返回首页
                            </Button>
                            <Button
                                size="large"
                                block
                                onClick={handleGoBack}
                            >
                                返回上页
                            </Button>
                        </Space>
                    </div>

                    {/* 建议操作 */}
                    <div className="error-suggestions">
                        <h3 className="suggestions-title">您可以尝试：</h3>
                        <ul className="suggestions-list">
                            <li>检查网址是否正确</li>
                            <li>返回上一页面</li>
                            <li>访问首页重新导航</li>
                            <li>稍后再试</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
