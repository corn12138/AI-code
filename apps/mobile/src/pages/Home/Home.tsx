import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import nativeBridge from '@/utils/nativeBridge'
import { Button, Card, Grid, Space } from 'antd-mobile'
import { useEffect, useState } from 'react'
import './Home.css'

interface EnvironmentInfo {
  platform: string
  isNative: boolean
  version: string
  model: string
  appVersion: string
}

export default function Home() {
  const { isMobile, isTablet, deviceType } = useDeviceInfo()
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null)

  useEffect(() => {
    // 获取环境信息
    const getEnvironmentInfo = async () => {
      try {
        const deviceInfo = await nativeBridge.getDeviceInfo()
        setEnvInfo({
          platform: deviceInfo.platform,
          isNative: nativeBridge.isNative,
          version: deviceInfo.version,
          model: deviceInfo.model,
          appVersion: deviceInfo.appVersion
        })
      } catch (error) {
        console.error('Failed to get device info:', error)
        setEnvInfo({
          platform: 'web',
          isNative: false,
          version: 'unknown',
          model: 'browser',
          appVersion: '1.0.0'
        })
      }
    }

    getEnvironmentInfo()
  }, [])

  const handleTestNativeFeature = async (feature: string) => {
    switch (feature) {
      case 'toast':
        nativeBridge.showToast(`这是来自${envInfo?.platform || 'web'}的Toast消息`)
        break
      case 'alert':
        await nativeBridge.showAlert('原生弹窗', '这是通过原生Bridge调用的弹窗')
        break
      case 'confirm':
        const result = await nativeBridge.showConfirm('确认操作', '你确定要执行这个操作吗？')
        nativeBridge.showToast(result ? '用户确认' : '用户取消')
        break
      case 'storage':
        await nativeBridge.setStorage('test_key', { message: 'Hello from H5', timestamp: Date.now() })
        const stored = await nativeBridge.getStorage('test_key')
        nativeBridge.showToast(`存储测试: ${stored?.message}`)
        break
      case 'network':
        try {
          const networkStatus = await nativeBridge.getNetworkStatus()
          nativeBridge.showToast(`网络状态: ${networkStatus.isConnected ? '已连接' : '未连接'} (${networkStatus.connectionType})`)
        } catch (error) {
          nativeBridge.showToast('网络状态检测失败')
        }
        break
      default:
        nativeBridge.showToast(`测试功能: ${feature}`)
    }
  }

  return (
    <div className={`home ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <div className="responsive-container">
        {/* 欢迎卡片 */}
        <Card className="welcome-card">
          <div className="welcome-content">
            <h2>欢迎使用工作台</h2>
            <p>这是一个现代化的移动端应用，支持原生容器和Web环境</p>
          </div>
        </Card>

        {/* 环境信息卡片 */}
        <Card title="运行环境" className="env-card">
          <div className="env-info">
            {envInfo ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="env-item">
                  <span className="label">平台:</span>
                  <span className={`value platform-${envInfo.platform}`}>
                    {envInfo.platform.toUpperCase()}
                    {envInfo.isNative && <span className="native-badge">原生容器</span>}
                  </span>
                </div>
                <div className="env-item">
                  <span className="label">设备类型:</span>
                  <span className="value">{deviceType}</span>
                </div>
                <div className="env-item">
                  <span className="label">系统版本:</span>
                  <span className="value">{envInfo.version}</span>
                </div>
                <div className="env-item">
                  <span className="label">设备型号:</span>
                  <span className="value">{envInfo.model}</span>
                </div>
                <div className="env-item">
                  <span className="label">应用版本:</span>
                  <span className="value">{envInfo.appVersion}</span>
                </div>
              </Space>
            ) : (
              <div className="loading">正在获取环境信息...</div>
            )}
          </div>
        </Card>

        {/* 调试工具卡片 */}
        <Card title="调试工具" className="debug-card">
          <Grid columns={2} gap={12}>
            <Grid.Item>
              <Button
                block
                color="success"
                onClick={() => {
                  if ((window as any).vConsole) {
                    console.log('vConsole 已可用!')
                    console.log('当前时间:', new Date().toLocaleString())
                    console.log('页面信息:', {
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                      }
                    })
                  } else {
                    console.log('vConsole 不可用')
                  }
                }}
              >
                测试 vConsole
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button
                block
                color="primary"
                onClick={() => {
                  console.log('这是一条测试日志')
                  console.warn('这是一条警告日志')
                  console.error('这是一条错误日志')
                  console.info('这是一条信息日志')
                }}
              >
                生成测试日志
              </Button>
            </Grid.Item>
          </Grid>
        </Card>

        {/* 功能测试卡片 */}
        <Card title="原生功能测试" className="test-card">
          <Grid columns={2} gap={12}>
            <Grid.Item>
              <Button
                block
                color="primary"
                onClick={() => handleTestNativeFeature('toast')}
              >
                Toast 消息
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button
                block
                color="primary"
                onClick={() => handleTestNativeFeature('alert')}
              >
                Alert 弹窗
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button
                block
                color="primary"
                onClick={() => handleTestNativeFeature('confirm')}
              >
                Confirm 确认
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button
                block
                color="primary"
                onClick={() => handleTestNativeFeature('storage')}
              >
                存储测试
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button
                block
                color="primary"
                onClick={() => handleTestNativeFeature('network')}
              >
                网络状态
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button
                block
                color="primary"
                disabled={!envInfo?.isNative}
                onClick={() => handleTestNativeFeature('camera')}
              >
                相机功能
              </Button>
            </Grid.Item>
          </Grid>
        </Card>

        {/* 快捷入口 */}
        <Card title="快捷入口" className="shortcuts-card">
          <Grid columns={3} gap={16}>
            <Grid.Item>
              <div className="shortcut-item">
                <div className="shortcut-icon">📊</div>
                <div className="shortcut-title">数据看板</div>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div className="shortcut-item">
                <div className="shortcut-icon">📋</div>
                <div className="shortcut-title">任务管理</div>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div className="shortcut-item">
                <div className="shortcut-icon">👥</div>
                <div className="shortcut-title">团队协作</div>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div className="shortcut-item">
                <div className="shortcut-icon">📈</div>
                <div className="shortcut-title">业绩统计</div>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div className="shortcut-item">
                <div className="shortcut-icon">⚙️</div>
                <div className="shortcut-title">系统设置</div>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div className="shortcut-item">
                <div className="shortcut-icon">❓</div>
                <div className="shortcut-title">帮助中心</div>
              </div>
            </Grid.Item>
          </Grid>
        </Card>
      </div>
    </div>
  )
}