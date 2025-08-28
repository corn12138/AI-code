import Combine
import Foundation
import WebKit

class WebViewManager: NSObject, ObservableObject {
    @Published var isLoading = false
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var title = ""

    lazy var webView: WKWebView = {
        let configuration = WKWebViewConfiguration()

        // 配置用户脚本控制器
        let userContentController = WKUserContentController()
        userContentController.add(self, name: "nativeHandler")
        configuration.userContentController = userContentController

        // 创建 WebView
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self

        // 启用调试（仅开发环境）
        #if DEBUG
            if #available(iOS 16.4, *) {
                webView.isInspectable = true
            }
        #endif

        return webView
    }()

    private let h5URL = ProcessInfo.processInfo.environment["H5_URL"] ?? "http://localhost:8002"

    override init() {
        super.init()
        setupWebView()
    }

    private func setupWebView() {
        // 配置 WebView 设置
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true

        // 注入原生桥接脚本
        injectNativeBridge()
    }

    private func injectNativeBridge() {
        let bridgeScript = """
            window.webkit = window.webkit || {};
            window.webkit.messageHandlers = window.webkit.messageHandlers || {};
            window.webkit.messageHandlers.nativeHandler = {
                postMessage: function(message) {
                    window.webkit.messageHandlers.nativeHandler.postMessage(message);
                }
            };

            // 注入设备信息
            window.NativeDevice = {
                platform: 'ios',
                version: '\(UIDevice.current.systemVersion)',
                model: '\(UIDevice.current.model)',
                isNative: true
            };
            """

        let userScript = WKUserScript(
            source: bridgeScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )

        webView.configuration.userContentController.addUserScript(userScript)
    }

    func loadWorkbench() {
        guard let url = URL(string: h5URL) else { return }
        let request = URLRequest(url: url)
        webView.load(request)
    }

    func reload() {
        webView.reload()
    }

    func goBack() {
        webView.goBack()
    }

    func goForward() {
        webView.goForward()
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
        guard message.name == "nativeHandler",
            let messageBody = message.body as? [String: Any],
            let method = messageBody["method"] as? String
        else {
            return
        }

        let params = messageBody["params"] as? [String: Any]
        let callbackId = messageBody["callbackId"] as? String

        // 处理原生方法调用
        handleNativeMethod(method: method, params: params, callbackId: callbackId)
    }

    private func handleNativeMethod(method: String, params: [String: Any]?, callbackId: String?) {
        switch method {
        case "getDeviceInfo":
            handleGetDeviceInfo(callbackId: callbackId)
        case "showToast":
            handleShowToast(params: params)
        case "openCamera":
            handleOpenCamera(params: params, callbackId: callbackId)
        case "openGallery":
            handleOpenGallery(params: params, callbackId: callbackId)
        default:
            print("Unknown native method: \(method)")
        }
    }

    private func handleGetDeviceInfo(callbackId: String?) {
        let deviceInfo: [String: Any] = [
            "platform": "ios",
            "version": UIDevice.current.systemVersion,
            "model": UIDevice.current.model,
            "brand": "Apple",
            "uuid": UIDevice.current.identifierForVendor?.uuidString ?? "",
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
                ?? "1.0.0",
            "buildNumber": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1",
        ]

        sendCallbackResult(callbackId: callbackId, success: true, data: deviceInfo)
    }

    private func handleShowToast(params: [String: Any]?) {
        guard let message = params?["message"] as? String else { return }

        DispatchQueue.main.async {
            // 简单的 Toast 实现
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)

            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                let window = windowScene.windows.first
            {
                window.rootViewController?.present(alert, animated: true)

                // 自动消失
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    alert.dismiss(animated: true)
                }
            }
        }
    }

    private func handleOpenCamera(params: [String: Any]?, callbackId: String?) {
        // TODO: 实现相机功能
        sendCallbackResult(
            callbackId: callbackId, success: false, error: "Camera not implemented yet")
    }

    private func handleOpenGallery(params: [String: Any]?, callbackId: String?) {
        // TODO: 实现相册功能
        sendCallbackResult(
            callbackId: callbackId, success: false, error: "Gallery not implemented yet")
    }

    private func sendCallbackResult(
        callbackId: String?, success: Bool, data: Any? = nil, error: String? = nil
    ) {
        guard let callbackId = callbackId else { return }

        let result: [String: Any] = [
            "success": success,
            "data": data ?? NSNull(),
            "error": error ?? NSNull(),
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: result)
            let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"

            let script = "if (window.\(callbackId)) { window.\(callbackId)(\(jsonString)); }"

            DispatchQueue.main.async {
                self.webView.evaluateJavaScript(script) { _, error in
                    if let error = error {
                        print("Failed to execute callback: \(error)")
                    }
                }
            }
        } catch {
            print("Failed to serialize callback result: \(error)")
        }
    }
}
