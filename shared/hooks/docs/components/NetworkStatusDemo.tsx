import { useCallback, useEffect, useState } from 'react';

// 简化的 useNetworkStatus 实现
function useSimpleNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [downlink, setDownlink] = useState<number | undefined>();
    const [effectiveType, setEffectiveType] = useState<string | undefined>();
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setReconnectAttempts(0);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 尝试获取网络连接信息
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            setDownlink(connection?.downlink);
            setEffectiveType(connection?.effectiveType);

            const handleConnectionChange = () => {
                setDownlink(connection?.downlink);
                setEffectiveType(connection?.effectiveType);
            };

            connection?.addEventListener('change', handleConnectionChange);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                connection?.removeEventListener('change', handleConnectionChange);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const reconnect = useCallback(async () => {
        setReconnectAttempts(prev => prev + 1);

        try {
            // 模拟重连尝试
            const response = await fetch('/api/ping', {
                method: 'HEAD',
                cache: 'no-cache'
            });

            if (response.ok) {
                setIsOnline(true);
                setReconnectAttempts(0);
            }
        } catch (error) {
            console.log('重连失败:', error);
        }
    }, []);

    const getNetworkQuality = () => {
        if (!isOnline) return { label: '离线', color: '#ff4d4f' };
        if (!effectiveType) return { label: '未知', color: '#faad14' };

        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                return { label: '慢速网络', color: '#ff4d4f' };
            case '3g':
                return { label: '中速网络', color: '#faad14' };
            case '4g':
                return { label: '高速网络', color: '#52c41a' };
            default:
                return { label: '良好', color: '#52c41a' };
        }
    };

    return {
        isOnline,
        downlink,
        effectiveType,
        reconnectAttempts,
        reconnect,
        networkQuality: getNetworkQuality()
    };
}

export default function NetworkStatusDemo() {
    const {
        isOnline,
        downlink,
        effectiveType,
        reconnectAttempts,
        reconnect,
        networkQuality
    } = useSimpleNetworkStatus();

    const [logs, setLogs] = useState<string[]>([]);
    const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);

    // 记录网络状态变化
    useEffect(() => {
        const timestamp = new Date().toLocaleTimeString();
        const status = isOnline ? '在线' : '离线';
        const message = `[${timestamp}] 网络状态: ${status}`;

        setLogs(prev => [message, ...prev].slice(0, 10)); // 保留最近10条记录
    }, [isOnline]);

    const simulateOffline = () => {
        setIsSimulatingOffline(true);

        // 模拟网络中断
        window.dispatchEvent(new Event('offline'));

        setTimeout(() => {
            window.dispatchEvent(new Event('online'));
            setIsSimulatingOffline(false);
        }, 3000);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>🌐 网络状态监控演示</h4>

            {/* 网络状态卡片 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
            }}>
                {/* 连接状态 */}
                <div style={{
                    padding: '16px',
                    background: isOnline ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${isOnline ? '#b7eb8f' : '#ffb3b3'}`,
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '24px', marginRight: '8px' }}>
                            {isOnline ? '🟢' : '🔴'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                            {isOnline ? '在线' : '离线'}
                        </span>
                    </div>
                    {reconnectAttempts > 0 && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            重连尝试: {reconnectAttempts} 次
                        </div>
                    )}
                </div>

                {/* 网络质量 */}
                <div style={{
                    padding: '16px',
                    background: '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '24px', marginRight: '8px' }}>📊</span>
                        <span style={{ fontWeight: 'bold' }}>网络质量</span>
                    </div>
                    <div style={{ color: networkQuality.color, fontWeight: 'bold' }}>
                        {networkQuality.label}
                    </div>
                    {effectiveType && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            类型: {effectiveType}
                        </div>
                    )}
                </div>

                {/* 连接速度 */}
                <div style={{
                    padding: '16px',
                    background: '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '24px', marginRight: '8px' }}>⚡</span>
                        <span style={{ fontWeight: 'bold' }}>下载速度</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {downlink ? `${downlink} Mbps` : '未知'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        估算带宽
                    </div>
                </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                    onClick={reconnect}
                    disabled={isOnline}
                    style={{
                        padding: '8px 16px',
                        background: isOnline ? '#f5f5f5' : '#1890ff',
                        color: isOnline ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isOnline ? 'not-allowed' : 'pointer'
                    }}
                >
                    {reconnectAttempts > 0 ? `重连中... (${reconnectAttempts})` : '手动重连'}
                </button>

                <button
                    onClick={simulateOffline}
                    disabled={isSimulatingOffline}
                    style={{
                        padding: '8px 16px',
                        background: isSimulatingOffline ? '#f5f5f5' : '#faad14',
                        color: isSimulatingOffline ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSimulatingOffline ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSimulatingOffline ? '模拟中...' : '模拟离线'}
                </button>

                <button
                    onClick={clearLogs}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#666',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    清除日志
                </button>
            </div>

            {/* 网络状态指示器 */}
            {!isOnline && (
                <div style={{
                    padding: '12px',
                    background: '#fff2f0',
                    border: '1px solid #ffb3b3',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{ color: '#ff4d4f' }}>
                        ⚠️ 网络连接已断开，某些功能可能无法使用
                    </span>
                    <button
                        onClick={reconnect}
                        style={{
                            padding: '4px 8px',
                            background: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        重新连接
                    </button>
                </div>
            )}

            {/* 状态日志 */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 12px 0' }}>状态日志：</h5>
                <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                }}>
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={index} style={{
                                padding: '4px 0',
                                borderBottom: index < logs.length - 1 ? '1px solid #eee' : 'none'
                            }}>
                                {log}
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                            暂无日志记录
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                💡 提示：尝试断开网络连接或点击"模拟离线"按钮来测试网络状态监控功能！
            </div>
        </div>
    );
} 