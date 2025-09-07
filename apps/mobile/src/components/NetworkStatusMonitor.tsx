import { networkManager, type NetworkStatus } from '@/utils/networkManager';
import { Space, Tag } from 'antd-mobile';
import {
    CheckCircleOutline,
    CloseCircleOutline
} from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';

interface NetworkStatusMonitorProps {
    showDetails?: boolean;
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

const NetworkStatusMonitor: React.FC<NetworkStatusMonitorProps> = ({
    showDetails = false,
    className = '',
    size = 'medium'
}) => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: true,
        quality: 'excellent',
        type: 'unknown',
        strength: 100,
        lastChecked: Date.now()
    });

    useEffect(() => {
        // 获取初始网络状态
        setNetworkStatus(networkManager.getNetworkStatus());

        // 添加网络状态监听器
        const removeListener = networkManager.addListener((status) => {
            setNetworkStatus(status);
        });

        return () => {
            removeListener();
        };
    }, []);

    const getStatusIcon = () => {
        if (!networkStatus.isOnline) {
            return <CloseCircleOutline className="text-red-500" />;
        }

        switch (networkStatus.quality) {
            case 'excellent':
                return <CheckCircleOutline className="text-green-500" />;
            case 'good':
                return <CheckCircleOutline className="text-blue-500" />;
            case 'poor':
                return <CloseCircleOutline className="text-yellow-500" />;
            case 'none':
                return <CloseCircleOutline className="text-red-500" />;
            default:
                return <CheckCircleOutline className="text-gray-500" />;
        }
    };

    const getStatusColor = () => {
        if (!networkStatus.isOnline) {
            return 'danger';
        }

        switch (networkStatus.quality) {
            case 'excellent':
                return 'success';
            case 'good':
                return 'primary';
            case 'poor':
                return 'warning';
            case 'none':
                return 'danger';
            default:
                return 'default';
        }
    };

    const getStatusText = () => {
        if (!networkStatus.isOnline) {
            return '离线';
        }

        switch (networkStatus.quality) {
            case 'excellent':
                return '网络良好';
            case 'good':
                return '网络正常';
            case 'poor':
                return '网络较差';
            case 'none':
                return '无网络';
            default:
                return '未知';
        }
    };

    const getNetworkTypeText = () => {
        switch (networkStatus.type) {
            case 'wifi':
                return 'WiFi';
            case 'cellular':
                return '移动网络';
            case 'ethernet':
                return '以太网';
            case 'web':
                return 'Web';
            case 'none':
                return '无连接';
            default:
                return networkStatus.type;
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case 'small':
                return 'text-sm';
            case 'large':
                return 'text-lg';
            default:
                return 'text-base';
        }
    };

    if (!showDetails) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <span className={`${getSizeClass()}`}>
                    {getStatusIcon()}
                </span>
                <Tag color={getStatusColor()}>
                    {getStatusText()}
                </Tag>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between">
                <Space align="center">
                    <span className={`${getSizeClass()}`}>
                        {getStatusIcon()}
                    </span>
                    <Tag color={getStatusColor()}>
                        {getStatusText()}
                    </Tag>
                </Space>

                <div className="text-right">
                    <div className={`font-medium ${getSizeClass()}`}>
                        {getNetworkTypeText()}
                    </div>
                    <div className={`text-gray-500 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                        {networkStatus.strength}% 信号
                    </div>
                </div>
            </div>

            {/* 网络质量指示器 */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>网络质量</span>
                    <span>{networkStatus.quality}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${networkStatus.isOnline
                            ? networkStatus.quality === 'excellent'
                                ? 'bg-green-500'
                                : networkStatus.quality === 'good'
                                    ? 'bg-blue-500'
                                    : 'bg-yellow-500'
                            : 'bg-red-500'
                            }`}
                        style={{
                            width: `${networkStatus.isOnline ? networkStatus.strength : 0}%`
                        }}
                    />
                </div>
            </div>

            {/* 最后检查时间 */}
            <div className={`text-gray-400 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                最后检查: {new Date(networkStatus.lastChecked).toLocaleTimeString()}
            </div>
        </div>
    );
};

export default NetworkStatusMonitor;
