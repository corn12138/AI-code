import NetworkStatusMonitor from '@/components/NetworkStatusMonitor';
import '@/styles/antd-mobile.css';
import { nativeBridge } from '@/utils/nativeBridge';
import { networkManager } from '@/utils/networkManager';
import { networkTester, type NetworkTestResult } from '@/utils/networkTester';
import {
    Badge,
    Button,
    Card,
    Collapse,
    Dialog,
    Empty,
    List,
    NavBar,
    NoticeBar,
    Popup,
    Space,
    SpinLoading,
    SwipeAction,
    SwiperRef,
    Tabs,
    Tag,
    Toast
} from 'antd-mobile';
import {
    CheckCircleOutline,
    ClockCircleOutline,
    CloseCircleOutline,
    DeleteOutline,
    DownlandOutline,
    ExclamationCircleOutline,
    FileOutline,
    RedoOutline,
    RightOutline,
    SetOutline,
    StarOutline,
    UploadOutline
} from 'antd-mobile-icons';
import React, { useEffect, useRef, useState } from 'react';

const NetworkTest: React.FC = () => {
    const [testResult, setTestResult] = useState<NetworkTestResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [testHistory, setTestHistory] = useState<NetworkTestResult[]>([]);
    const [cacheStats, setCacheStats] = useState<{ size: number; keys: string[] }>({ size: 0, keys: [] });
    const [showReport, setShowReport] = useState(false);
    const [activeTab, setActiveTab] = useState('status');
    const [showQuickActions, setShowQuickActions] = useState(false);
    const swiperRef = useRef<SwiperRef>(null);

    useEffect(() => {
        // 加载测试历史
        setTestHistory(networkTester.getTestHistory());

        // 更新缓存统计
        updateCacheStats();

        // 定期更新缓存统计
        const interval = setInterval(updateCacheStats, 5000);

        return () => clearInterval(interval);
    }, []);

    const updateCacheStats = () => {
        setCacheStats(networkManager.getCacheStats());
    };

    const runNetworkTest = async () => {
        if (isRunning) return;

        setIsRunning(true);
        Toast.show({
            icon: <SpinLoading />,
            content: '网络测试中...',
            duration: 0
        });

        try {
            const result = await networkTester.runFullTest();
            setTestResult(result);
            setTestHistory(networkTester.getTestHistory());

            Toast.show({
                icon: result.nativeBridgeWorking ? <CheckCircleOutline /> : <CloseCircleOutline />,
                content: result.nativeBridgeWorking ? '测试完成' : '测试失败',
            });
        } catch (error) {
            console.error('网络测试失败:', error);
            Toast.show({
                icon: <CloseCircleOutline />,
                content: '测试失败',
            });
        } finally {
            setIsRunning(false);
        }
    };

    const testOfflineFunctionality = async () => {
        Toast.show({
            icon: <SpinLoading />,
            content: '测试离线功能...',
        });

        try {
            const success = await networkTester.testOfflineFunctionality();
            if (success) {
                Toast.show({
                    icon: <CheckCircleOutline />,
                    content: '离线功能测试成功！',
                });
            } else {
                Toast.show({
                    icon: <CloseCircleOutline />,
                    content: '离线功能测试失败！',
                });
            }
            updateCacheStats();
        } catch (error) {
            Toast.show({
                icon: <CloseCircleOutline />,
                content: `离线功能测试失败: ${error}`,
            });
        }
    };

    const simulateWeakNetwork = async () => {
        Toast.show({
            icon: <SpinLoading />,
            content: '模拟弱网环境...',
        });

        try {
            await networkTester.simulateWeakNetwork();
            Toast.show({
                icon: <CheckCircleOutline />,
                content: '弱网环境模拟完成！',
            });
        } catch (error) {
            Toast.show({
                icon: <CloseCircleOutline />,
                content: `弱网环境模拟失败: ${error}`,
            });
        }
    };

    const clearCache = async () => {
        const result = await Dialog.confirm({
            content: '确定要清除所有缓存吗？',
            confirmText: '清除',
            cancelText: '取消',
        });

        if (result) {
            Toast.show({
                icon: <SpinLoading />,
                content: '清除缓存中...',
            });

            try {
                await networkManager.clearCache();
                updateCacheStats();
                Toast.show({
                    icon: <CheckCircleOutline />,
                    content: '缓存已清除！',
                });
            } catch (error) {
                Toast.show({
                    icon: <CloseCircleOutline />,
                    content: `清除缓存失败: ${error}`,
                });
            }
        }
    };

    const clearTestHistory = () => {
        Dialog.confirm({
            content: '确定要清除测试历史吗？',
            confirmText: '清除',
            cancelText: '取消',
        }).then((result) => {
            if (result) {
                networkTester.clearTestHistory();
                setTestHistory([]);
                setTestResult(null);
                Toast.show({
                    icon: <CheckCircleOutline />,
                    content: '测试历史已清除！',
                });
            }
        });
    };

    const generateReport = () => {
        const report = networkTester.generateTestReport();
        console.log('网络测试报告:', report);

        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(report).then(() => {
                Toast.show({
                    icon: <CheckCircleOutline />,
                    content: '测试报告已复制到剪贴板！',
                });
            });
        } else {
            setShowReport(true);
        }
    };

    const testNativeBridge = async () => {
        Toast.show({
            icon: <SpinLoading />,
            content: '测试原生桥接...',
        });

        try {
            // 测试设备信息
            const deviceInfo = await nativeBridge.getDeviceInfo();
            console.log('设备信息:', deviceInfo);

            // 测试网络状态
            const networkInfo = await nativeBridge.getNetworkStatus();
            console.log('网络状态:', networkInfo);

            // 测试Toast
            await nativeBridge.showToast('原生桥接测试成功！', 'short');

            Toast.show({
                icon: <CheckCircleOutline />,
                content: '原生桥接功能测试完成！',
            });
        } catch (error) {
            Toast.show({
                icon: <CloseCircleOutline />,
                content: `原生桥接测试失败: ${error}`,
            });
        }
    };

    const getStatusIcon = (isOnline: boolean, quality: string) => {
        if (!isOnline) {
            return <CloseCircleOutline className="text-red-500" />;
        }

        switch (quality) {
            case 'excellent':
                return <CheckCircleOutline className="text-green-500" />;
            case 'good':
                return <CheckCircleOutline className="text-blue-500" />;
            case 'poor':
                return <ExclamationCircleOutline className="text-yellow-500" />;
            default:
                return <CloseCircleOutline className="text-red-500" />;
        }
    };

    const getStatusColor = (isOnline: boolean, quality: string) => {
        if (!isOnline) return 'danger';

        switch (quality) {
            case 'excellent': return 'success';
            case 'good': return 'primary';
            case 'poor': return 'warning';
            default: return 'danger';
        }
    };

    const getStatusText = (isOnline: boolean, quality: string) => {
        if (!isOnline) return '离线';

        switch (quality) {
            case 'excellent': return '网络良好';
            case 'good': return '网络正常';
            case 'poor': return '网络较差';
            default: return '无网络';
        }
    };

    const renderNetworkStatus = () => (
        <div className="space-y-4">
            {/* 网络状态概览 */}
            <Card>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">网络状态概览</span>
                        <NetworkStatusMonitor showDetails={false} />
                    </div>

                    {testResult && (
                        <div className="space-y-4">
                            {/* 主要指标 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {testResult.isOnline ? '在线' : '离线'}
                                    </div>
                                    <div className="text-sm text-blue-600">连接状态</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {testResult.signalStrength}%
                                    </div>
                                    <div className="text-sm text-green-600">信号强度</div>
                                </div>
                            </div>

                            {/* 网络质量进度条 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>网络质量</span>
                                    <span className="font-medium">{testResult.networkQuality}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${testResult.isOnline ?
                                            (testResult.networkQuality === 'excellent' ? 'bg-green-500' :
                                                testResult.networkQuality === 'good' ? 'bg-blue-500' : 'bg-yellow-500') : 'bg-red-500'
                                            }`}
                                        style={{ width: `${testResult.signalStrength}%` }}
                                    />
                                </div>
                            </div>

                            {/* 性能指标 */}
                            {testResult.pingTime && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-center mb-1">
                                            <ClockCircleOutline className="text-blue-500 mr-1" />
                                            <span className="text-sm font-semibold text-blue-600">
                                                {testResult.pingTime}ms
                                            </span>
                                        </div>
                                        <div className="text-xs text-blue-600">Ping</div>
                                    </div>

                                    {testResult.downloadSpeed && (
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center justify-center mb-1">
                                                <DownlandOutline className="text-green-500 mr-1" />
                                                <span className="text-sm font-semibold text-green-600">
                                                    {testResult.downloadSpeed}KB/s
                                                </span>
                                            </div>
                                            <div className="text-xs text-green-600">下载</div>
                                        </div>
                                    )}

                                    {testResult.uploadSpeed && (
                                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                                            <div className="flex items-center justify-center mb-1">
                                                <UploadOutline className="text-purple-500 mr-1" />
                                                <span className="text-sm font-semibold text-purple-600">
                                                    {testResult.uploadSpeed}KB/s
                                                </span>
                                            </div>
                                            <div className="text-xs text-purple-600">上传</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 原生桥接状态 */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <SetOutline className="text-gray-500 mr-2" />
                                    <span className="text-sm">原生桥接</span>
                                </div>
                                <Tag color={testResult.nativeBridgeWorking ? 'success' : 'danger'}>
                                    {testResult.nativeBridgeWorking ? '正常' : '异常'}
                                </Tag>
                            </div>

                            {/* 错误信息 */}
                            {testResult.errors.length > 0 && (
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <ExclamationCircleOutline className="text-red-500 mr-2" />
                                        <span className="text-sm font-semibold text-red-800">错误信息</span>
                                    </div>
                                    <div className="text-xs text-red-700 space-y-1">
                                        {testResult.errors.map((error, index) => (
                                            <div key={index}>• {error}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* 快速操作 */}
            <Card>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">快速操作</span>
                        <Button
                            size="small"
                            fill="outline"
                            onClick={() => setShowQuickActions(!showQuickActions)}
                        >
                            {showQuickActions ? '收起' : '展开'}
                        </Button>
                    </div>

                    {showQuickActions && (
                        <div className="space-y-3">
                            <Button
                                block
                                color="primary"
                                loading={isRunning}
                                onClick={runNetworkTest}
                                disabled={isRunning}
                            >
                                <RedoOutline className="mr-2" />
                                {isRunning ? '测试中...' : '一键网络测试'}
                            </Button>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    color="success"
                                    onClick={testNativeBridge}
                                >
                                    <SetOutline className="mr-2" />
                                    桥接测试
                                </Button>
                                <Button
                                    color="warning"
                                    onClick={testOfflineFunctionality}
                                >
                                    <FileOutline className="mr-2" />
                                    离线测试
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );

    const renderTestControls = () => (
        <div className="space-y-4">
            {/* 主要测试功能 */}
            <Card>
                <div className="p-4">
                    <div className="mb-4">
                        <span className="text-lg font-semibold">主要测试功能</span>
                    </div>

                    <div className="space-y-3">
                        <Button
                            block
                            color="primary"
                            loading={isRunning}
                            onClick={runNetworkTest}
                            disabled={isRunning}
                        >
                            <RedoOutline className="mr-2" />
                            {isRunning ? '测试中...' : '运行完整网络测试'}
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                color="success"
                                onClick={testNativeBridge}
                            >
                                <SetOutline className="mr-2" />
                                测试原生桥接
                            </Button>

                            <Button
                                color="warning"
                                onClick={testOfflineFunctionality}
                            >
                                <FileOutline className="mr-2" />
                                测试离线功能
                            </Button>
                        </div>

                        <Button
                            block
                            color="default"
                            onClick={simulateWeakNetwork}
                        >
                            <ExclamationCircleOutline className="mr-2" />
                            模拟弱网环境
                        </Button>
                    </div>
                </div>
            </Card>

            {/* 高级功能 */}
            <Card>
                <div className="p-4">
                    <div className="mb-4">
                        <span className="text-lg font-semibold">高级功能</span>
                    </div>

                    <Collapse>
                        <Collapse.Panel key="1" title="网络诊断工具">
                            <div className="space-y-3">
                                <Button
                                    size="small"
                                    fill="outline"
                                    color="primary"
                                    onClick={() => {
                                        Toast.show({ content: 'Ping测试功能开发中' });
                                    }}
                                >
                                    Ping测试
                                </Button>
                                <Button
                                    size="small"
                                    fill="outline"
                                    color="success"
                                    onClick={() => {
                                        Toast.show({ content: 'DNS测试功能开发中' });
                                    }}
                                >
                                    DNS测试
                                </Button>
                                <Button
                                    size="small"
                                    fill="outline"
                                    color="warning"
                                    onClick={() => {
                                        Toast.show({ content: '路由追踪功能开发中' });
                                    }}
                                >
                                    路由追踪
                                </Button>
                            </div>
                        </Collapse.Panel>

                        <Collapse.Panel key="2" title="性能监控">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">CPU使用率</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-1">
                                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: '45%' }} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">内存使用率</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-1">
                                        <div className="bg-green-500 h-1 rounded-full" style={{ width: '62%' }} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">电池电量</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-1">
                                        <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '78%' }} />
                                    </div>
                                </div>
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </Card>
        </div>
    );

    const renderCacheManagement = () => (
        <div className="space-y-4">
            {/* 缓存概览 */}
            <Card>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">缓存概览</span>
                        <Space>
                            <Button
                                size="small"
                                color="danger"
                                onClick={clearCache}
                            >
                                <DeleteOutline className="mr-1" />
                                清除缓存
                            </Button>
                            <Button
                                size="small"
                                color="default"
                                onClick={updateCacheStats}
                            >
                                <RedoOutline className="mr-1" />
                                刷新
                            </Button>
                        </Space>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <div>
                                <div className="font-medium text-blue-800">缓存项目</div>
                                <div className="text-sm text-blue-600">{cacheStats.size} 个</div>
                            </div>
                            <Badge content={cacheStats.size} color="blue" />
                        </div>

                        {cacheStats.keys.length > 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium mb-2">缓存键</div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    {cacheStats.keys.slice(0, 5).map((key, index) => (
                                        <div key={index} className="flex items-center">
                                            <StarOutline className="text-yellow-500 mr-1" />
                                            {key}
                                        </div>
                                    ))}
                                    {cacheStats.keys.length > 5 && (
                                        <div className="text-gray-500">... 还有 {cacheStats.keys.length - 5} 个</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 缓存使用情况 */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>缓存使用率</span>
                                <span className="font-medium">{Math.round((cacheStats.size / 50) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${cacheStats.size > 40 ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.round((cacheStats.size / 50) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 缓存详情 */}
            <Card>
                <div className="p-4">
                    <div className="mb-4">
                        <span className="text-lg font-semibold">缓存详情</span>
                    </div>

                    <List>
                        <List.Item
                            prefix={<FileOutline />}
                            extra={<Tag color="blue">API缓存</Tag>}
                        >
                            <div>
                                <div className="font-medium">API响应缓存</div>
                                <div className="text-xs text-gray-500">存储API请求的响应数据</div>
                            </div>
                        </List.Item>

                        <List.Item
                            prefix={<FileOutline />}
                            extra={<Tag color="green">静态资源</Tag>}
                        >
                            <div>
                                <div className="font-medium">静态资源缓存</div>
                                <div className="text-xs text-gray-500">缓存JS、CSS、图片等静态文件</div>
                            </div>
                        </List.Item>

                        <List.Item
                            prefix={<StarOutline />}
                            extra={<Tag color="orange">用户数据</Tag>}
                        >
                            <div>
                                <div className="font-medium">用户数据缓存</div>
                                <div className="text-xs text-gray-500">存储用户设置和偏好</div>
                            </div>
                        </List.Item>
                    </List>
                </div>
            </Card>
        </div>
    );

    const renderTestHistory = () => (
        <div className="space-y-4">
            {/* 历史记录概览 */}
            <Card>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">测试历史</span>
                        <Space>
                            <Button
                                size="small"
                                color="primary"
                                onClick={generateReport}
                            >
                                <FileOutline className="mr-1" />
                                生成报告
                            </Button>
                            <Button
                                size="small"
                                color="danger"
                                onClick={clearTestHistory}
                            >
                                <DeleteOutline className="mr-1" />
                                清除历史
                            </Button>
                        </Space>
                    </div>

                    {testHistory.length === 0 ? (
                        <Empty
                            description="暂无测试历史"
                            image={<FileOutline style={{ fontSize: 48, color: '#ccc' }} />}
                        />
                    ) : (
                        <div className="space-y-2">
                            {/* 统计信息 */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                    <div className="text-lg font-bold text-blue-600">{testHistory.length}</div>
                                    <div className="text-xs text-blue-600">总测试</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="text-lg font-bold text-green-600">
                                        {testHistory.filter(r => r.isOnline).length}
                                    </div>
                                    <div className="text-xs text-green-600">成功</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded">
                                    <div className="text-lg font-bold text-red-600">
                                        {testHistory.filter(r => !r.isOnline).length}
                                    </div>
                                    <div className="text-xs text-red-600">失败</div>
                                </div>
                            </div>

                            {/* 历史记录列表 */}
                            <List>
                                {testHistory.slice(-10).reverse().map((result, index) => (
                                    <SwipeAction
                                        key={index}
                                        rightActions={[
                                            {
                                                key: 'delete',
                                                text: '删除',
                                                color: 'danger',
                                                onClick: () => {
                                                    Toast.show({ content: '删除功能开发中' });
                                                }
                                            }
                                        ]}
                                    >
                                        <List.Item
                                            prefix={getStatusIcon(result.isOnline, result.networkQuality)}
                                            extra={
                                                <Tag color={getStatusColor(result.isOnline, result.networkQuality)}>
                                                    {getStatusText(result.isOnline, result.networkQuality)}
                                                </Tag>
                                            }
                                            arrow={<RightOutline />}
                                        >
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">
                                                    {new Date(result.timestamp).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    <div>信号强度: {result.signalStrength}%</div>
                                                    <div>网络质量: {result.networkQuality}</div>
                                                    {result.pingTime && <div>Ping: {result.pingTime}ms</div>}
                                                </div>
                                            </div>
                                        </List.Item>
                                    </SwipeAction>
                                ))}
                            </List>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar backArrow={false}>
                <div className="flex items-center">
                    <span className="text-lg font-semibold">网络测试工具</span>
                    <Badge content="v1.0" color="blue" style={{ marginLeft: 8 }} />
                </div>
            </NavBar>

            {/* 通知栏 */}
            <NoticeBar
                content="网络测试工具已优化，支持离线缓存和弱网环境检测"
                color="info"
                closeable
            />

            <div className="p-4 space-y-4">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{
                        '--title-font-size': '14px',
                        '--active-title-color': '#1677ff',
                        '--active-line-color': '#1677ff',
                    }}
                >
                    <Tabs.Tab title="网络状态" key="status">
                        {renderNetworkStatus()}
                    </Tabs.Tab>

                    <Tabs.Tab title="测试控制" key="controls">
                        {renderTestControls()}
                    </Tabs.Tab>

                    <Tabs.Tab title="缓存管理" key="cache">
                        {renderCacheManagement()}
                    </Tabs.Tab>

                    <Tabs.Tab title="测试历史" key="history">
                        {renderTestHistory()}
                    </Tabs.Tab>
                </Tabs>
            </div>

            {/* 测试报告弹窗 */}
            <Popup
                visible={showReport}
                onMaskClick={() => setShowReport(false)}
                position="bottom"
                bodyStyle={{ height: '70vh' }}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">测试报告</span>
                        <Button
                            size="small"
                            onClick={() => setShowReport(false)}
                        >
                            关闭
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                            {networkTester.generateTestReport()}
                        </pre>
                    </div>
                </div>
            </Popup>
        </div>
    );
};

export default NetworkTest;
