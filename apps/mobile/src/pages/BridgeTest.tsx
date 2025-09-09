import { Button, Card, List, NavBar, Space, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { nativeBridge } from '@/utils/nativeBridge'
import { safeBack } from '@/utils/nav'

const BridgeTest: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [clipboardText, setClipboardText] = useState<string>('')

  useEffect(() => {
    nativeBridge.getDeviceInfo().then(setDeviceInfo).catch(() => {})
    nativeBridge.getNetworkStatus().then(setNetworkInfo).catch(() => {})

    const offDeep = nativeBridge.addEventListener('deepLink', (data) => {
      Toast.show({ content: `收到 deepLink: ${data?.url || ''}` })
    })
    const offImg = nativeBridge.addEventListener('imagePicked', (data) => {
      Toast.show({ content: `imagePicked: ${data?.items?.length || 0} 张` })
    })
    const offFiles = nativeBridge.addEventListener('filesPicked', (data) => {
      Toast.show({ content: `filesPicked: ${data?.items?.length || 0} 个` })
    })
    return () => { offDeep(); offImg(); offFiles() }
  }, [])

  const rows: Array<{ key: string; action: () => void | Promise<void> }> = [
    {
      key: '复制到剪贴板',
      action: async () => {
        await nativeBridge.copyToClipboard('Hello from H5')
        Toast.show({ content: '已复制: Hello from H5' })
      },
    },
    {
      key: '读取剪贴板文本',
      action: async () => {
        const text = await nativeBridge.getClipboardText()
        setClipboardText(text || '')
        Toast.show({ content: `剪贴板: ${text || '(空)'}` })
      },
    },
    {
      key: '系统分享',
      action: async () => {
        await nativeBridge.share({ title: '分享标题', text: '来自 Hybrid H5 的分享', url: location.href })
      },
    },
    {
      key: '文件选择（图片）',
      action: async () => {
        const files = await nativeBridge.openFilePicker('image/*', true)
        Toast.show({ content: `已选择 ${files.length} 个文件` })
      },
    },
    {
      key: '打开相机拍照',
      action: async () => {
        try {
          const img = await nativeBridge.openCamera()
          Toast.show({ content: `拍照完成: ${String(img).slice(0, 24)}...` })
        } catch (e) {
          Toast.show({ content: '相机不可用或取消' })
        }
      },
    },
    {
      key: '震动反馈',
      action: async () => {
        await nativeBridge.vibrate(80)
        Toast.show({ content: '已震动' })
      },
    },
    {
      key: '设置导航栏标题',
      action: async () => {
        await nativeBridge.setNavBar({ title: 'Hybrid Demo', showBack: true })
        Toast.show({ content: '已请求原生设置标题' })
      },
    },
    {
      key: '打开深链 myapp://settings',
      action: async () => {
        await nativeBridge.openDeepLink('myapp://settings')
      },
    },
    {
      key: '关闭 WebView',
      action: async () => {
        await nativeBridge.closeWebView()
      },
    },
    {
      key: '获取设备信息',
      action: async () => {
        const info = await nativeBridge.getDeviceInfo()
        setDeviceInfo(info)
        Toast.show({ content: '已获取设备信息' })
      },
    },
    {
      key: '获取网络状态',
      action: async () => {
        const info = await nativeBridge.getNetworkStatus()
        setNetworkInfo(info)
        Toast.show({ content: '已获取网络状态' })
      },
    },
  ]

  return (
    <div>
      <NavBar onBack={() => safeBack()}>桥接能力演示</NavBar>

      <div className="p-4 space-y-4">
        <Card>
          <Card.Header title="环境" />
          <Card.Body>
            <div className="text-sm text-gray-600">平台: {nativeBridge.getPlatform()}</div>
            <div className="text-sm text-gray-600">原生环境: {String(nativeBridge.isNativeEnvironment())}</div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="常用能力" />
          <Card.Body>
            <List>
              {rows.map((r) => (
                <List.Item key={r.key} onClick={() => r.action()}>
                  {r.key}
                </List.Item>
              ))}
            </List>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="当前信息" />
          <Card.Body>
            <Space direction="vertical" block>
              <div className="text-sm">剪贴板: {clipboardText || '(空)'}</div>
              <div className="text-sm">设备: {deviceInfo ? JSON.stringify(deviceInfo) : '未获取'}</div>
              <div className="text-sm">网络: {networkInfo ? JSON.stringify(networkInfo) : '未获取'}</div>
            </Space>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default BridgeTest
