const CACHE_NAME = 'lowcode-cache-v1';
const COMPONENT_CACHE = 'component-cache-v1';
const USER_DATA_STORE = 'user-designs';

// 需要缓存的核心资源
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/css/main.css',
    '/offline.html',
    '/assets/editor-fallback.png'
];

// 组件资源
const COMPONENT_ASSETS = [
    '/components/manifest.json',
    '/components/basic/',
    '/components/layout/',
    '/components/form/',
    '/components/chart/',
    '/assets/component-icons/'
];

// 安装服务工作线程
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // 缓存核心资源
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(CORE_ASSETS);
            }),
            // 缓存组件资源
            caches.open(COMPONENT_CACHE).then((cache) => {
                return cache.addAll(COMPONENT_ASSETS);
            })
        ])
    );
    self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return (cacheName !== CACHE_NAME && cacheName !== COMPONENT_CACHE);
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 处理请求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 对组件资源使用缓存优先策略
    if (url.pathname.startsWith('/components/') ||
        url.pathname.startsWith('/assets/component-icons/')) {
        event.respondWith(cacheFirstStrategy(request, COMPONENT_CACHE));
    }
    // 编辑器核心资源使用缓存优先
    else if (request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font') {
        event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    }
    // API 请求使用网络优先，失败时提供降级处理
    else if (url.pathname.startsWith('/api/')) {
        event.respondWith(apiNetworkWithFallback(request));
    }
    // 其他请求使用网络优先
    else {
        event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    }
});

// 处理后台同步
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-design') {
        event.waitUntil(syncDesigns());
    }
});

// 处理推送通知
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/logo-192x192.png',
        badge: '/assets/badge-72x72.png',
        data: {
            url: data.url
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 点击通知处理
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// 缓存优先策略
async function cacheFirstStrategy(request, cacheName) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        // 只缓存成功的响应
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // 当网络请求失败且没有缓存时，返回默认响应
        if (request.destination === 'image') {
            return caches.match('/assets/component-placeholder.png');
        }

        return new Response('Network error', { status: 408 });
    }
}

// 网络优先策略
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        // 缓存成功的响应
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 当请求HTML页面时返回离线页面
        if (request.destination === 'document') {
            return caches.match('/offline.html');
        }

        return new Response('Network error', { status: 503 });
    }
}

// API请求处理带有降级机制
async function apiNetworkWithFallback(request) {
    // 获取认证令牌
    let token = null;
    try {
        // 尝试从客户端获取令牌
        const clientId = self.clients.matchAll().then(clients => clients[0]?.id);
        if (clientId) {
            // 向客户端请求令牌
            token = await new Promise(resolve => {
                const channel = new MessageChannel();
                channel.port1.onmessage = event => resolve(event.data?.token);
                self.clients.get(clientId).then(client => {
                    client.postMessage({ type: 'GET_AUTH_TOKEN' }, [channel.port2]);
                });
            });
        }
    } catch (error) {
        console.warn('获取认证令牌失败', error);
    }

    // 克隆请求，因为请求只能使用一次
    const requestClone = request.clone();

    // 如果有令牌，添加到请求头
    if (token) {
        // 创建带认证头的新请求
        const authorizedRequest = new Request(requestClone.url, {
            method: requestClone.method,
            headers: {
                ...Object.fromEntries(requestClone.headers.entries()),
                'Authorization': `Bearer ${token}`
            },
            body: requestClone.method !== 'GET' && requestClone.method !== 'HEAD' ? await requestClone.clone().text() : undefined,
            mode: requestClone.mode,
            credentials: requestClone.credentials,
            cache: requestClone.cache,
            redirect: requestClone.redirect,
            referrer: requestClone.referrer
        });

        try {
            const response = await fetch(authorizedRequest);
            return response;
        } catch (error) {
            // 处理离线模式
            const url = new URL(request.url);

            // 如果是获取组件列表的API
            if (url.pathname.includes('/api/components')) {
                return caches.match('/api/components')
                    .then(cachedResponse => cachedResponse ||
                        new Response(JSON.stringify({
                            components: [],
                            error: '离线模式，无法获取完整组件库'
                        }), {
                            headers: { 'Content-Type': 'application/json' }
                        })
                    );
            }

            // 如果是获取用户设计的API
            if (url.pathname.includes('/api/designs')) {
                // 返回从IndexedDB中获取的设计
                return getOfflineDesigns().then(designs => {
                    return new Response(JSON.stringify({ designs }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            }

            // 其他API请求
            return new Response(JSON.stringify({
                error: '您当前处于离线状态，此操作无法完成'
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } else {
        // 没有令牌，尝试原始请求
        try {
            const response = await fetch(requestClone);
            return response;
        } catch (error) {
            // 处理离线模式
            const url = new URL(request.url);

            // 如果是获取组件列表的API
            if (url.pathname.includes('/api/components')) {
                return caches.match('/api/components')
                    .then(cachedResponse => cachedResponse ||
                        new Response(JSON.stringify({
                            components: [],
                            error: '离线模式，无法获取完整组件库'
                        }), {
                            headers: { 'Content-Type': 'application/json' }
                        })
                    );
            }

            // 如果是获取用户设计的API
            if (url.pathname.includes('/api/designs')) {
                // 返回从IndexedDB中获取的设计
                return getOfflineDesigns().then(designs => {
                    return new Response(JSON.stringify({ designs }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            }

            // 其他API请求
            return new Response(JSON.stringify({
                error: '您当前处于离线状态，此操作无法完成'
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

// 同步设计到服务器
async function syncDesigns() {
    const pendingDesigns = await getPendingDesigns();

    for (const design of pendingDesigns) {
        try {
            const response = await fetch('/api/designs/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(design)
            });

            if (response.ok) {
                await markDesignSynced(design.id);
            }
        } catch (error) {
            console.error('同步设计失败:', error);
            // 稍后再尝试
            await self.registration.sync.register('sync-design');
            break;
        }
    }
}

// 从IndexedDB获取待同步设计
async function getPendingDesigns() {
    // 实际实现将访问IndexedDB
    return [];
}

// 标记设计为已同步
async function markDesignSynced(id) {
    // 实际实现将更新IndexedDB记录
}

// 获取离线存储的设计
async function getOfflineDesigns() {
    // 实际实现将从IndexedDB获取数据
    return [];
}
