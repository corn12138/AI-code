import Combine
import Foundation
import WebKit
import PhotosUI
import UniformTypeIdentifiers

class WebViewManager: NSObject, ObservableObject {
    @Published var isLoading = false
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var title = ""

    lazy var webView: WKWebView = {
        let configuration = WKWebViewConfiguration()

        // 配置用户脚本控制器
        let userContentController = WKUserContentController()
        // 统一使用名称 "NativeBridge" 与前端约定保持一致
        userContentController.add(self, name: "NativeBridge")
        configuration.userContentController = userContentController

        // 创建 WebView
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self

        // 自定义 UA，便于前端识别原生环境（同时前端已支持通过对象检测兜底）
        if #available(iOS 9.0, *) {
            let baseUA = webView.value(forKey: "userAgent") as? String ?? ""
            webView.customUserAgent = baseUA + " workbenchapp ios"
        }

        // 启用调试（仅开发环境）
        #if DEBUG
            if #available(iOS 16.4, *) {
                webView.isInspectable = true
            }
        #endif

        return webView
    }()

    // 默认本地开发使用 8000 端口（Umi 默认端口），可通过 Xcode Scheme 环境变量 H5_URL 覆盖
    private let h5URL = ProcessInfo.processInfo.environment["H5_URL"] ?? "http://localhost:8000"

    // 媒体/文件选择回调临时保存
    private var pendingImagePickCallbackId: String?
    private var pendingDocumentPickCallbackId: String?

    override init() {
        super.init()
        setupWebView()
        NetworkMonitor.shared.startMonitoring()
    }

    private func setupWebView() {
        // 配置 WebView 设置
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true

        // 注入辅助脚本（仅提供 NativeDevice，避免覆盖 messageHandlers）
        injectHelperScripts()
    }

    private func injectHelperScripts() {
        let script = """
            // 提供设备只读信息（可选）
            window.NativeDevice = Object.freeze({
                platform: 'ios',
                version: '\(UIDevice.current.systemVersion)',
                model: '\(UIDevice.current.model)',
                isNative: true
            });
            """

        let userScript = WKUserScript(
            source: script,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )

        webView.configuration.userContentController.addUserScript(userScript)
    }

    func loadWorkbench() {
        // 1) 优先根据环境变量开关离线包
        let useOffline = ProcessInfo.processInfo.environment["H5_OFFLINE"] == "1"

        if useOffline, let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
            return
        }

        // 2) 尝试远端 H5 地址
        if let url = URL(string: h5URL) {
            webView.load(URLRequest(url: url))
            return
        }

        // 3) 兜底：如存在内置 www 包则加载
        if let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
        }
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
            // H5 期望 data 为 JSON 字符串
            let objStr = jsonString(info)
            let quoted = "\"" + objStr.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"") + "\""
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: quoted)

        case "getNetworkStatus":
            let isConnected = NetworkMonitor.shared.isConnected
            let type = NetworkMonitor.shared.connectionType
            let strength = 100 // 可扩展真实信号强度
            let data: [String: Any] = [
                "isConnected": isConnected,
                "type": type,
                "strength": strength,
                "quality": strength >= 80 ? "excellent" : (strength >= 50 ? "good" : (strength > 0 ? "poor" : "none"))
            ]
            // H5 期望 data 为 JSON 字符串
            let objStr = jsonString(data)
            let quoted = "\"" + objStr.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"") + "\""
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: quoted)

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
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "getStorage":
            let key = (args.first as? String) ?? ""
            let value = UserDefaults.standard.string(forKey: key)
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: jsonString(value))

        case "setStorage":
            let key = (args.first as? String) ?? ""
            let value = (args.dropFirst().first as? String) ?? ""
            UserDefaults.standard.setValue(value, forKey: key)
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "copyToClipboard":
            let text = (args.first as? String) ?? ""
            UIPasteboard.general.string = text
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "getClipboardText":
            let text = UIPasteboard.general.string
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: jsonString(text))

        case "share":
            if let dict = args.first as? [String: Any] {
                var items: [Any] = []
                if let text = dict["text"] as? String { items.append(text) }
                if let urlStr = dict["url"] as? String, let url = URL(string: urlStr) { items.append(url) }
                let vc = UIActivityViewController(activityItems: items, applicationActivities: nil)
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let window = windowScene.windows.first {
                    window.rootViewController?.present(vc, animated: true)
                }
                sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")
            } else {
                sendNativeBridgeCallback(callbackId: callbackId, success: false, error: "bad_args")
            }

        case "openCamera":
            presentCamera(callbackId: callbackId)
            return

        case "pickImage":
            let max = (args.first as? Int) ?? 1
            presentPhotoPicker(maxCount: max, callbackId: callbackId)
            return

        case "openFilePicker":
            // args[0] 形如 { accept: '*/*' | 'image/*' | 'application/pdf', multiple: Bool }
            let cfg = (args.first as? [String: Any]) ?? [:]
            let accept = (cfg["accept"] as? String)?.lowercased() ?? "*/*"
            let multiple = (cfg["multiple"] as? Bool) ?? false
            if accept.contains("image") {
                presentPhotoPicker(maxCount: multiple ? 0 : 1, callbackId: callbackId)
            } else {
                presentDocumentPicker(accept: accept, multiple: multiple, callbackId: callbackId)
            }
            // 回调在选择完成后触发
            return

        case "vibrate":
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "setNavBar":
            // SwiftUI 场景下可通过环境对象传递标题；此处简单返回成功
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "closeWebView":
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                window.rootViewController?.dismiss(animated: true)
            }
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "openDeepLink":
            if let urlStr = args.first as? String, let url = URL(string: urlStr) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")
            } else {
                sendNativeBridgeCallback(callbackId: callbackId, success: false, error: "bad_url")
            }

        default:
            sendNativeBridgeCallback(callbackId: callbackId, success: false, error: "unknown_method")
        }
    }

    private func jsonString(_ obj: Any?) -> String {
        guard let obj else { return "null" }
        if JSONSerialization.isValidJSONObject(obj) {
            if let data = try? JSONSerialization.data(withJSONObject: obj, options: []),
               let str = String(data: data, encoding: .utf8) { return str }
            return "null"
        }
        if let s = obj as? String { return "\"\(s.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\""))\"" }
        if let b = obj as? Bool { return b ? "true" : "false" }
        if let n = obj as? NSNumber { return n.stringValue }
        return "null"
    }

    private func sendNativeBridgeCallback(callbackId: String, success: Bool, dataJSONString: String? = nil, error: String? = nil) {
        var json = "{\\\"callbackId\\\":\\\"\(callbackId)\\\",\\\"success\\\":\(success ? "true" : "false")"
        if let e = error { json += ",\\\"error\\\":\\\"\(e)\\\"" }
        if let ds = dataJSONString { json += ",\\\"data\\\":\(ds)" } else { json += ",\\\"data\\\":null" }
        json += "}"
        let js = "window.NativeBridge && window.NativeBridge.callback(\"\(json)\")"
        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    // MARK: - 媒体/文件选择实现

    private func presentPhotoPicker(maxCount: Int = 1, callbackId: String) {
        pendingImagePickCallbackId = callbackId
        if #available(iOS 14, *) {
            var config = PHPickerConfiguration()
            config.selectionLimit = maxCount // 0 表示不限制
            config.filter = .images
            let picker = PHPickerViewController(configuration: config)
            picker.delegate = self
            presentOnTop(picker)
        } else {
            // 旧系统使用 UIImagePickerController 相册
            let picker = UIImagePickerController()
            picker.sourceType = .photoLibrary
            picker.delegate = self
            presentOnTop(picker)
        }
    }

    private func presentCamera(callbackId: String) {
        pendingImagePickCallbackId = callbackId
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            sendNativeBridgeCallback(callbackId: callbackId, success: false, error: "camera_unavailable")
            return
        }
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = self
        presentOnTop(picker)
    }

    private func presentDocumentPicker(accept: String, multiple: Bool, callbackId: String) {
        pendingDocumentPickCallbackId = callbackId
        let utTypes: [UTType]
        if accept == "*/*" { utTypes = [UTType.data] }
        else if accept.contains("pdf") { utTypes = [UTType.pdf] }
        else if accept.contains("image") { utTypes = [UTType.image] }
        else if accept.contains("plain") { utTypes = [UTType.plainText] }
        else { utTypes = [UTType.data] }
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: utTypes, asCopy: true)
        picker.allowsMultipleSelection = multiple
        picker.delegate = self
        presentOnTop(picker)
    }

    private func presentOnTop(_ vc: UIViewController) {
        DispatchQueue.main.async {
            if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = scene.windows.first,
               let top = window.rootViewController {
                top.present(vc, animated: true)
            }
        }
    }

    private func emitEvent(name: String, dataJSONString: String) {
        let js = "if (window.NativeBridge && window.NativeBridge.emitEvent) { window.NativeBridge.emitEvent('" + name + "', " + dataJSONString + "); }"
        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}

// MARK: - 媒体/文件选择 Delegate
@available(iOS 14, *)
extension WebViewManager: PHPickerViewControllerDelegate {
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        let callbackId = pendingImagePickCallbackId ?? ""
        pendingImagePickCallbackId = nil
        guard !results.isEmpty else {
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "[]")
            return
        }
        var images: [String] = []
        let group = DispatchGroup()
        for r in results {
            if r.itemProvider.canLoadObject(ofClass: UIImage.self) {
                group.enter()
                r.itemProvider.loadObject(ofClass: UIImage.self) { (obj, err) in
                    defer { group.leave() }
                    if let img = obj as? UIImage, let data = img.jpegData(compressionQuality: 0.85) {
                        let b64 = data.base64EncodedString()
                        images.append("data:image/jpeg;base64,\(b64)")
                    }
                }
            }
        }
        group.notify(queue: .main) {
            let json = (try? JSONSerialization.data(withJSONObject: ["items": images], options: [])) ?? Data("{}".utf8)
            let jsonStr = String(data: json, encoding: .utf8) ?? "{}"
            self.emitEvent(name: "imagePicked", dataJSONString: jsonStr)
            // 回调结果
            if let arrData = try? JSONSerialization.data(withJSONObject: images, options: []),
               let arrStr = String(data: arrData, encoding: .utf8) {
                self.sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: arrStr)
            } else {
                self.sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "[]")
            }
        }
    }
}

extension WebViewManager: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        let callbackId = pendingImagePickCallbackId ?? ""
        pendingImagePickCallbackId = nil
        picker.dismiss(animated: true) {
            self.sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "[]")
        }
    }

    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        let callbackId = pendingImagePickCallbackId ?? ""
        pendingImagePickCallbackId = nil
        picker.dismiss(animated: true)
        if let img = info[.originalImage] as? UIImage, let data = img.jpegData(compressionQuality: 0.85) {
            let b64 = data.base64EncodedString()
            let item = "data:image/jpeg;base64,\(b64)"
            let payload = ["items": [item]]
            let json = (try? JSONSerialization.data(withJSONObject: payload, options: [])) ?? Data("{}".utf8)
            let jsonStr = String(data: json, encoding: .utf8) ?? "{}"
            self.emitEvent(name: "imagePicked", dataJSONString: jsonStr)
            // openCamera 期望返回单个字符串
            let itemJSONString = "\"\(item.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\""))\""
            self.sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: itemJSONString)
        } else {
            self.sendNativeBridgeCallback(callbackId: callbackId, success: false, error: "image_error")
        }
    }
}

extension WebViewManager: UIDocumentPickerDelegate {
    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        let callbackId = pendingDocumentPickCallbackId ?? ""
        pendingDocumentPickCallbackId = nil
        sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "[]")
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        let callbackId = pendingDocumentPickCallbackId ?? ""
        pendingDocumentPickCallbackId = nil
        // 返回本地文件路径（安全考虑建议后续用安全沙盒拷贝到 app 目录）
        let paths = urls.map { $0.path }
        // emitEvent
        if let payloadData = try? JSONSerialization.data(withJSONObject: ["items": paths], options: []),
           let payloadStr = String(data: payloadData, encoding: .utf8) {
            emitEvent(name: "filesPicked", dataJSONString: payloadStr)
        }
        if let arrData = try? JSONSerialization.data(withJSONObject: paths, options: []),
           let arrStr = String(data: arrData, encoding: .utf8) {
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: arrStr)
        } else {
            sendNativeBridgeCallback(callbackId: callbackId, success: true, dataJSONString: "[]")
        }
    }
}
