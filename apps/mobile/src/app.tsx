import { ConfigProvider } from 'antd-mobile'
import zhCN from 'antd-mobile/es/locales/zh-CN'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import ToastContainer from './components/Toast/ToastContainer'
import { appConfig } from './config/env'
import { TaskProcessProvider } from './stores/taskProcessStore'

// 全局样式
import './index.css'

// vConsole 移动端调试工具 - 在开发环境中总是启用
console.log('环境检查:', {
  isDev: appConfig.isDev,
  enableVConsole: appConfig.enableVConsole,
  nodeEnv: process.env.NODE_ENV
})

if (appConfig.isDev) {
  console.log('正在加载 vConsole...')
  import('vconsole').then(VConsole => {
    const vConsole = new VConsole.default({
      defaultPlugins: ['system', 'network', 'element', 'storage'],
      theme: 'light',
      onReady: () => {
        console.log('vConsole 初始化完成')
      }
    })

      // 添加到全局对象，方便调试
      ; (window as any).vConsole = vConsole

    console.log('vConsole 已启用并挂载到 window.vConsole')
  }).catch(error => {
    console.error('vConsole 加载失败:', error)
  })
} else {
  console.log('非开发环境，跳过 vConsole 加载')
}

// 全局 wrapper - 包装所有页面
export function rootContainer(container: any) {
  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={{
          '--adm-color-background': '#f5f5f5',
          '--adm-color-background-light': '#ffffff',
          '--adm-color-text': '#333333',
          '--adm-color-text-secondary': '#666666'
        }}
      >
        <TaskProcessProvider>
          {container}
          <ToastContainer />
        </TaskProcessProvider>
      </ConfigProvider>
    </ErrorBoundary>
  )
}
