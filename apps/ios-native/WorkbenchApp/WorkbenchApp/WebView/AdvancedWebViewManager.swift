import SwiftUI
import WebKit
import Combine

// MARK: - 大厂级别的 H5 嵌入方案
class AdvancedWebViewManager: NSObject, ObservableObject {
    @Published var isLoading = false
    @Published var progress: Double = 0.0
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var title = ""
    @Published var url: URL?
    @Published var error: Error?
    
    private var webView: WKWebView?
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - 配置选项
    struct Configuration {
        var allowsInlineMediaPlayback = true
        var mediaTypesRequiringUserActionForPlayback: WKAudiovisualMediaTypes = []
        var allowsAirPlayForMediaPlayback = true
        var allowsPictureInPictureMediaPlayback = true
        var isScrollEnabled = true
        var isBouncesEnabled = true
        var showsHorizontalScrollIndicator = false
        var showsVerticalScrollIndicator = true
        var contentInsetAdjustmentBehavior: UIScrollView.ContentInsetAdjustmentBehavior = .automatic
    }
    
    private let config: Configuration
    
    init(configuration: Configuration = Configuration()) {
        self.config = configuration
        super.init()
        setupWebView()
    }
    
    private func setupWebView() {
        let webConfig = WKWebViewConfiguration()
        
        // 媒体播放配置
        webConfig.allowsInlineMediaPlayback = config.allowsInlineMediaPlayback
        webConfig.mediaTypesRequiringUserActionForPlayback = config.mediaTypesRequiringUserActionForPlayback
        webConfig.allowsAirPlayForMediaPlayback = config.allowsAirPlayForMediaPlayback
        webConfig.allowsPictureInPictureMediaPlayback = config.allowsPictureInPictureMediaPlayback
        
        // 用户脚本配置
        setupUserScripts(webConfig)
        
        // 创建 WebView
        webView = WKWebView(frame: .zero, configuration: webConfig)
        webView?.navigationDelegate = self
        webView?.uiDelegate = self
        
        // 滚动配置
        configureScrollView()
        
        // 添加观察者
        addObservers()
    }
    
    private func setupUserScripts(_ config: WKWebViewConfiguration) {
        // 注入原生桥接脚本
        let bridgeScript = WKUserScript(
            source: createBridgeScript(),
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        
        // 注入性能优化脚本
        let performanceScript = WKUserScript(
            source: createPerformanceScript(),
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        
        // 注入样式优化脚本
        let styleScript = WKUserScript(
            source: createStyleScript(),
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        
        config.userContentController.addUserScript(bridgeScript)
        config.userContentController.addUserScript(performanceScript)
        config.userContentController.addUserScript(styleScript)
        
        // 添加消息处理器
        config.userContentController.add(self, name: "nativeBridge")
        config.userContentController.add(self, name: "nativeUI")
        config.userContentController.add(self, name: "nativeData")
    }
    
    private func createBridgeScript() -> String {
        return """
        (function() {
            // 原生桥接对象
            window.NativeBridge = {
                // 版本信息
                version: '1.0.0',
                platform: 'ios',
                
                // 设备信息
                getDeviceInfo: function() {
                    return new Promise(function(resolve) {
                        window.webkit.messageHandlers.nativeBridge.postMessage({
                            method: 'getDeviceInfo',
                            callback: 'deviceInfoCallback'
                        });
                        window.deviceInfoCallback = resolve;
                    });
                },
                
                // 网络状态
                getNetworkStatus: function() {
                    return new Promise(function(resolve) {
                        window.webkit.messageHandlers.nativeBridge.postMessage({
                            method: 'getNetworkStatus',
                            callback: 'networkStatusCallback'
                        });
                        window.networkStatusCallback = resolve;
                    });
                },
                
                // 显示 Toast
                showToast: function(message, duration) {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'showToast',
                        params: { message: message, duration: duration || 2000 }
                    });
                },
                
                // 显示加载指示器
                showLoading: function(message) {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'showLoading',
                        params: { message: message || '加载中...' }
                    });
                },
                
                // 隐藏加载指示器
                hideLoading: function() {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'hideLoading'
                    });
                },
                
                // 导航控制
                goBack: function() {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'goBack'
                    });
                },
                
                goForward: function() {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'goForward'
                    });
                },
                
                // 数据存储
                setStorage: function(key, value) {
                    window.webkit.messageHandlers.nativeData.postMessage({
                        method: 'setStorage',
                        params: { key: key, value: value }
                    });
                },
                
                getStorage: function(key) {
                    return new Promise(function(resolve) {
                        window.webkit.messageHandlers.nativeData.postMessage({
                            method: 'getStorage',
                            params: { key: key },
                            callback: 'storageCallback'
                        });
                        window.storageCallback = resolve;
                    });
                },
                
                // 页面跳转
                navigate: function(url) {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'navigate',
                        params: { url: url }
                    });
                },
                
                // 关闭页面
                close: function() {
                    window.webkit.messageHandlers.nativeUI.postMessage({
                        method: 'close'
                    });
                }
            };
            
            // 页面加载完成事件
            document.addEventListener('DOMContentLoaded', function() {
                if (window.NativeBridge && window.NativeBridge.onReady) {
                    window.NativeBridge.onReady();
                }
            });
        })();
        """
    }
    
    private func createPerformanceScript() -> String {
        return """
        (function() {
            // 性能监控
            if (window.performance && window.performance.timing) {
                var timing = window.performance.timing;
                var loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log('页面加载时间:', loadTime + 'ms');
            }
            
            // 内存监控
            if (window.performance && window.performance.memory) {
                var memory = window.performance.memory;
                console.log('内存使用:', {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                });
            }
            
            // 错误监控
            window.addEventListener('error', function(e) {
                console.error('JavaScript错误:', e.error);
            });
            
            // 未处理的 Promise 拒绝
            window.addEventListener('unhandledrejection', function(e) {
                console.error('未处理的Promise拒绝:', e.reason);
            });
        })();
        """
    }
    
    private func createStyleScript() -> String {
        return """
        (function() {
            // 优化移动端样式
            var style = document.createElement('style');
            style.textContent = `
                /* 防止iOS橡皮筋效果 */
                body {
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                /* 优化滚动性能 */
                * {
                    -webkit-transform: translateZ(0);
                    transform: translateZ(0);
                }
                
                /* 防止双击缩放 */
                * {
                    touch-action: manipulation;
                }
                
                /* 优化字体渲染 */
                body {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                /* 隐藏滚动条但保持滚动功能 */
                ::-webkit-scrollbar {
                    display: none;
                }
                
                /* 优化长列表性能 */
                .list-item {
                    contain: layout style paint;
                }
            `;
            document.head.appendChild(style);
        })();
        """
    }
    
    private func configureScrollView() {
        guard let webView = webView else { return }
        
        webView.scrollView.isScrollEnabled = config.isScrollEnabled
        webView.scrollView.bounces = config.isBouncesEnabled
        webView.scrollView.showsHorizontalScrollIndicator = config.showsHorizontalScrollIndicator
        webView.scrollView.showsVerticalScrollIndicator = config.showsVerticalScrollIndicator
        webView.scrollView.contentInsetAdjustmentBehavior = config.contentInsetAdjustmentBehavior
    }
    
    private func addObservers() {
        guard let webView = webView else { return }
        
        // 进度观察
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.isLoading), options: .new, context: nil)
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.canGoBack), options: .new, context: nil)
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.canGoForward), options: .new, context: nil)
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.title), options: .new, context: nil)
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.url), options: .new, context: nil)
    }
    
    // MARK: - Public Methods
    
    func loadURL(_ urlString: String) {
        guard let url = URL(string: urlString) else { return }
        let request = URLRequest(url: url)
        webView?.load(request)
    }
    
    func loadFileURL(_ url: URL) {
        webView?.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }
    
    func reload() {
        webView?.reload()
    }
    
    func goBack() {
        webView?.goBack()
    }
    
    func goForward() {
        webView?.goForward()
    }
    
    func createWebView() -> WKWebView {
        return webView ?? WKWebView()
    }
    
    // MARK: - KVO
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        DispatchQueue.main.async {
            if keyPath == #keyPath(WKWebView.estimatedProgress) {
                self.progress = (object as? WKWebView)?.estimatedProgress ?? 0.0
            } else if keyPath == #keyPath(WKWebView.isLoading) {
                self.isLoading = (object as? WKWebView)?.isLoading ?? false
            } else if keyPath == #keyPath(WKWebView.canGoBack) {
                self.canGoBack = (object as? WKWebView)?.canGoBack ?? false
            } else if keyPath == #keyPath(WKWebView.canGoForward) {
                self.canGoForward = (object as? WKWebView)?.canGoForward ?? false
            } else if keyPath == #keyPath(WKWebView.title) {
                self.title = (object as? WKWebView)?.title ?? ""
            } else if keyPath == #keyPath(WKWebView.url) {
                self.url = (object as? WKWebView)?.url
            }
        }
    }
    
    deinit {
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.isLoading))
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.canGoBack))
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.canGoForward))
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.title))
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.url))
    }
}

// MARK: - WKNavigationDelegate
extension AdvancedWebViewManager: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.isLoading = true
            self.error = nil
        }
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.isLoading = false
        }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.async {
            self.isLoading = false
            self.error = error
        }
        print("WebView navigation failed: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.async {
            self.isLoading = false
            self.error = error
        }
        print("WebView provisional navigation failed: \(error.localizedDescription)")
    }
}

// MARK: - WKUIDelegate
extension AdvancedWebViewManager: WKUIDelegate {
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: "提示", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler()
        })
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(alert, animated: true)
        }
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: "确认", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(true)
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in
            completionHandler(false)
        })
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(alert, animated: true)
        }
    }
}

// MARK: - WKScriptMessageHandler
extension AdvancedWebViewManager: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let method = body["method"] as? String else { return }
        
        switch message.name {
        case "nativeBridge":
            handleBridgeMessage(body)
        case "nativeUI":
            handleUIMessage(body)
        case "nativeData":
            handleDataMessage(body)
        default:
            print("Unknown message handler: \(message.name)")
        }
    }
    
    private func handleBridgeMessage(_ body: [String: Any]) {
        guard let method = body["method"] as? String else { return }
        
        switch method {
        case "getDeviceInfo":
            handleGetDeviceInfo()
        case "getNetworkStatus":
            handleGetNetworkStatus()
        default:
            print("Unknown bridge method: \(method)")
        }
    }
    
    private func handleUIMessage(_ body: [String: Any]) {
        guard let method = body["method"] as? String else { return }
        
        switch method {
        case "showToast":
            handleShowToast(body)
        case "showLoading":
            handleShowLoading(body)
        case "hideLoading":
            handleHideLoading()
        case "goBack":
            goBack()
        case "goForward":
            goForward()
        case "navigate":
            handleNavigate(body)
        case "close":
            handleClose()
        default:
            print("Unknown UI method: \(method)")
        }
    }
    
    private func handleDataMessage(_ body: [String: Any]) {
        guard let method = body["method"] as? String else { return }
        
        switch method {
        case "setStorage":
            handleSetStorage(body)
        case "getStorage":
            handleGetStorage(body)
        default:
            print("Unknown data method: \(method)")
        }
    }
    
    // MARK: - Bridge Handlers
    
    private func handleGetDeviceInfo() {
        let deviceInfo = [
            "platform": "ios",
            "version": UIDevice.current.systemVersion,
            "model": UIDevice.current.model,
            "brand": "Apple",
            "screenWidth": Int(UIScreen.main.bounds.width),
            "screenHeight": Int(UIScreen.main.bounds.height),
            "density": UIScreen.main.scale,
            "userAgent": webView?.value(forKey: "userAgent") as? String ?? ""
        ] as [String : Any]
        
        let jsCode = """
            if (window.deviceInfoCallback) {
                window.deviceInfoCallback(\(jsonString(from: deviceInfo)));
            }
        """
        
        webView?.evaluateJavaScript(jsCode, completionHandler: nil)
    }
    
    private func handleGetNetworkStatus() {
        let networkInfo = [
            "isConnected": NetworkMonitor.shared.isConnected,
            "type": NetworkMonitor.shared.connectionType,
            "strength": 100
        ] as [String : Any]
        
        let jsCode = """
            if (window.networkStatusCallback) {
                window.networkStatusCallback(\(jsonString(from: networkInfo)));
            }
        """
        
        webView?.evaluateJavaScript(jsCode, completionHandler: nil)
    }
    
    // MARK: - UI Handlers
    
    private func handleShowToast(_ body: [String: Any]) {
        guard let params = body["params"] as? [String: Any],
              let message = params["message"] as? String else { return }
        
        DispatchQueue.main.async {
            // 这里可以显示 Toast 消息
            print("Toast: \(message)")
        }
    }
    
    private func handleShowLoading(_ body: [String: Any]) {
        guard let params = body["params"] as? [String: Any],
              let message = params["message"] as? String else { return }
        
        DispatchQueue.main.async {
            // 这里可以显示加载指示器
            print("Loading: \(message)")
        }
    }
    
    private func handleHideLoading() {
        DispatchQueue.main.async {
            // 这里可以隐藏加载指示器
            print("Hide Loading")
        }
    }
    
    private func handleNavigate(_ body: [String: Any]) {
        guard let params = body["params"] as? [String: Any],
              let urlString = params["url"] as? String else { return }
        
        loadURL(urlString)
    }
    
    private func handleClose() {
        DispatchQueue.main.async {
            // 这里可以关闭页面或返回上一页
            print("Close page")
        }
    }
    
    // MARK: - Data Handlers
    
    private func handleSetStorage(_ body: [String: Any]) {
        guard let params = body["params"] as? [String: Any],
              let key = params["key"] as? String,
              let value = params["value"] as? String else { return }
        
        UserDefaults.standard.set(value, forKey: "web_storage_\(key)")
    }
    
    private func handleGetStorage(_ body: [String: Any]) {
        guard let params = body["params"] as? [String: Any],
              let key = params["key"] as? String else { return }
        
        let value = UserDefaults.standard.string(forKey: "web_storage_\(key)") ?? ""
        
        let jsCode = """
            if (window.storageCallback) {
                window.storageCallback('\(value)');
            }
        """
        
        webView?.evaluateJavaScript(jsCode, completionHandler: nil)
    }
    
    // MARK: - Helper Methods
    
    private func jsonString(from object: Any) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: object),
              let string = String(data: data, encoding: .utf8) else {
            return "{}"
        }
        return string
    }
}
