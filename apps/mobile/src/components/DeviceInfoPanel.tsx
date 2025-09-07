import deviceDetector, { DeviceInfo, DeviceOptimization } from '@/utils/deviceDetector';
import { Badge, Button, Card, Collapse, List, Space, Tag, Toast } from 'antd-mobile';
import {
    CheckCircleOutline,
    CloseCircleOutline,
    DeviceOutline,
    InfoCircleOutline,
    SetOutline,
    SpeedOutline,
    StarOutline
} from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';

interface DeviceInfoPanelProps {
    className?: string;
    showDetails?: boolean;
    onOptimizationChange?: (optimizations: string[]) => void;
}

const DeviceInfoPanel: React.FC<DeviceInfoPanelProps> = ({
    className = '',
    showDetails = false,
    onOptimizationChange
}) => {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [optimizationInfo, setOptimizationInfo] = useState<DeviceOptimization | null>(null);
    const [isExpanded, setIsExpanded] = useState(showDetails);

    useEffect(() => {
        // 获取设备信息
        const info = deviceDetector.getDeviceInfo();
        const optimization = deviceDetector.getOptimizationInfo();

        setDeviceInfo(info);
        setOptimizationInfo(optimization);

        // 启动设备监控
        deviceDetector.startMonitoring();

        // 通知父组件优化变化
        if (onOptimizationChange) {
            onOptimizationChange(optimization.optimizations);
        }
    }, [onOptimizationChange]);

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'iphone':
                return <DeviceOutline className="text-blue-500" />;
            case 'android':
                return <DeviceOutline className="text-green-500" />;
            case 'tablet':
                return <DeviceOutline className="text-purple-500" />;
            case 'desktop':
                return <DeviceOutline className="text-gray-500" />;
            default:
                return <DeviceOutline className="text-gray-400" />;
        }
    };

    const getStatusIcon = (condition: boolean) => {
        return condition ? (
            <CheckCircleOutline className="text-green-500" />
        ) : (
            <CloseCircleOutline className="text-red-500" />
        );
    };

    const getOptimizationTag = (optimization: string) => {
        const tagColors: Record<string, string> = {
            'iOS系统优化': 'primary',
            'Android系统优化': 'success',
            '高分辨率优化': 'warning',
            '触摸设备优化': 'info',
            '低内存优化': 'danger',
            '慢速网络优化': 'warning',
            '横屏优化': 'info',
            '虚拟键盘优化': 'success'
        };

        return (
            <Tag
                color={tagColors[optimization] || 'default'}
                fill="outline"
                className="text-xs"
            >
                {optimization}
            </Tag>
        );
    };

    const getFeatureTag = (feature: string) => {
        const featureLabels: Record<string, string> = {
            'touch': '触摸',
            'high-dpi': '高分辨率',
            'hover': '悬停',
            'coarse-pointer': '粗指针',
            'low-memory': '低内存',
            'slow-network': '慢网络',
            'low-battery': '低电量'
        };

        return (
            <Tag
                color="success"
                fill="outline"
                className="text-xs"
            >
                {featureLabels[feature] || feature}
            </Tag>
        );
    };

    const handleRefresh = () => {
        const info = deviceDetector.getDeviceInfo();
        const optimization = deviceDetector.getOptimizationInfo();

        setDeviceInfo(info);
        setOptimizationInfo(optimization);

        Toast.show({
            content: '设备信息已刷新',
            position: 'top'
        });
    };

    const handleCopyInfo = () => {
        if (deviceInfo && optimizationInfo) {
            const infoText = `
设备信息:
- 设备类型: ${deviceInfo.brand} ${deviceInfo.model}
- 屏幕尺寸: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}
- 像素比: ${deviceInfo.pixelRatio}x
- 方向: ${deviceInfo.orientation}
- 优化数量: ${optimizationInfo.optimizations.length}
      `.trim();

            navigator.clipboard.writeText(infoText).then(() => {
                Toast.show({
                    content: '设备信息已复制到剪贴板',
                    position: 'top'
                });
            });
        }
    };

    if (!deviceInfo || !optimizationInfo) {
        return (
            <Card className={`device-info-panel ${className}`}>
                <div className="flex items-center justify-center p-4">
                    <SpeedOutline className="text-gray-400 mr-2" />
                    <span className="text-gray-500">正在检测设备信息...</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`device-info-panel ${className}`}>
            <Card.Header
                title={
                    <div className="flex items-center">
                        {getDeviceIcon(deviceInfo.type)}
                        <span className="ml-2 font-semibold">设备信息</span>
                        <Badge content={optimizationInfo.optimizations.length} className="ml-2">
                            <StarOutline className="text-yellow-500" />
                        </Badge>
                    </div>
                }
                extra={
                    <Space>
                        <Button
                            size="mini"
                            fill="outline"
                            onClick={handleRefresh}
                        >
                            刷新
                        </Button>
                        <Button
                            size="mini"
                            fill="outline"
                            onClick={handleCopyInfo}
                        >
                            复制
                        </Button>
                    </Space>
                }
            />

            <Card.Body>
                {/* 基础设备信息 */}
                <List header="基础信息">
                    <List.Item
                        prefix={<DeviceOutline className="text-blue-500" />}
                        title="设备型号"
                        description={`${deviceInfo.brand || 'Unknown'} ${deviceInfo.model || deviceInfo.type}`}
                    />
                    <List.Item
                        prefix={<InfoCircleOutline className="text-green-500" />}
                        title="屏幕尺寸"
                        description={`${deviceInfo.screenWidth} × ${deviceInfo.screenHeight} (${deviceInfo.pixelRatio}x)`}
                    />
                    <List.Item
                        prefix={<SetOutline className="text-purple-500" />}
                        title="设备方向"
                        description={deviceInfo.orientation === 'portrait' ? '竖屏' : '横屏'}
                    />
                </List>

                {/* 设备特性 */}
                <List header="设备特性">
                    <List.Item
                        prefix={getStatusIcon(deviceInfo.isTouch)}
                        title="触摸支持"
                        description={deviceInfo.isTouch ? '支持触摸操作' : '不支持触摸操作'}
                    />
                    <List.Item
                        prefix={getStatusIcon(deviceInfo.isHighDPI)}
                        title="高分辨率"
                        description={deviceInfo.isHighDPI ? '高分辨率屏幕' : '标准分辨率屏幕'}
                    />
                    <List.Item
                        prefix={getStatusIcon(deviceInfo.supportsHover)}
                        title="悬停支持"
                        description={deviceInfo.supportsHover ? '支持鼠标悬停' : '不支持鼠标悬停'}
                    />
                </List>

                {/* 性能状态 */}
                <List header="性能状态">
                    <List.Item
                        prefix={getStatusIcon(!deviceInfo.isLowMemory)}
                        title="内存状态"
                        description={deviceInfo.isLowMemory ? '低内存设备' : '正常内存设备'}
                    />
                    <List.Item
                        prefix={getStatusIcon(!deviceInfo.isSlowNetwork)}
                        title="网络状态"
                        description={deviceInfo.isSlowNetwork ? '慢速网络' : '正常网络'}
                    />
                    <List.Item
                        prefix={getStatusIcon(!deviceInfo.isLowBattery)}
                        title="电池状态"
                        description={deviceInfo.isLowBattery ? '低电量模式' : '正常电量'}
                    />
                </List>

                {/* 设备特性标签 */}
                {optimizationInfo.features.length > 0 && (
                    <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">设备特性:</div>
                        <div className="flex flex-wrap gap-2">
                            {optimizationInfo.features.map((feature, index) => (
                                <div key={index}>
                                    {getFeatureTag(feature)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 优化详情 */}
                <Collapse
                    defaultActiveKey={isExpanded ? ['optimizations'] : []}
                    onChange={(keys) => setIsExpanded(keys.includes('optimizations'))}
                >
                    <Collapse.Panel
                        key="optimizations"
                        title={
                            <div className="flex items-center">
                                <StarOutline className="text-yellow-500 mr-2" />
                                <span>应用优化 ({optimizationInfo.optimizations.length})</span>
                            </div>
                        }
                    >
                        <div className="space-y-3">
                            {/* 优化标签 */}
                            <div className="flex flex-wrap gap-2">
                                {optimizationInfo.optimizations.map((optimization, index) => (
                                    <div key={index}>
                                        {getOptimizationTag(optimization)}
                                    </div>
                                ))}
                            </div>

                            {/* CSS类列表 */}
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">CSS优化类:</div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <code className="text-xs text-gray-600">
                                        {optimizationInfo.cssClasses.join(' ')}
                                    </code>
                                </div>
                            </div>

                            {/* 设备摘要 */}
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-blue-700 mb-1">设备摘要:</div>
                                <div className="text-xs text-blue-600">
                                    {deviceDetector.getDeviceSummary()}
                                </div>
                            </div>
                        </div>
                    </Collapse.Panel>
                </Collapse>

                {/* 快速操作 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">快速操作:</div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            size="small"
                            fill="outline"
                            onClick={() => {
                                Toast.show({
                                    content: '正在测试设备兼容性...',
                                    position: 'top'
                                });
                            }}
                        >
                            兼容性测试
                        </Button>
                        <Button
                            size="small"
                            fill="outline"
                            onClick={() => {
                                Toast.show({
                                    content: '正在生成设备报告...',
                                    position: 'top'
                                });
                            }}
                        >
                            生成报告
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default DeviceInfoPanel;
