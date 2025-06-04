import { Component, Design } from '../types';

// 数据库名称和版本
const DB_NAME = 'LowCodeOfflineDB';
const DB_VERSION = 1;

// 存储名称
const DESIGNS_STORE = 'designs';
const COMPONENTS_STORE = 'components';
const SYNC_QUEUE_STORE = 'syncQueue';

// 打开数据库连接
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject('您的浏览器不支持 IndexedDB，离线功能将不可用');
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject('无法打开离线数据库');
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // 创建设计存储
            if (!db.objectStoreNames.contains(DESIGNS_STORE)) {
                const designStore = db.createObjectStore(DESIGNS_STORE, { keyPath: 'id' });
                designStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                designStore.createIndex('userId', 'userId', { unique: false });
            }

            // 创建组件存储
            if (!db.objectStoreNames.contains(COMPONENTS_STORE)) {
                const componentStore = db.createObjectStore(COMPONENTS_STORE, { keyPath: 'id' });
                componentStore.createIndex('type', 'type', { unique: false });
                componentStore.createIndex('category', 'category', { unique: false });
            }

            // 创建同步队列存储
            if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
                const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                syncStore.createIndex('operation', 'operation', { unique: false });
                syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };
    });
};

// 保存设计到离线存储
export const saveDesignOffline = async (design: Design): Promise<string> => {
    try {
        const db = await openDB();
        const tx = db.transaction(DESIGNS_STORE, 'readwrite');
        const store = tx.objectStore(DESIGNS_STORE);

        // 确保设计有更新时间
        const designToSave = {
            ...design,
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.put(designToSave);

            request.onsuccess = () => {
                // 添加到同步队列
                addToSyncQueue('save', designToSave)
                    .then(() => resolve(designToSave.id))
                    .catch(reject);
            };

            request.onerror = () => reject(new Error('保存设计失败'));
        });
    } catch (error) {
        console.error('保存设计到离线存储失败:', error);
        throw error;
    }
};

// 从离线存储获取设计
export const getDesignOffline = async (id: string): Promise<Design | null> => {
    try {
        const db = await openDB();
        const tx = db.transaction(DESIGNS_STORE, 'readonly');
        const store = tx.objectStore(DESIGNS_STORE);

        return new Promise((resolve, reject) => {
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('获取设计失败');
                resolve(null);
            };
        });
    } catch (error) {
        console.error('从离线存储获取设计失败:', error);
        return null;
    }
};

// 获取所有离线设计
export const getAllDesignsOffline = async (): Promise<Design[]> => {
    try {
        const db = await openDB();
        const tx = db.transaction(DESIGNS_STORE, 'readonly');
        const store = tx.objectStore(DESIGNS_STORE);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('获取所有设计失败');
                resolve([]);
            };
        });
    } catch (error) {
        console.error('获取所有离线设计失败:', error);
        return [];
    }
};

// 删除离线设计
export const deleteDesignOffline = async (id: string): Promise<void> => {
    try {
        const db = await openDB();
        const tx = db.transaction(DESIGNS_STORE, 'readwrite');
        const store = tx.objectStore(DESIGNS_STORE);

        // 先获取设计数据，以便添加到同步队列
        const design = await getDesignOffline(id);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => {
                // 添加删除操作到同步队列
                if (design) {
                    addToSyncQueue('delete', design)
                        .then(() => resolve())
                        .catch(reject);
                } else {
                    resolve();
                }
            };

            request.onerror = () => reject(new Error('删除设计失败'));
        });
    } catch (error) {
        console.error('删除离线设计失败:', error);
        throw error;
    }
};

// 缓存组件库
export const cacheComponents = async (components: Component[]): Promise<void> => {
    try {
        const db = await openDB();
        const tx = db.transaction(COMPONENTS_STORE, 'readwrite');
        const store = tx.objectStore(COMPONENTS_STORE);

        // 批量保存
        return new Promise((resolve, reject) => {
            let completed = 0;
            let success = true;

            components.forEach(component => {
                const request = store.put(component);

                request.onsuccess = () => {
                    completed++;
                    if (completed === components.length) {
                        resolve();
                    }
                };

                request.onerror = () => {
                    success = false;
                    completed++;
                    if (completed === components.length) {
                        if (!success) {
                            reject(new Error('缓存部分组件失败'));
                        } else {
                            resolve();
                        }
                    }
                };
            });
        });
    } catch (error) {
        console.error('缓存组件库失败:', error);
        throw error;
    }
};

// 获取缓存的组件
export const getCachedComponents = async (category?: string): Promise<Component[]> => {
    try {
        const db = await openDB();
        const tx = db.transaction(COMPONENTS_STORE, 'readonly');
        const store = tx.objectStore(COMPONENTS_STORE);

        return new Promise((resolve, reject) => {
            let request;

            if (category) {
                const index = store.index('category');
                request = index.getAll(category);
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('获取组件失败');
                resolve([]);
            };
        });
    } catch (error) {
        console.error('获取缓存组件失败:', error);
        return [];
    }
};

// 添加操作到同步队列
export const addToSyncQueue = async (
    operation: 'save' | 'delete' | 'publish',
    data: any
): Promise<void> => {
    try {
        const db = await openDB();
        const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const request = store.add({
                operation,
                data,
                timestamp: new Date().toISOString(),
                attempts: 0
            });

            request.onsuccess = () => {
                // 注册同步任务
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker.ready
                        .then(registration => registration.sync.register('sync-design'))
                        .then(() => resolve())
                        .catch(reject);
                } else {
                    // 不支持后台同步API，尝试立即同步
                    trySyncNow()
                        .then(() => resolve())
                        .catch(reject);
                }
            };

            request.onerror = () => reject(new Error('添加到同步队列失败'));
        });
    } catch (error) {
        console.error('添加到同步队列失败:', error);
        throw error;
    }
};

// 立即尝试同步
export const trySyncNow = async (): Promise<void> => {
    try {
        const pendingItems = await getPendingSyncItems();

        for (const item of pendingItems) {
            try {
                let endpoint = '';
                let method = 'POST';

                switch (item.operation) {
                    case 'save':
                        endpoint = '/api/designs';
                        method = item.data.id ? 'PUT' : 'POST';
                        break;
                    case 'delete':
                        endpoint = `/api/designs/${item.data.id}`;
                        method = 'DELETE';
                        break;
                    case 'publish':
                        endpoint = `/api/designs/${item.data.id}/publish`;
                        method = 'POST';
                        break;
                }

                const response = await fetch(endpoint, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(item.data)
                });

                if (response.ok) {
                    await removeSyncItem(item.id);
                } else {
                    await updateSyncAttempt(item.id);
                }
            } catch (error) {
                console.error(`同步项目 ${item.id} 失败:`, error);
                await updateSyncAttempt(item.id);
            }
        }
    } catch (error) {
        console.error('同步失败:', error);
        throw error;
    }
};

// 获取待同步项目
const getPendingSyncItems = async (): Promise<any[]> => {
    try {
        const db = await openDB();
        const tx = db.transaction(SYNC_QUEUE_STORE, 'readonly');
        const store = tx.objectStore(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('获取同步队列失败');
                resolve([]);
            };
        });
    } catch (error) {
        console.error('获取待同步项目失败:', error);
        return [];
    }
};

// 从同步队列移除项目
const removeSyncItem = async (id: number): Promise<void> => {
    try {
        const db = await openDB();
        const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('移除同步项目失败'));
        });
    } catch (error) {
        console.error('从同步队列移除项目失败:', error);
        throw error;
    }
};

// 更新同步尝试次数
const updateSyncAttempt = async (id: number): Promise<void> => {
    try {
        const db = await openDB();
        const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            // 先获取项目
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                if (!getRequest.result) {
                    resolve();
                    return;
                }

                const item = getRequest.result;
                item.attempts = (item.attempts || 0) + 1;

                // 如果尝试次数过多，考虑移除
                if (item.attempts > 10) {
                    const deleteRequest = store.delete(id);
                    deleteRequest.onsuccess = () => resolve();
                    deleteRequest.onerror = () => reject(new Error('移除过期同步项目失败'));
                } else {
                    // 更新尝试次数
                    const updateRequest = store.put(item);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(new Error('更新同步尝试次数失败'));
                }
            };

            getRequest.onerror = () => reject(new Error('获取同步项目失败'));
        });
    } catch (error) {
        console.error('更新同步尝试次数失败:', error);
        throw error;
    }
};

// 监控网络连接状态
export const initNetworkMonitor = (
    onlineCallback: () => void,
    offlineCallback: () => void
): () => void => {
    const handleOnline = () => {
        onlineCallback();
        // 网络恢复，尝试同步
        trySyncNow().catch(console.error);
    };

    const handleOffline = () => {
        offlineCallback();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始检查
    if (!navigator.onLine) {
        offlineCallback();
    }

    // 清理函数
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
};
