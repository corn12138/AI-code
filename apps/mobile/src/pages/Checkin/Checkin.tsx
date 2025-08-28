import { Button, Card, List, Toast } from 'antd-mobile'
import { CalendarOutline, ClockOutline, LocationOutline } from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'umi'

interface CheckinRecord {
    id: string
    date: string
    time: string
    type: 'in' | 'out'
    location: string
    status: 'success' | 'late' | 'early'
}

const Checkin: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [todayRecords, setTodayRecords] = useState<CheckinRecord[]>([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const [location, setLocation] = useState('正在获取位置...')
    const navigate = useNavigate()

    useEffect(() => {
        // 更新当前时间
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        // 获取位置信息
        getLocation()

        // 加载今日打卡记录
        loadTodayRecords()

        return () => clearInterval(timer)
    }, [])

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    // 这里可以调用地图API获取具体地址
                    setLocation('北京市朝阳区xxx大厦')
                },
                (error) => {
                    console.error('获取位置失败:', error)
                    setLocation('位置获取失败')
                }
            )
        } else {
            setLocation('浏览器不支持定位')
        }
    }

    const loadTodayRecords = () => {
        // 模拟加载今日打卡记录
        const mockRecords: CheckinRecord[] = [
            {
                id: '1',
                date: '2025-01-27',
                time: '09:00',
                type: 'in',
                location: '北京市朝阳区xxx大厦',
                status: 'success'
            },
            {
                id: '2',
                date: '2025-01-27',
                time: '12:00',
                type: 'out',
                location: '北京市朝阳区xxx大厦',
                status: 'success'
            }
        ]
        setTodayRecords(mockRecords)
    }

    const handleCheckin = async (type: 'in' | 'out') => {
        setLoading(true)

        try {
            // 模拟打卡请求
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newRecord: CheckinRecord = {
                id: Date.now().toString(),
                date: currentTime.toISOString().split('T')[0],
                time: currentTime.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                type,
                location,
                status: 'success'
            }

            setTodayRecords(prev => [...prev, newRecord])

            Toast.show({
                content: `${type === 'in' ? '上班' : '下班'}打卡成功！`,
                position: 'center',
            })
        } catch (error) {
            Toast.show({
                content: '打卡失败，请重试',
                position: 'center',
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'success':
                return '正常'
            case 'late':
                return '迟到'
            case 'early':
                return '早退'
            default:
                return '正常'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-600'
            case 'late':
                return 'text-red-600'
            case 'early':
                return 'text-orange-600'
            default:
                return 'text-green-600'
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            {/* 时间显示 */}
            <Card className="mb-4 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-500">
                    {formatDate(currentTime)}
                </div>
            </Card>

            {/* 位置信息 */}
            <Card className="mb-4">
                <div className="flex items-center">
                    <LocationOutline className="mr-2 text-blue-500" />
                    <span className="text-sm text-gray-600">{location}</span>
                </div>
            </Card>

            {/* 打卡按钮 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                    block
                    color="primary"
                    size="large"
                    loading={loading}
                    onClick={() => handleCheckin('in')}
                    className="h-12 text-lg font-medium"
                >
                    上班打卡
                </Button>
                <Button
                    block
                    color="success"
                    size="large"
                    loading={loading}
                    onClick={() => handleCheckin('out')}
                    className="h-12 text-lg font-medium"
                >
                    下班打卡
                </Button>
            </div>

            {/* 今日记录 */}
            <Card>
                <div className="flex items-center mb-4">
                    <CalendarOutline className="mr-2 text-blue-500" />
                    <span className="font-medium">今日打卡记录</span>
                </div>

                {todayRecords.length > 0 ? (
                    <List>
                        {todayRecords.map((record) => (
                            <List.Item
                                key={record.id}
                                prefix={
                                    <div className={`w-3 h-3 rounded-full ${record.type === 'in' ? 'bg-blue-500' : 'bg-green-500'
                                        }`} />
                                }
                                extra={
                                    <span className={`text-sm ${getStatusColor(record.status)}`}>
                                        {getStatusText(record.status)}
                                    </span>
                                }
                            >
                                <div className="flex items-center">
                                    <ClockOutline className="mr-2 text-gray-400" />
                                    <span className="font-medium">
                                        {record.type === 'in' ? '上班' : '下班'}
                                    </span>
                                    <span className="ml-2 text-gray-500">{record.time}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {record.location}
                                </div>
                            </List.Item>
                        ))}
                    </List>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        暂无打卡记录
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Checkin
