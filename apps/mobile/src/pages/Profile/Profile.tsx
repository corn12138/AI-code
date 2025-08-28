import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import nativeBridge from '@/utils/nativeBridge'
import {
    Avatar,
    Badge,
    Button,
    Card,
    Grid,
    List,
    Space
} from 'antd-mobile'
import {
    AppOutline,
    HeartOutline,
    RightOutline,
    SetOutline,
    UserOutline
} from 'antd-mobile-icons'
import './Profile.css'

const userStats = [
    { label: '关注', value: '256', key: 'following' },
    { label: '粉丝', value: '1.2k', key: 'followers' },
    { label: '获赞', value: '3.6k', key: 'likes' },
    { label: '积分', value: '8888', key: 'points' }
]

const menuItems = [
    {
        key: 'orders',
        title: '我的订单',
        icon: <AppOutline />,
        badge: 2,
        color: '#1677ff'
    },
    {
        key: 'favorites',
        title: '我的收藏',
        icon: <HeartOutline />,
        color: '#ff4d4f'
    },
    {
        key: 'history',
        title: '浏览历史',
        icon: <AppOutline />,
        color: '#52c41a'
    },
    {
        key: 'team',
        title: '我的团队',
        icon: <UserOutline />,
        color: '#722ed1'
    }
]

const settingItems = [
    {
        key: 'account',
        title: '账号设置',
        icon: <UserOutline />,
        description: '个人信息、密码设置'
    },
    {
        key: 'notification',
        title: '消息通知',
        icon: <SetOutline />,
        description: '推送设置、隐私设置'
    },
    {
        key: 'help',
        title: '帮助与反馈',
        icon: <AppOutline />,
        description: '常见问题、意见反馈'
    }
]

export default function Profile() {
    const { isMobile, isTablet } = useDeviceInfo()

    const handleMenuItem = async (key: string) => {
        console.log('Menu item clicked:', key)

        // 根据功能调用原生能力
        switch (key) {
            case 'orders':
                nativeBridge.showToast('查看我的订单')
                break
            case 'favorites':
                nativeBridge.showToast('查看我的收藏')
                break
            case 'history':
                nativeBridge.showToast('查看浏览历史')
                break
            case 'team':
                nativeBridge.showToast('查看我的团队')
                break
            default:
                console.log('Unknown menu item:', key)
        }
    }

    const handleEditProfile = () => {
        console.log('Edit profile')
        // TODO: 实现编辑个人信息
    }

    const handleLogout = () => {
        console.log('Logout')
        // TODO: 实现登出功能
    }

    return (
        <div className={`profile-page ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
            <div className="content-container">
                {/* 用户信息卡片 */}
                <Card className="user-info-card">
                    <div className="user-info">
                        <div className="user-avatar">
                            <Avatar
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                                style={{ '--size': isMobile ? '64px' : '80px' }}
                            />
                            <div className="edit-avatar" onClick={handleEditProfile}>
                                <UserOutline />
                            </div>
                        </div>
                        <div className="user-details">
                            <h3 className="user-name">张三</h3>
                            <p className="user-desc">产品经理 · 北京</p>
                            <p className="user-id">ID: 123456789</p>
                        </div>
                    </div>
                </Card>

                {/* 用户统计 */}
                <Card className="user-stats-card">
                    <Grid columns={4} gap={0}>
                        {userStats.map(stat => (
                            <Grid.Item key={stat.key}>
                                <div className="stat-item" onClick={() => handleMenuItem(stat.key)}>
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            </Grid.Item>
                        ))}
                    </Grid>
                </Card>

                {/* 功能菜单 */}
                <Card className="menu-card">
                    <Grid columns={isMobile ? 4 : 6} gap={16}>
                        {menuItems.map(item => (
                            <Grid.Item key={item.key}>
                                <div
                                    className="menu-item"
                                    onClick={() => handleMenuItem(item.key)}
                                >
                                    <div
                                        className="menu-icon"
                                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                    >
                                        {item.icon}
                                        {item.badge && (
                                            <Badge
                                                content={item.badge}
                                                style={{ position: 'absolute', top: '-4px', right: '-4px' }}
                                            />
                                        )}
                                    </div>
                                    <span className="menu-title">{item.title}</span>
                                </div>
                            </Grid.Item>
                        ))}
                    </Grid>
                </Card>

                {/* 设置列表 */}
                <Card title="设置" className="settings-card">
                    <List>
                        {settingItems.map(item => (
                            <List.Item
                                key={item.key}
                                prefix={
                                    <div className="setting-icon">
                                        {item.icon}
                                    </div>
                                }
                                extra={<RightOutline />}
                                description={item.description}
                                onClick={() => handleMenuItem(item.key)}
                                clickable
                            >
                                {item.title}
                            </List.Item>
                        ))}
                    </List>
                </Card>

                {/* 操作按钮 */}
                <div className="action-buttons">
                    <Space direction="vertical" block>
                        <Button color="primary" size="large" block onClick={handleEditProfile}>
                            编辑个人信息
                        </Button>
                        <Button size="large" block onClick={handleLogout}>
                            退出登录
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    )
}
