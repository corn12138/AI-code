import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import {
    Button,
    Card,
    List,
    Modal,
    Selector,
    Space,
    Switch,
    Toast
} from 'antd-mobile'
import {
    BellOutline,
    DeleteOutline,
    ExclamationCircleOutline,
    EyeInvisibleOutline,
    GlobalOutline,
    MoonOutline,
    RightOutline,
    SoundOutline
} from 'antd-mobile-icons'
import { useState } from 'react'
import './Settings.css'

const languageOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: '繁體中文', value: 'zh-TW' },
    { label: '日本語', value: 'ja-JP' }
]

const themeOptions = [
    { label: '跟随系统', value: 'auto' },
    { label: '浅色模式', value: 'light' },
    { label: '深色模式', value: 'dark' }
]

export default function Settings() {
    const { isMobile, isTablet } = useDeviceInfo()

    // 设置状态
    const [notifications, setNotifications] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [language, setLanguage] = useState(['zh-CN'])
    const [theme, setTheme] = useState(['auto'])
    const [privacyMode, setPrivacyMode] = useState(false)

    const handleClearCache = () => {
        Modal.confirm({
            title: '清除缓存',
            content: '确定要清除所有缓存数据吗？这将会重新加载应用。',
            onConfirm: () => {
                // TODO: 实现清除缓存功能
                Toast.show({
                    icon: 'success',
                    content: '缓存已清除',
                })
            }
        })
    }

    const handleResetSettings = () => {
        Modal.confirm({
            title: '重置设置',
            content: '确定要重置所有设置到默认状态吗？',
            onConfirm: () => {
                setNotifications(true)
                setSoundEnabled(true)
                setDarkMode(false)
                setLanguage(['zh-CN'])
                setTheme(['auto'])
                setPrivacyMode(false)
                Toast.show({
                    icon: 'success',
                    content: '设置已重置',
                })
            }
        })
    }

    const handleAbout = () => {
        Modal.alert({
            title: '关于应用',
            content: (
                <div className="about-content">
                    <p><strong>应用名称：</strong>移动端应用</p>
                    <p><strong>版本号：</strong>v1.0.0</p>
                    <p><strong>构建时间：</strong>2024-01-15</p>
                    <p><strong>技术栈：</strong>React + Vite + antd-mobile</p>
                </div>
            )
        })
    }

    return (
        <div className={`settings-page ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
            <div className="content-container">
                {/* 通知设置 */}
                <Card title="通知设置" className="settings-section">
                    <List>
                        <List.Item
                            prefix={<BellOutline />}
                            extra={
                                <Switch
                                    checked={notifications}
                                    onChange={setNotifications}
                                />
                            }
                            description="接收应用推送通知"
                        >
                            推送通知
                        </List.Item>
                        <List.Item
                            prefix={<SoundOutline />}
                            extra={
                                <Switch
                                    checked={soundEnabled}
                                    onChange={setSoundEnabled}
                                    disabled={!notifications}
                                />
                            }
                            description="通知声音提醒"
                        >
                            声音提醒
                        </List.Item>
                    </List>
                </Card>

                {/* 显示设置 */}
                <Card title="显示设置" className="settings-section">
                    <List>
                        <List.Item
                            prefix={<MoonOutline />}
                            extra={
                                <Switch
                                    checked={darkMode}
                                    onChange={setDarkMode}
                                />
                            }
                            description="开启深色模式"
                        >
                            深色模式
                        </List.Item>
                    </List>

                    <div className="selector-item">
                        <div className="selector-label">
                            <GlobalOutline />
                            <span>主题模式</span>
                        </div>
                        <Selector
                            options={themeOptions}
                            value={theme}
                            onChange={setTheme}
                            columns={3}
                        />
                    </div>
                </Card>

                {/* 语言设置 */}
                <Card title="语言设置" className="settings-section">
                    <div className="selector-item">
                        <div className="selector-label">
                            <GlobalOutline />
                            <span>界面语言</span>
                        </div>
                        <Selector
                            options={languageOptions}
                            value={language}
                            onChange={setLanguage}
                            columns={2}
                        />
                    </div>
                </Card>

                {/* 隐私设置 */}
                <Card title="隐私设置" className="settings-section">
                    <List>
                        <List.Item
                            prefix={<EyeInvisibleOutline />}
                            extra={
                                <Switch
                                    checked={privacyMode}
                                    onChange={setPrivacyMode}
                                />
                            }
                            description="隐藏敏感信息"
                        >
                            隐私模式
                        </List.Item>
                    </List>
                </Card>

                {/* 数据管理 */}
                <Card title="数据管理" className="settings-section">
                    <List>
                        <List.Item
                            prefix={<DeleteOutline />}
                            extra={<RightOutline />}
                            onClick={handleClearCache}
                            clickable
                            description="清除应用缓存数据"
                        >
                            清除缓存
                        </List.Item>
                    </List>
                </Card>

                {/* 其他设置 */}
                <Card title="其他" className="settings-section">
                    <List>
                        <List.Item
                            prefix={<ExclamationCircleOutline />}
                            extra={<RightOutline />}
                            onClick={handleAbout}
                            clickable
                            description="查看应用版本信息"
                        >
                            关于应用
                        </List.Item>
                    </List>
                </Card>

                {/* 操作按钮 */}
                <div className="action-buttons">
                    <Space direction="vertical" block>
                        <Button
                            color="danger"
                            size="large"
                            block
                            onClick={handleResetSettings}
                        >
                            重置所有设置
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    )
}
