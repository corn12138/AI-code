import DeviceInfoPanel from '@/components/DeviceInfoPanel';
import deviceDetector from '@/utils/deviceDetector';
import {
    Button,
    Card,
    Dialog,
    Empty,
    Grid,
    List,
    NavBar,
    NoticeBar,
    Space,
    SpinLoading,
    Tabs,
    Tag,
    Toast
} from 'antd-mobile';
import {
    CheckCircleOutline,
    CloseCircleOutline,
    DeleteOutline,
    DeviceOutline,
    ExclamationCircleOutline,
    InfoCircleOutline,
    MinusCircleOutline,
    SetOutline,
    SpeedOutline,
    StarOutline
} from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';

const DeviceTest: React.FC = () => {
    const [activeTab, setActiveTab] = useState('device-info');
    const [deviceInfo, setDeviceInfo] = useState<any>(null);
    const [optimizationInfo, setOptimizationInfo] = useState<any>(null);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // 初始化设备信息
        const info = deviceDetector.getDeviceInfo();
        const optimization = deviceDetector.getOptimizationInfo();

        setDeviceInfo(info);
        setOptimizationInfo(optimization);

        // 启动设备监控
        deviceDetector.startMonitoring();
    }, []);

    const handleOptimizationChange = (optimizations: string[]) => {
        setOptimizationInfo(prev => ({ ...prev, optimizations }));
    };

    const runDeviceTest = async () => {
        setIsLoading(true);

        const results = [];

        // 模拟测试过程
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 设备类型测试
        results.push({
            id: 1,
            name: '设备类型检测',
            status: 'success',
            description: `检测到设备类型: ${deviceInfo?.type}`,
            details: `品牌: ${deviceInfo?.brand}, 型号: ${deviceInfo?.model}`
        });

        // 屏幕适配测试
        results.push({
            id: 2,
            name: '屏幕适配测试',
            status: 'success',
            description: `屏幕尺寸: ${deviceInfo?.screenWidth}x${deviceInfo?.screenHeight}`,
            details: `像素比: ${deviceInfo?.pixelRatio}x, 方向: ${deviceInfo?.orientation}`
        });

        // 触摸支持测试
        results.push({
            id: 3,
            name: '触摸支持测试',
            status: deviceInfo?.isTouch ? 'success' : 'warning',
            description: deviceInfo?.isTouch ? '支持触摸操作' : '不支持触摸操作',
            details: deviceInfo?.isTouch ? '触摸设备优化已启用' : '建议使用鼠标操作'
        });

        // 高分辨率测试
        results.push({
            id: 4,
            name: '高分辨率测试',
            status: deviceInfo?.isHighDPI ? 'success' : 'info',
            description: deviceInfo?.isHighDPI ? '高分辨率屏幕' : '标准分辨率屏幕',
            details: deviceInfo?.isHighDPI ? '高DPI优化已启用' : '标准分辨率优化'
        });

        // 性能测试
        results.push({
            id: 5,
            name: '性能测试',
            status: deviceInfo?.isLowMemory ? 'warning' : 'success',
            description: deviceInfo?.isLowMemory ? '低内存设备' : '正常内存设备',
            details: deviceInfo?.isLowMemory ? '低内存优化已启用' : '高性能优化已启用'
        });

        // 网络测试
        results.push({
            id: 6,
            name: '网络测试',
            status: deviceInfo?.isSlowNetwork ? 'warning' : 'success',
            description: deviceInfo?.isSlowNetwork ? '慢速网络' : '正常网络',
            details: deviceInfo?.isSlowNetwork ? '慢速网络优化已启用' : '标准网络优化'
        });

        setTestResults(results);
        setIsLoading(false);

        Toast.show({
            content: '设备测试完成',
            position: 'top'
        });
    };

    const clearTestResults = () => {
        Dialog.confirm({
            content: '确定要清除所有测试结果吗？',
            onConfirm: () => {
                setTestResults([]);
                Toast.show({
                    content: '测试结果已清除',
                    position: 'top'
                });
            }
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircleOutline className="text-green-500" />;
            case 'warning':
                return <ExclamationCircleOutline className="text-yellow-500" />;
            case 'error':
                return <CloseCircleOutline className="text-red-500" />;
            case 'info':
                return <InfoCircleOutline className="text-blue-500" />;
            default:
                return <MinusCircleOutline className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'warning':
                return 'warning';
            case 'error':
                return 'danger';
            case 'info':
                return 'primary';
            default:
                return 'default';
        }
    };

    const renderDeviceInfo = () => (
        <div className="space-y-4">
            <DeviceInfoPanel
                showDetails={true}
                onOptimizationChange={handleOptimizationChange}
            />

            <Card>
                <Card.Header title="设备适配状态" />
                <Card.Body>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {optimizationInfo?.optimizations.length || 0}
                            </div>
                            <div className="text-sm text-green-600">已应用优化</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {optimizationInfo?.features.length || 0}
                            </div>
                            <div className="text-sm text-blue-600">设备特性</div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );

    const renderAdaptationTest = () => (
        <div className="space-y-4">
            <Card>
                <Card.Header
                    title="设备适配测试"
                    extra={
                        <Space>
                            <Button
                                size="small"
                                fill="outline"
                                onClick={runDeviceTest}
                                disabled={isLoading}
                            >
                                {isLoading ? <SpinLoading size="small" /> : <SpeedOutline />}
                                运行测试
                            </Button>
                            <Button
                                size="small"
                                fill="outline"
                                onClick={clearTestResults}
                                disabled={testResults.length === 0}
                            >
                                <DeleteOutline />
                                清除结果
                            </Button>
                        </Space>
                    }
                />
                <Card.Body>
                    <NoticeBar
                        content="点击运行测试按钮开始设备适配测试，系统将自动检测设备特性并验证适配效果"
                        color="info"
                    />
                </Card.Body>
            </Card>

            {testResults.length > 0 ? (
                <Card>
                    <Card.Header title="测试结果" />
                    <Card.Body>
                        <List>
                            {testResults.map((result) => (
                                <List.Item
                                    key={result.id}
                                    prefix={getStatusIcon(result.status)}
                                    title={
                                        <div className="flex items-center justify-between">
                                            <span>{result.name}</span>
                                            <Tag color={getStatusColor(result.status)} fill="outline">
                                                {result.status}
                                            </Tag>
                                        </div>
                                    }
                                    description={result.description}
                                    extra={
                                        <Button
                                            size="mini"
                                            fill="outline"
                                            onClick={() => {
                                                Toast.show({
                                                    content: result.details,
                                                    position: 'top'
                                                });
                                            }}
                                        >
                                            详情
                                        </Button>
                                    }
                                />
                            ))}
                        </List>
                    </Card.Body>
                </Card>
            ) : (
                <Empty
                    image={<DeviceOutline className="text-gray-400 text-4xl" />}
                    description="暂无测试结果"
                />
            )}
        </div>
    );

    const renderResponsiveDemo = () => (
        <div className="space-y-4">
            <Card>
                <Card.Header title="响应式布局演示" />
                <Card.Body>
                    <NoticeBar
                        content="以下内容会根据设备类型自动调整布局和样式"
                        color="success"
                    />
                </Card.Body>
            </Card>

            {/* 网格布局演示 */}
            <Card>
                <Card.Header title="网格布局" />
                <Card.Body>
                    <Grid columns={4} gap={8}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <Grid.Item key={i}>
                                <div className="bg-blue-100 p-4 rounded-lg text-center">
                                    <div className="text-lg font-bold text-blue-600">{i + 1}</div>
                                    <div className="text-xs text-blue-500">网格项</div>
                                </div>
                            </Grid.Item>
                        ))}
                    </Grid>
                </Card.Body>
            </Card>

            {/* 按钮组演示 */}
            <Card>
                <Card.Header title="按钮组" />
                <Card.Body>
                    <div className="grid grid-cols-2 gap-4">
                        <Button color="primary" fill="solid">
                            主要按钮
                        </Button>
                        <Button color="success" fill="solid">
                            成功按钮
                        </Button>
                        <Button color="warning" fill="solid">
                            警告按钮
                        </Button>
                        <Button color="danger" fill="solid">
                            危险按钮
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* 卡片演示 */}
            <Card>
                <Card.Header title="卡片组件" />
                <Card.Body>
                    <div className="space-y-4">
                        <Card>
                            <Card.Header title="基础卡片" />
                            <Card.Body>
                                <p>这是一个基础卡片组件，会根据设备类型自动调整样式。</p>
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Header
                                title="带操作的卡片"
                                extra={<Button size="mini" fill="outline">操作</Button>}
                            />
                            <Card.Body>
                                <p>卡片可以包含各种操作按钮和内容。</p>
                            </Card.Body>
                        </Card>
                    </div>
                </Card.Body>
            </Card>

            {/* 列表演示 */}
            <Card>
                <Card.Header title="列表组件" />
                <Card.Body>
                    <List>
                        <List.Item prefix={<DeviceOutline />} title="设备信息" />
                        <List.Item prefix={<InfoCircleOutline />} title="系统信息" />
                        <List.Item prefix={<SetOutline />} title="设置选项" />
                        <List.Item prefix={<StarOutline />} title="收藏项目" />
                    </List>
                </Card.Body>
            </Card>

            {/* 标签演示 */}
            <Card>
                <Card.Header title="标签组件" />
                <Card.Body>
                    <div className="flex flex-wrap gap-2">
                        <Tag color="primary">主要标签</Tag>
                        <Tag color="success">成功标签</Tag>
                        <Tag color="warning">警告标签</Tag>
                        <Tag color="danger">危险标签</Tag>
                        <Tag color="info">信息标签</Tag>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );

    const renderOptimizationDetails = () => (
        <div className="space-y-4">
            <Card>
                <Card.Header title="优化详情" />
                <Card.Body>
                    <NoticeBar
                        content="当前设备应用的优化策略和效果"
                        color="info"
                    />
                </Card.Body>
            </Card>

            {optimizationInfo && (
                <>
                    {/* 优化策略 */}
                    <Card>
                        <Card.Header title="优化策略" />
                        <Card.Body>
                            <div className="space-y-3">
                                {optimizationInfo.optimizations.map((optimization: string, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <CheckCircleOutline className="text-green-500 mr-2" />
                                            <span>{optimization}</span>
                                        </div>
                                        <Tag color="success" fill="outline">已启用</Tag>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* CSS类应用 */}
                    <Card>
                        <Card.Header title="CSS类应用" />
                        <Card.Body>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-2">当前应用的CSS类:</div>
                                <div className="flex flex-wrap gap-1">
                                    {optimizationInfo.cssClasses.map((className: string, index: number) => (
                                        <Tag key={index} color="primary" fill="outline" className="text-xs">
                                            {className}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* 设备特性 */}
                    <Card>
                        <Card.Header title="设备特性" />
                        <Card.Body>
                            <div className="space-y-3">
                                {optimizationInfo.features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center">
                                            <StarOutline className="text-blue-500 mr-2" />
                                            <span>{feature}</span>
                                        </div>
                                        <Tag color="primary" fill="outline">支持</Tag>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    );

    return (
        <div className="device-test-page">
            <NavBar onBack={() => window.history.back()}>
                设备适配测试
            </NavBar>

            <div className="p-4">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                >
                    <Tabs.Tab title="设备信息" key="device-info">
                        {renderDeviceInfo()}
                    </Tabs.Tab>

                    <Tabs.Tab title="适配测试" key="adaptation-test">
                        {renderAdaptationTest()}
                    </Tabs.Tab>

                    <Tabs.Tab title="响应式演示" key="responsive-demo">
                        {renderResponsiveDemo()}
                    </Tabs.Tab>

                    <Tabs.Tab title="优化详情" key="optimization-details">
                        {renderOptimizationDetails()}
                    </Tabs.Tab>
                </Tabs>
            </div>
        </div>
    );
};

export default DeviceTest;
