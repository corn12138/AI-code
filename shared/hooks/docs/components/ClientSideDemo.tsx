import React, { useEffect, useState } from 'react';

// 简化的 useClientSide 实现
function useSimpleClientSide() {
    const [isClient, setIsClient] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setHasMounted(true);
    }, []);

    return {
        isClient,
        hasMounted,
        isServer: !isClient
    };
}

// 浏览器信息检测
function useBrowserInfo() {
    const [browserInfo, setBrowserInfo] = useState<{
        userAgent: string;
        platform: string;
        language: string;
        cookieEnabled: boolean;
        onLine: boolean;
        screenWidth: number;
        screenHeight: number;
        viewportWidth: number;
        viewportHeight: number;
        colorDepth: number;
        pixelRatio: number;
        timezone: string;
        touchSupport: boolean;
    } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updateBrowserInfo = () => {
                setBrowserInfo({
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine,
                    screenWidth: screen.width,
                    screenHeight: screen.height,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    colorDepth: screen.colorDepth,
                    pixelRatio: window.devicePixelRatio || 1,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
                });
            };

            updateBrowserInfo();

            // 监听窗口大小变化
            window.addEventListener('resize', updateBrowserInfo);
            window.addEventListener('online', updateBrowserInfo);
            window.addEventListener('offline', updateBrowserInfo);

            return () => {
                window.removeEventListener('resize', updateBrowserInfo);
                window.removeEventListener('online', updateBrowserInfo);
                window.removeEventListener('offline', updateBrowserInfo);
            };
        }
    }, []);

    return browserInfo;
}

// 服务端渲染安全组件
function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    const { isClient } = useSimpleClientSide();

    return isClient ? <>{children}</> : <>{fallback}</>;
}

export default function ClientSideDemo() {
    const { isClient, hasMounted, isServer } = useSimpleClientSide();
    const browserInfo = useBrowserInfo();
    const [renderTime, setRenderTime] = useState<string>('');
    const [reRenderCount, setReRenderCount] = useState(0);
    const [showClientContent, setShowClientContent] = useState(false);

    // 记录渲染时间
    useEffect(() => {
        if (hasMounted) {
            setRenderTime(new Date().toLocaleTimeString());
        }
    }, [hasMounted]);

    // 模拟重新渲染
    const triggerReRender = () => {
        setReRenderCount(prev => prev + 1);
    };

    const getBrowserName = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        return '未知浏览器';
    };

    const getDeviceType = (userAgent: string, touchSupport: boolean) => {
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            return '移动设备';
        }
        if (touchSupport) {
            return '触屏设备';
        }
        return '桌面设备';
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>💻 客户端检测演示</h4>

            {/* 基础状态显示 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{
                    padding: '16px',
                    background: isClient ? '#f6ffed' : '#fff7e6',
                    border: `1px solid ${isClient ? '#b7eb8f' : '#ffc53d'}`,
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {isClient ? '🌐' : '🔧'}
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {isClient ? '客户端环境' : '服务端环境'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        isClient: {isClient.toString()}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    background: hasMounted ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${hasMounted ? '#b7eb8f' : '#ffb3b3'}`,
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {hasMounted ? '✅' : '⏳'}
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {hasMounted ? '已挂载' : '挂载中'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        hasMounted: {hasMounted.toString()}
                    </div>
                    {renderTime && (
                        <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                            挂载时间: {renderTime}
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '16px',
                    background: '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        重渲染次数
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                        {reRenderCount}
                    </div>
                    <button
                        onClick={triggerReRender}
                        style={{
                            marginTop: '8px',
                            padding: '4px 8px',
                            background: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        触发重渲染
                    </button>
                </div>
            </div>

            {/* SSR 安全组件演示 */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    <h5 style={{ margin: 0 }}>SSR 安全组件演示</h5>
                    <button
                        onClick={() => setShowClientContent(!showClientContent)}
                        style={{
                            padding: '6px 12px',
                            background: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {showClientContent ? '隐藏' : '显示'}客户端内容
                    </button>
                </div>

                <div style={{
                    padding: '16px',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>总是显示的内容：</strong> 这段文字在服务端和客户端都会渲染
                    </div>

                    <ClientOnly fallback={<div style={{ color: '#faad14' }}>⏳ 服务端渲染时显示的占位内容...</div>}>
                        <div style={{ color: '#52c41a' }}>
                            ✅ 只在客户端显示的内容：当前时间是 {new Date().toLocaleString()}
                        </div>
                    </ClientOnly>

                    {showClientContent && (
                        <ClientOnly>
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                background: '#e6f7ff',
                                border: '1px solid #91d5ff',
                                borderRadius: '4px'
                            }}>
                                🎯 这是动态显示的客户端专属内容！<br />
                                随机数: {Math.random().toFixed(4)}
                            </div>
                        </ClientOnly>
                    )}
                </div>
            </div>

            {/* 浏览器信息 */}
            <ClientOnly
                fallback={
                    <div style={{
                        padding: '16px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        ⏳ 正在加载浏览器信息...
                    </div>
                }
            >
                {browserInfo && (
                    <div>
                        <h5 style={{ margin: '0 0 12px 0' }}>浏览器环境信息</h5>

                        {/* 基本信息卡片 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🌏 浏览器信息</div>
                                <div style={{ fontSize: '12px' }}>
                                    <div><strong>浏览器:</strong> {getBrowserName(browserInfo.userAgent)}</div>
                                    <div><strong>平台:</strong> {browserInfo.platform}</div>
                                    <div><strong>语言:</strong> {browserInfo.language}</div>
                                    <div><strong>时区:</strong> {browserInfo.timezone}</div>
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📱 设备信息</div>
                                <div style={{ fontSize: '12px' }}>
                                    <div><strong>设备类型:</strong> {getDeviceType(browserInfo.userAgent, browserInfo.touchSupport)}</div>
                                    <div><strong>触屏支持:</strong> {browserInfo.touchSupport ? '是' : '否'}</div>
                                    <div><strong>像素比:</strong> {browserInfo.pixelRatio}x</div>
                                    <div><strong>颜色深度:</strong> {browserInfo.colorDepth}位</div>
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📏 屏幕信息</div>
                                <div style={{ fontSize: '12px' }}>
                                    <div><strong>屏幕:</strong> {browserInfo.screenWidth} × {browserInfo.screenHeight}</div>
                                    <div><strong>视口:</strong> {browserInfo.viewportWidth} × {browserInfo.viewportHeight}</div>
                                    <div><strong>网络:</strong> {browserInfo.onLine ? '在线' : '离线'}</div>
                                    <div><strong>Cookie:</strong> {browserInfo.cookieEnabled ? '启用' : '禁用'}</div>
                                </div>
                            </div>
                        </div>

                        {/* User Agent */}
                        <div style={{
                            padding: '12px',
                            background: '#f5f5f5',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔍 User Agent</div>
                            <div style={{
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                color: '#666'
                            }}>
                                {browserInfo.userAgent}
                            </div>
                        </div>
                    </div>
                )}
            </ClientOnly>

            {/* 状态说明 */}
            <div style={{
                marginTop: '20px',
                padding: '12px',
                background: '#f0f2f5',
                borderRadius: '6px'
            }}>
                <h6 style={{ margin: '0 0 8px 0' }}>Hook 状态说明：</h6>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div><strong>isClient:</strong> {isClient.toString()} - 是否在客户端环境</div>
                    <div><strong>isServer:</strong> {isServer.toString()} - 是否在服务端环境</div>
                    <div><strong>hasMounted:</strong> {hasMounted.toString()} - 组件是否已完成挂载</div>
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                💡 提示：useClientSide 用于解决 SSR/SSG 环境下的水合(hydration)问题，确保客户端专属代码只在客户端执行！
            </div>
        </div>
    );
} 