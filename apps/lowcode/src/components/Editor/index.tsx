'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    getDesignOffline,
    initNetworkMonitor,
    saveDesignOffline
} from '../../utils/offlineStorage';
import NetworkStatus from '../NetworkStatus';

interface EditorProps {
    designId: string;
}

export default function Editor({ designId }: EditorProps) {
    const [design, setDesign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // 加载设计
    useEffect(() => {
        loadDesign();

        // 设置自动保存
        const timer = setInterval(() => {
            if (design && design.isDirty) {
                saveDesign();
            }
        }, 30000); // 每30秒自动保存

        return () => {
            clearInterval(timer);
        };
    }, [designId]);

    // 网络状态监听
    useEffect(() => {
        const cleanup = initNetworkMonitor(
            // 在线回调
            () => {
                setIsOffline(false);
                toast.success('网络已连接，您的更改将自动同步');
            },
            // 离线回调
            () => {
                setIsOffline(true);
                toast.warning('网络已断开，编辑器将以离线模式运行');
            }
        );

        return cleanup;
    }, []);

    // 加载设计数据
    const loadDesign = async () => {
        setIsLoading(true);

        try {
            // 尝试从网络加载
            if (navigator.onLine) {
                try {
                    const response = await fetch(`/api/designs/${designId}`);

                    if (response.ok) {
                        const data = await response.json();
                        setDesign(data);

                        // 同时保存到离线存储
                        await saveDesignOffline(data);
                        setIsLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error('从网络加载设计失败，尝试使用本地缓存:', error);
                }
            }

            // 如果网络请求失败或离线，从本地加载
            const offlineDesign = await getDesignOffline(designId);

            if (offlineDesign) {
                setDesign(offlineDesign);
                if (isOffline) {
                    toast.info('您正在编辑缓存的版本，连接网络后会自动同步');
                }
            } else {
                toast.error('无法加载设计，请检查网络连接');
            }
        } catch (error) {
            console.error('加载设计失败:', error);
            toast.error('加载设计失败');
        } finally {
            setIsLoading(false);
        }
    };

    // 保存设计
    const saveDesign = async () => {
        if (isSaving || !design) return;

        setIsSaving(true);

        try {
            // 标记设计有改动
            const updatedDesign = {
                ...design,
                isDirty: true,
                updatedAt: new Date().toISOString()
            };

            // 先保存到离线存储
            await saveDesignOffline(updatedDesign);

            // 如果在线，尝试保存到服务器
            if (navigator.onLine) {
                try {
                    const response = await fetch(`/api/designs/${designId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedDesign)
                    });

                    if (response.ok) {
                        const savedDesign = await response.json();
                        setDesign({
                            ...savedDesign,
                            isDirty: false
                        });
                        toast.success('设计已保存');
                    } else {
                        toast.warning('无法保存到服务器，已保存到本地');
                    }
                } catch (error) {
                    console.error('保存到服务器失败:', error);
                    toast.warning('无法保存到服务器，已保存到本地');
                }
            } else {
                toast.info('已保存到本地，连接网络后将自动同步');
            }
        } catch (error) {
            console.error('保存设计失败:', error);
            toast.error('保存设计失败');
        } finally {
            setIsSaving(false);
        }
    };

    // 处理组件更新
    const handleComponentUpdate = (updatedComponents: any[]) => {
        setDesign(prev => ({
            ...prev,
            components: updatedComponents,
            isDirty: true
        }));
    };

    // 处理页面配置更新
    const handleConfigUpdate = (updatedConfig: any) => {
        setDesign(prev => ({
            ...prev,
            config: updatedConfig,
            isDirty: true
        }));
    };

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">加载中...</div>;
    }

    return (
        <div className="editor-container">
            {isOffline && (
                <div className="offline-indicator p-2 bg-amber-100 text-amber-800 text-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    离线模式 - 您的更改将在网络恢复后同步
                </div>
            )}

            {/* 编辑器界面 */}
            <div className="editor-workspace">
                {/* 这里是编辑器的实际内容，根据您的低代码平台实现 */}
                <div className="p-4">
                    <h2 className="text-lg font-medium">{design?.name || '未命名设计'}</h2>
                    {/* 组件列表、画布区域等 */}
                </div>
            </div>

            <div className="bottom-toolbar p-3 border-t flex justify-between">
                <div>
                    {/* 其他工具栏按钮 */}
                </div>
                <button
                    onClick={saveDesign}
                    disabled={isSaving || !design?.isDirty}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isSaving ? '保存中...' : '保存'}
                </button>
            </div>

            {/* 离线状态提示 */}
            <NetworkStatus />
        </div>
    );
}
