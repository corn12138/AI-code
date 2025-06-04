'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { trySyncNow } from '../utils/offlineStorage';

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // 检查初始网络状态
        setIsOnline(navigator.onLine);

        // 添加网络状态监听
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('网络连接已恢复，正在同步更改...');
            syncChanges();
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('网络连接已断开，您现在处于离线模式');
        };

        // 监听同步状态的事件
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'lowcode_sync_pending') {
                setHasPendingChanges(e.newValue === 'true');
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('storage', handleStorage);

        // 检查是否有待同步的更改
        checkPendingChanges();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    // 检查是否有待同步的更改
    const checkPendingChanges = async () => {
        try {
            const request = indexedDB.open('LowCodeOfflineDB');
            request.onsuccess = (event: Event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('syncQueue')) {
                    setHasPendingChanges(false);
                    return;
                }

                const tx = db.transaction('syncQueue', 'readonly');
                const store = tx.objectStore('syncQueue');
                const countRequest = store.count();

                countRequest.onsuccess = () => {
                    const hasPending = countRequest.result > 0;
                    setHasPendingChanges(hasPending);
                    localStorage.setItem('lowcode_sync_pending', String(hasPending));
                };
            };
        } catch (error) {
            console.error('检查待同步更改失败:', error);
        }
    };

    // 同步更改
    const syncChanges = async () => {
        if (!isOnline || isSyncing) return;

        try {
            setIsSyncing(true);
            await trySyncNow();
            await checkPendingChanges();
            setIsSyncing(false);
        } catch (error) {
            console.error('同步更改失败:', error);
            setIsSyncing(false);
        }
    };

    // 不显示任何UI，仅处理状态
    if (isOnline && !hasPendingChanges) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg ${isOnline ? 'bg-blue-50' : 'bg-amber-50'
            }`}>
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'
                    }`}></div>
                <span className="text-sm font-medium">
                    {!isOnline ? '离线模式' : hasPendingChanges ? '有待同步的更改' : '在线'}
                </span>

                {isOnline && hasPendingChanges && (
                    <button
                        onClick={syncChanges}
                        disabled={isSyncing}
                        className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isSyncing ? '同步中...' : '立即同步'}
                    </button>
                )}
            </div>
        </div>
    );
}
