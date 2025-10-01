import Combine
import Foundation
import WebKit
import UIKit

class WebViewManager: NSObject, ObservableObject {
    @Published var isLoading = false
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var title = ""
    
    var webView: WKWebView?
    private let apiService = APIService()

    override init() {
        super.init()
        NetworkMonitor.shared.startMonitoring()
    }
    
    func createWebView() -> WKWebView {
        let configuration = WKWebViewConfiguration()
        
        // 配置用户脚本控制器
        let userContentController = WKUserContentController()
        userContentController.add(self, name: "NativeBridge")
        configuration.userContentController = userContentController
        
        // 创建WebView
        let webView = WKWebView(frame: .zero, configuration: configuration)
        
        // 启用调试（仅开发环境）
        #if DEBUG
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        #endif
        
        // 配置WebView设置
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        
        self.webView = webView
        return webView
    }
    
    func loadURL(_ urlString: String) {
        guard let url = URL(string: urlString) else { return }
        webView?.load(URLRequest(url: url))
    }
    
    func loadFileURL(_ fileURL: URL) {
        webView?.loadFileURL(fileURL, allowingReadAccessTo: fileURL.deletingLastPathComponent())
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
            self.canGoBack = webView.canGoBack
            self.canGoForward = webView.canGoForward
            self.title = webView.title ?? ""
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
    func webView(
        _ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void
    ) {
        // 处理 JavaScript alert
        DispatchQueue.main.async {
            let alert = UIAlertController(title: "提示", message: message, preferredStyle: .alert)
            alert.addAction(
                UIAlertAction(title: "确定", style: .default) { _ in
                    completionHandler()
                })

            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                let window = windowScene.windows.first
            {
                window.rootViewController?.present(alert, animated: true)
            }
        }
    }

    func webView(
        _ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void
    ) {
        // 处理 JavaScript confirm
        DispatchQueue.main.async {
            let alert = UIAlertController(title: "确认", message: message, preferredStyle: .alert)
            alert.addAction(
                UIAlertAction(title: "取消", style: .cancel) { _ in
                    completionHandler(false)
                })
            alert.addAction(
                UIAlertAction(title: "确定", style: .default) { _ in
                    completionHandler(true)
                })

            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                let window = windowScene.windows.first
            {
                window.rootViewController?.present(alert, animated: true)
            }
        }
    }
}

// MARK: - WKScriptMessageHandler
extension WebViewManager: WKScriptMessageHandler {
    func userContentController(
        _ userContentController: WKUserContentController, didReceive message: WKScriptMessage
    ) {
        guard message.name == "NativeBridge" else { return }

        // 期望 body 形如：{ method: string, callbackId: string, args: any[] }
        guard let body = message.body as? [String: Any],
              let method = body["method"] as? String,
              let callbackId = body["callbackId"] as? String
        else { return }

        let args = body["args"] as? [Any] ?? []
        handleNativeMethod(method: method, args: args, callbackId: callbackId)
    }

    private func handleNativeMethod(method: String, args: [Any], callbackId: String) {
        switch method {
        case "getDeviceInfo":
            let info: [String: Any] = [
                "platform": "ios",
                "version": UIDevice.current.systemVersion,
                "model": UIDevice.current.model,
                "brand": "Apple",
                "screenWidth": Int(UIScreen.main.bounds.width),
                "screenHeight": Int(UIScreen.main.bounds.height),
                "density": UIScreen.main.scale,
            ]
            sendNativeBridgeCallback(callbackId: callbackId, success: true, data: info)

        case "getNetworkStatus":
            let isConnected = NetworkMonitor.shared.isConnected
            let type = NetworkMonitor.shared.connectionType
            let data: [String: Any] = [
                "isConnected": isConnected,
                "type": type,
                "strength": 100
            ]
            sendNativeBridgeCallback(callbackId: callbackId, success: true, data: data)

        case "showToast":
            let message = (args.first as? String) ?? ""
            DispatchQueue.main.async {
                let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let window = windowScene.windows.first {
                    window.rootViewController?.present(alert, animated: true)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { alert.dismiss(animated: true) }
                }
            }
            sendNativeBridgeCallback(callbackId: callbackId, success: true, data: "ok")

        case "getStorage":
            let key = (args.first as? String) ?? ""
            let value = UserDefaults.standard.string(forKey: key)
            sendNativeBridgeCallback(callbackId: callbackId, success: true, data: value)

        case "setStorage":
            let key = (args.first as? String) ?? ""
            let value = (args.dropFirst().first as? String) ?? ""
            UserDefaults.standard.setValue(value, forKey: key)
            sendNativeBridgeCallback(callbackId: callbackId, success: true, data: "ok")
            
        case "fetchArticles":
            let category = args.first as? String
            let page = (args.dropFirst().first as? Int) ?? 1
            let pageSize = (args.dropFirst(2).first as? Int) ?? 10
            
            Task {
                do {
                    let result = try await apiService.fetchArticles(category: category, page: page, pageSize: pageSize)
                    await MainActor.run {
                        self.sendNativeBridgeCallback(callbackId: callbackId, success: true, data: result)
                    }
                } catch {
                    await MainActor.run {
                        self.sendNativeBridgeCallback(callbackId: callbackId, success: false, error: error.localizedDescription)
                    }
                }
            }
            return
            
        case "fetchArticleById":
            let articleId = (args.first as? String) ?? ""
            
            Task {
                do {
                    let result = try await apiService.fetchArticleById(articleId: articleId)
                    await MainActor.run {
                        self.sendNativeBridgeCallback(callbackId: callbackId, success: true, data: result)
                    }
                } catch {
                    await MainActor.run {
                        self.sendNativeBridgeCallback(callbackId: callbackId, success: false, error: error.localizedDescription)
                    }
                }
            }
            return

        default:
            sendNativeBridgeCallback(callbackId: callbackId, success: false, error: "unknown_method")
        }
    }


    private func sendNativeBridgeCallback(callbackId: String, success: Bool, data: Any? = nil, error: String? = nil) {
        var response: [String: Any] = [
            "callbackId": callbackId,
            "success": success
        ]
        
        if let error = error {
            response["error"] = error
        }
        
        if let data = data {
            response["data"] = data
        } else {
            response["data"] = NSNull()
        }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: response),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }
        
        let js = "window.NativeBridge && window.NativeBridge.callback('\(jsonString)')"
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

}
