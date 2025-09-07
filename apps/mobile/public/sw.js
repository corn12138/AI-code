/**
 * Service Worker
 * 处理离线缓存、网络请求和资源管理
 */

const CACHE_NAME = 'workbench-cache-v1';
const STATIC_CACHE_NAME = 'workbench-static-v1';
const DYNAMIC_CACHE_NAME = 'workbench-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/favicon.ico'
];

// 需要缓存的API路径
const API_CACHE_PATTERNS = [
    /\/api\/user/,
    /\/api\/config/,
    /\/api\/settings/
];

// 不需要缓存的路径
const NO_CACHE_PATTERNS = [
    /\/api\/auth/,
    /\/api\/logout/,
    /\/api\/upload/
];

// 安装事件
self.addEventListener('install', (event) => {
    console.log('Service Worker 安装中...');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker 安装完成');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker 安装失败:', error);
            })
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker 激活中...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // 删除旧版本的缓存
                        if (cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker 激活完成');
                return self.clients.claim();
            })
    );
});

// 获取请求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }

    // 跳过非GET请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过不需要缓存的请求
    if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        return;
    }

    event.respondWith(handleFetch(request));
});

/**
 * 处理获取请求
 */
async function handleFetch(request) {
    const url = new URL(request.url);

    try {
        // 首先尝试从网络获取
        const networkResponse = await fetch(request);

        // 如果是成功的响应，缓存它
        if (networkResponse.ok) {
            await cacheResponse(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('网络请求失败，尝试从缓存获取:', request.url);

        // 网络失败，尝试从缓存获取
        const cachedResponse = await getCachedResponse(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // 缓存也没有，返回离线页面
        return getOfflineResponse(request);
    }
}

/**
 * 缓存响应
 */
async function cacheResponse(request, response) {
    const url = new URL(request.url);

    // 判断是否需要缓存
    if (shouldCacheRequest(url)) {
        try {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            await cache.put(request, response.clone());
            console.log('缓存响应:', request.url);
        } catch (error) {
            console.error('缓存响应失败:', error);
        }
    }
}

/**
 * 从缓存获取响应
 */
async function getCachedResponse(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = await cache.match(request);

        if (response) {
            console.log('从缓存获取:', request.url);
            return response;
        }

        // 尝试从静态缓存获取
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        return await staticCache.match(request);
    } catch (error) {
        console.error('获取缓存响应失败:', error);
        return null;
    }
}

/**
 * 获取离线响应
 */
async function getOfflineResponse(request) {
    const url = new URL(request.url);

    // 如果是API请求，返回JSON格式的离线响应
    if (url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({
            error: 'offline',
            message: '网络连接不可用，请检查网络设置',
            timestamp: Date.now()
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    }

    // 其他请求返回离线页面
    try {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const offlinePage = await cache.match('/offline.html');

        if (offlinePage) {
            return offlinePage;
        }

        // 如果没有离线页面，返回简单的HTML
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>离线</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: #f5f5f5;
                    }
                    .offline-container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .offline-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                    }
                    .offline-title {
                        font-size: 1.5rem;
                        margin-bottom: 0.5rem;
                        color: #333;
                    }
                    .offline-message {
                        color: #666;
                        margin-bottom: 1rem;
                    }
                    .retry-button {
                        background: #007AFF;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    .retry-button:hover {
                        background: #0056CC;
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📶</div>
                    <h1 class="offline-title">网络连接不可用</h1>
                    <p class="offline-message">请检查您的网络连接并重试</p>
                    <button class="retry-button" onclick="window.location.reload()">
                        重新加载
                    </button>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (error) {
        console.error('获取离线响应失败:', error);

        return new Response('网络连接不可用', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * 判断是否应该缓存请求
 */
function shouldCacheRequest(url) {
    // 缓存API请求
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        return true;
    }

    // 缓存静态资源
    if (url.pathname.startsWith('/static/') ||
        url.pathname.startsWith('/assets/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.svg')) {
        return true;
    }

    return false;
}

/**
 * 清理过期缓存
 */
async function cleanupExpiredCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const cacheTime = response.headers.get('sw-cache-time');
                if (cacheTime) {
                    const age = Date.now() - parseInt(cacheTime);
                    // 删除超过1小时的缓存
                    if (age > 60 * 60 * 1000) {
                        await cache.delete(request);
                        console.log('删除过期缓存:', request.url);
                    }
                }
            }
        }
    } catch (error) {
        console.error('清理过期缓存失败:', error);
    }
}

// 定期清理过期缓存
setInterval(cleanupExpiredCache, 30 * 60 * 1000); // 每30分钟清理一次

// 监听消息
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            clearAllCaches();
            break;

        case 'GET_CACHE_INFO':
            getCacheInfo().then(info => {
                event.ports[0].postMessage(info);
            });
            break;

        default:
            console.log('未知消息类型:', type);
    }
});

/**
 * 清除所有缓存
 */
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('所有缓存已清除');
    } catch (error) {
        console.error('清除缓存失败:', error);
    }
}

/**
 * 获取缓存信息
 */
async function getCacheInfo() {
    try {
        const cacheNames = await caches.keys();
        const cacheInfo = {};

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            cacheInfo[cacheName] = {
                size: requests.length,
                urls: requests.map(req => req.url)
            };
        }

        return cacheInfo;
    } catch (error) {
        console.error('获取缓存信息失败:', error);
        return {};
    }
}

console.log('Service Worker 已加载');
