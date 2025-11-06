import SwiftUI
import WebKit
import Combine

// MARK: - WebView Manager
class WebViewManager: NSObject, ObservableObject {
    @Published var isLoading = false
    @Published var progress: Double = 0.0
    
    private var webView: WKWebView?
    
    override init() {
        super.init()
        setupWebView()
    }
    
    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        
        // 配置用户脚本
        let userScript = WKUserScript(
            source: """
                window.NativeBridge = {
                    getDeviceInfo: function() {
                        return window.webkit.messageHandlers.nativeBridge.postMessage({
                            method: 'getDeviceInfo'
                        });
                    },
                    getNetworkStatus: function() {
                        return window.webkit.messageHandlers.nativeBridge.postMessage({
                            method: 'getNetworkStatus'
                        });
                    },
                    showToast: function(message, duration) {
                        return window.webkit.messageHandlers.nativeBridge.postMessage({
                            method: 'showToast',
                            params: { message: message, duration: duration }
                        });
                    }
                };
            """,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        
        configuration.userContentController.addUserScript(userScript)
        configuration.userContentController.add(self, name: "nativeBridge")
        
        // 创建 WebView
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView?.navigationDelegate = self
        webView?.uiDelegate = self
        
        // 添加进度观察
        webView?.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)
        webView?.addObserver(self, forKeyPath: #keyPath(WKWebView.isLoading), options: .new, context: nil)
    }
    
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
    
    func createWebView() -> WKWebView {
        return webView ?? WKWebView()
    }
    
    // MARK: - KVO
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        if keyPath == #keyPath(WKWebView.estimatedProgress) {
            DispatchQueue.main.async {
                self.progress = (object as? WKWebView)?.estimatedProgress ?? 0.0
            }
        } else if keyPath == #keyPath(WKWebView.isLoading) {
            DispatchQueue.main.async {
                self.isLoading = (object as? WKWebView)?.isLoading ?? false
            }
        }
    }
    
    deinit {
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
        webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.isLoading))
    }
}

// MARK: - WKNavigationDelegate
extension WebViewManager: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.isLoading = true
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
        }
        print("WebView navigation failed: \(error.localizedDescription)")
    }
}

// MARK: - WKUIDelegate
extension WebViewManager: WKUIDelegate {
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
extension WebViewManager: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let method = body["method"] as? String else { return }
        
        switch method {
        case "getDeviceInfo":
            handleGetDeviceInfo()
        case "getNetworkStatus":
            handleGetNetworkStatus()
        case "showToast":
            handleShowToast(body)
        default:
            print("Unknown method: \(method)")
        }
    }
    
    private func handleGetDeviceInfo() {
        let deviceInfo = [
            "platform": "ios",
            "version": UIDevice.current.systemVersion,
            "model": UIDevice.current.model,
            "brand": "Apple",
            "screenWidth": Int(UIScreen.main.bounds.width),
            "screenHeight": Int(UIScreen.main.bounds.height),
            "density": UIScreen.main.scale
        ] as [String : Any]
        
        let jsCode = """
            if (window.NativeBridge && window.NativeBridge.onDeviceInfo) {
                window.NativeBridge.onDeviceInfo(\(jsonString(from: deviceInfo)));
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
            if (window.NativeBridge && window.NativeBridge.onNetworkStatus) {
                window.NativeBridge.onNetworkStatus(\(jsonString(from: networkInfo)));
            }
        """
        
        webView?.evaluateJavaScript(jsCode, completionHandler: nil)
    }
    
    private func handleShowToast(_ body: [String: Any]) {
        guard let params = body["params"] as? [String: Any],
              let message = params["message"] as? String else { return }
        
        DispatchQueue.main.async {
            // 这里可以显示 Toast 消息
            print("Toast: \(message)")
        }
    }
    
    private func jsonString(from object: Any) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: object),
              let string = String(data: data, encoding: .utf8) else {
            return "{}"
        }
        return string
    }
}