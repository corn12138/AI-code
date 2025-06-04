export default function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker 注册成功:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker 注册失败:', error);
                });
        });

        // 监听服务工作线程消息
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'SYNC_COMPLETE') {
                console.log('同步完成:', event.data.syncedItems);
            }
        });
    }
}
