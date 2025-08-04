'use client';

import { useAuth } from '@corn12138/hooks';
import {
    BoltIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    SignalIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RealTimeData {
    timestamp: number;
    activeUsers: number;
    ongoingChats: number;
    pendingRequests: number;
    averageResponseTime: number;
    systemStatus: 'healthy' | 'warning' | 'error';
    recentActivity: Array<{
        id: string;
        type: 'chat' | 'article' | 'user_login' | 'system';
        message: string;
        timestamp: number;
        severity: 'info' | 'warning' | 'error' | 'success';
    }>;
    performance: {
        cpuUsage: number;
        memoryUsage: number;
        networkLatency: number;
        errorRate: number;
    };
}

// 数据缓存管理
class DataCache {
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

    set(key: string, data: any, ttl: number = 30000) { // 默认30秒TTL
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

export default function RealTimeMonitor() {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [data, setData] = useState<RealTimeData | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [retryAttempts, setRetryAttempts] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const cacheRef = useRef<DataCache>(new DataCache());
    const retryTimeoutRef = useRef<NodeJS.Timeout>();
    const updateIntervalRef = useRef<NodeJS.Timeout>();

    const maxRetryAttempts = 5;
    const baseRetryDelay = 1000; // 1秒

    // 模拟实时数据生成
    const generateMockData = useCallback((): RealTimeData => {
        const cached = cacheRef.current.get('realtime-base');
        const baseData = cached || {
            activeUsers: Math.floor(Math.random() * 50) + 10,
            ongoingChats: Math.floor(Math.random() * 20) + 5,
            pendingRequests: Math.floor(Math.random() * 10),
            baseResponseTime: 1.5 + Math.random() * 1,
        };

        if (!cached) {
            cacheRef.current.set('realtime-base', baseData, 60000); // 1分钟缓存
        }

        return {
            timestamp: Date.now(),
            activeUsers: baseData.activeUsers + Math.floor(Math.random() * 5) - 2,
            ongoingChats: Math.max(0, baseData.ongoingChats + Math.floor(Math.random() * 3) - 1),
            pendingRequests: Math.max(0, baseData.pendingRequests + Math.floor(Math.random() * 2) - 1),
            averageResponseTime: Math.max(0.5, baseData.baseResponseTime + (Math.random() - 0.5) * 0.5),
            systemStatus: Math.random() > 0.95 ? 'warning' : Math.random() > 0.99 ? 'error' : 'healthy',
            recentActivity: generateRecentActivity(),
            performance: {
                cpuUsage: Math.random() * 100,
                memoryUsage: 40 + Math.random() * 40,
                networkLatency: 20 + Math.random() * 100,
                errorRate: Math.random() * 5
            }
        };
    }, []);

    const generateRecentActivity = () => {
        const activities = [
            { type: 'chat', message: '用户发起了AI对话', severity: 'info' },
            { type: 'article', message: '新文章已发布', severity: 'success' },
            { type: 'user_login', message: '用户登录系统', severity: 'info' },
            { type: 'system', message: '系统性能监控正常', severity: 'success' },
            { type: 'system', message: '检测到高响应时间', severity: 'warning' },
            { type: 'system', message: 'API调用失败', severity: 'error' },
        ];

        return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            return {
                id: `activity-${Date.now()}-${index}`,
                type: activity.type as any,
                message: activity.message,
                timestamp: Date.now() - Math.random() * 300000, // 最近5分钟内
                severity: activity.severity as any
            };
        }).sort((a, b) => b.timestamp - a.timestamp);
    };

    // WebSocket连接管理
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setConnectionStatus('connecting');
        setRetryAttempts(prev => prev + 1);

        // 在实际环境中，这里应该连接到真实的WebSocket服务
        // 现在我们模拟WebSocket连接
        try {
            // 模拟连接延迟
            setTimeout(() => {
                setConnectionStatus('connected');
                setIsConnected(true);
                setRetryAttempts(0);

                // 模拟定期接收数据
                updateIntervalRef.current = setInterval(() => {
                    if (!isPaused) {
                        const newData = generateMockData();
                        setData(prevData => {
                            // 缓存之前的数据用于比较
                            if (prevData) {
                                cacheRef.current.set('previous-data', prevData, 5000);
                            }
                            return newData;
                        });
                    }
                }, 2000); // 每2秒更新一次

            }, 1000 + Math.random() * 2000); // 1-3秒连接延迟

        } catch (error) {
            console.error('WebSocket连接失败:', error);
            setConnectionStatus('error');
            scheduleRetry();
        }
    }, [generateMockData, isPaused]);

    const disconnectWebSocket = useCallback(() => {
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;
    }, []);

    const scheduleRetry = useCallback(() => {
        if (retryAttempts >= maxRetryAttempts) {
            setConnectionStatus('error');
            return;
        }

        const delay = baseRetryDelay * Math.pow(2, retryAttempts); // 指数退避
        retryTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
        }, delay);
    }, [retryAttempts, connectWebSocket]);

    // 组件挂载时自动连接
    useEffect(() => {
        connectWebSocket();

        return () => {
            disconnectWebSocket();
        };
    }, [connectWebSocket, disconnectWebSocket]);

    // 页面可见性API - 当页面不可见时暂停更新
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPaused(document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'connecting':
                return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
            case 'error':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <SignalIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getSystemStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'chat': return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
            case 'article': return <DocumentTextIcon className="h-4 w-4" />;
            case 'user_login': return <UserIcon className="h-4 w-4" />;
            default: return <BoltIcon className="h-4 w-4" />;
        }
    };

    const getActivityColor = (severity: string) => {
        switch (severity) {
            case 'success': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-blue-600';
        }
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        return new Date(timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* 连接状态和控制面板 */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-gray-900">实时监控</h2>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(connectionStatus)}
                            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                {connectionStatus === 'connected' && '已连接'}
                                {connectionStatus === 'connecting' && '连接中...'}
                                {connectionStatus === 'disconnected' && '未连接'}
                                {connectionStatus === 'error' && `连接失败 (重试 ${retryAttempts}/${maxRetryAttempts})`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-500">
                            缓存项: {cacheRef.current.size()}
                        </div>
                        <button
                            onClick={isPaused ? () => setIsPaused(false) : () => setIsPaused(true)}
                            className={`px-3 py-2 text-sm rounded-md ${isPaused
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                        >
                            {isPaused ? '恢复更新' : '暂停更新'}
                        </button>
                        <button
                            onClick={() => {
                                cacheRef.current.clear();
                                if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
                                    connectWebSocket();
                                }
                            }}
                            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                            {connectionStatus === 'connected' ? '清除缓存' : '重新连接'}
                        </button>
                    </div>
                </div>
            </div>

            {data && (
                <>
                    {/* 实时指标 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">在线用户</p>
                                    <p className="text-2xl font-bold text-blue-600">{data.activeUsers}</p>
                                </div>
                                <UserIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="mt-2">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                    <span className="text-xs text-gray-500">实时更新</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">进行中对话</p>
                                    <p className="text-2xl font-bold text-green-600">{data.ongoingChats}</p>
                                </div>
                                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="mt-2">
                                <span className="text-xs text-gray-500">
                                    队列: {data.pendingRequests} 个请求
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">平均响应时间</p>
                                    <p className="text-2xl font-bold text-purple-600">{data.averageResponseTime.toFixed(1)}s</p>
                                </div>
                                <ClockIcon className="h-8 w-8 text-purple-500" />
                            </div>
                            <div className="mt-2">
                                <span className={`text-xs ${data.averageResponseTime < 2 ? 'text-green-500' :
                                    data.averageResponseTime < 3 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {data.averageResponseTime < 2 ? '优秀' :
                                        data.averageResponseTime < 3 ? '正常' : '需要优化'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">系统状态</p>
                                    <p className={`text-2xl font-bold ${data.systemStatus === 'healthy' ? 'text-green-600' :
                                        data.systemStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {data.systemStatus === 'healthy' ? '正常' :
                                            data.systemStatus === 'warning' ? '警告' : '错误'}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-full ${getSystemStatusColor(data.systemStatus)}`}>
                                    {data.systemStatus === 'healthy' ?
                                        <CheckCircleIcon className="h-6 w-6" /> :
                                        <ExclamationTriangleIcon className="h-6 w-6" />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 性能指标 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">系统性能</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">CPU使用率</span>
                                    <span className="text-sm font-medium">{data.performance.cpuUsage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${data.performance.cpuUsage > 80 ? 'bg-red-500' :
                                            data.performance.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(data.performance.cpuUsage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">内存使用率</span>
                                    <span className="text-sm font-medium">{data.performance.memoryUsage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${data.performance.memoryUsage > 80 ? 'bg-red-500' :
                                            data.performance.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min(data.performance.memoryUsage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">网络延迟</span>
                                    <span className="text-sm font-medium">{data.performance.networkLatency.toFixed(0)}ms</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${data.performance.networkLatency > 100 ? 'bg-red-500' :
                                            data.performance.networkLatency > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(data.performance.networkLatency / 2, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">错误率</span>
                                    <span className="text-sm font-medium">{data.performance.errorRate.toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${data.performance.errorRate > 5 ? 'bg-red-500' :
                                            data.performance.errorRate > 2 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(data.performance.errorRate * 10, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 实时活动 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">实时活动</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>实时更新</span>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {data.recentActivity.length > 0 ? (
                                data.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className={`p-1 rounded-full ${getActivityColor(activity.severity)}`}>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">{activity.message}</p>
                                            <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2">暂无活动</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 