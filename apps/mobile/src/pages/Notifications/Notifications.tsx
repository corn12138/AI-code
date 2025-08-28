import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { Badge, Card, List, Switch, Tabs } from 'antd-mobile'
import { BellOutline, MessageOutline } from 'antd-mobile-icons'
import { useState } from 'react'
import './Notifications.css'

// 模拟通知数据
const mockNotifications = [
    {
        id: 1,
        type: 'system',
        title: '系统更新',
        content: '新版本 v2.1.0 已发布，包含重要安全更新',
        time: '2小时前',
        read: false,
        important: true,
    },
    {
        id: 2,
        type: 'message',
        title: '新消息',
        content: '您有 3 条未读消息',
        time: '3小时前',
        read: false,
        important: false,
    },
    {
        id: 3,
        type: 'system',
        title: '维护通知',
        content: '系统将于今晚 23:00-24:00 进行维护',
        time: '1天前',
        read: true,
        important: true,
    },
    {
        id: 4,
        type: 'activity',
        title: '登录异常',
        content: '检测到异地登录，请注意账户安全',
        time: '2天前',
        read: true,
        important: true,
    },
    {
        id: 5,
        type: 'message',
        title: '群聊消息',
        content: '项目讨论组有新的消息',
        time: '3天前',
        read: true,
        important: false,
    },
]

const notificationSettings = [
    {
        key: 'push',
        title: '推送通知',
        description: '接收重要通知的推送',
        enabled: true,
    },
    {
        key: 'sound',
        title: '声音提醒',
        description: '新通知时播放提示音',
        enabled: true,
    },
    {
        key: 'vibrate',
        title: '震动提醒',
        description: '新通知时设备震动',
        enabled: false,
    },
    {
        key: 'preview',
        title: '消息预览',
        description: '在通知中显示消息内容',
        enabled: true,
    },
]

export default function Notifications() {
    const { isMobile, isTablet } = useDeviceInfo()
    const [activeTab, setActiveTab] = useState('all')
    const [settings, setSettings] = useState(notificationSettings)

    const handleNotificationClick = (notificationId: number) => {
        console.log('查看通知详情:', notificationId)
        // TODO: 实现通知详情页面
    }

    const handleMarkAllRead = () => {
        console.log('标记所有通知为已读')
        // TODO: 实现标记已读功能
    }

    const handleClearAll = () => {
        console.log('清空所有通知')
        // TODO: 实现清空通知功能
    }

    const handleSettingChange = (key: string, value: boolean) => {
        setSettings(prev => prev.map(item =>
            item.key === key ? { ...item, enabled: value } : item
        ))
    }

    const filteredNotifications = mockNotifications.filter(notification => {
        if (activeTab === 'all') return true
        if (activeTab === 'unread') return !notification.read
        if (activeTab === 'important') return notification.important
        return true
    })

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'system':
                return <BellOutline />
            case 'message':
                return <MessageOutline />
            default:
                return <BellOutline />
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'system':
                return '#1677ff'
            case 'message':
                return '#52c41a'
            case 'activity':
                return '#faad14'
            default:
                return '#666666'
        }
    }

    const renderNotificationItem = (item: typeof mockNotifications[0]) => (
        <List.Item
            key={item.id}
            prefix={
                <div
                    className="notification-icon"
                    style={{ backgroundColor: getNotificationColor(item.type) }}
                >
                    {getNotificationIcon(item.type)}
                </div>
            }
            description={
                <div className="notification-content">
                    <span className="notification-text">{item.content}</span>
                    <span className="notification-time">{item.time}</span>
                </div>
            }
            extra={
                <div className="notification-extra">
                    {item.important && <Badge content="重要" color="#f5222d" />}
                    {!item.read && <div className="unread-dot" />}
                </div>
            }
            onClick={() => handleNotificationClick(item.id)}
            className={`notification-item ${!item.read ? 'unread' : ''} ${item.important ? 'important' : ''}`}
        >
            <div className="notification-title">{item.title}</div>
        </List.Item>
    )

    return (
        <div className={`notifications-page ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
            <div className="page-container">
                <Tabs activeKey={activeTab} onChange={setActiveTab} className="notification-tabs">
                    <Tabs.Tab title="全部" key="all">
                        <div className="notification-actions">
                            <button className="action-button" onClick={handleMarkAllRead}>
                                全部已读
                            </button>
                            <button className="action-button secondary" onClick={handleClearAll}>
                                清空通知
                            </button>
                        </div>

                        <Card className="notification-list-card">
                            {filteredNotifications.length > 0 ? (
                                <List className="notification-list">
                                    {filteredNotifications.map(renderNotificationItem)}
                                </List>
                            ) : (
                                <div className="empty-state">
                                    <BellOutline className="empty-icon" />
                                    <p>暂无通知</p>
                                </div>
                            )}
                        </Card>
                    </Tabs.Tab>

                    <Tabs.Tab title="未读" key="unread">
                        <Card className="notification-list-card">
                            {filteredNotifications.length > 0 ? (
                                <List className="notification-list">
                                    {filteredNotifications.map(renderNotificationItem)}
                                </List>
                            ) : (
                                <div className="empty-state">
                                    <BellOutline className="empty-icon" />
                                    <p>没有未读通知</p>
                                </div>
                            )}
                        </Card>
                    </Tabs.Tab>

                    <Tabs.Tab title="重要" key="important">
                        <Card className="notification-list-card">
                            {filteredNotifications.length > 0 ? (
                                <List className="notification-list">
                                    {filteredNotifications.map(renderNotificationItem)}
                                </List>
                            ) : (
                                <div className="empty-state">
                                    <BellOutline className="empty-icon" />
                                    <p>没有重要通知</p>
                                </div>
                            )}
                        </Card>
                    </Tabs.Tab>

                    <Tabs.Tab title="设置" key="settings">
                        <Card className="settings-card">
                            <h3 className="section-title">通知设置</h3>
                            <List className="settings-list">
                                {settings.map(setting => (
                                    <List.Item
                                        key={setting.key}
                                        extra={
                                            <Switch
                                                checked={setting.enabled}
                                                onChange={(checked) => handleSettingChange(setting.key, checked)}
                                            />
                                        }
                                        description={setting.description}
                                    >
                                        {setting.title}
                                    </List.Item>
                                ))}
                            </List>
                        </Card>
                    </Tabs.Tab>
                </Tabs>
            </div>
        </div>
    )
}
