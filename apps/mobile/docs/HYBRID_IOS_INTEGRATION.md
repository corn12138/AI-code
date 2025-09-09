# iOS 混合开发集成指引（WKWebView + JSBridge）

本指引帮助你将 `apps/mobile` 的 H5 前端嵌入 iOS 原生应用（WKWebView），并与原生互通，形成混合开发模式。

## 总览

- 前端栈：Umi + React + antd-mobile（输出静态资源 `dist/`）。
- 嵌入容器：iOS `WKWebView`。
- 双向通信：`window.webkit.messageHandlers.NativeBridge.postMessage(...)` ⇄ `window.NativeBridge.callback(...)`。
- UA 约定：包含 `workbenchapp ios|android` 以启用 H5 原生环境分支。

前端已内置桥接工具：`apps/mobile/src/utils/nativeBridge.ts`。

## 一、H5 侧约定（已内置）

- JS 调用原生：
  - iOS：`window.webkit.messageHandlers.NativeBridge.postMessage({ method, callbackId, args })`
  - Android：`window.NativeBridge[method](callbackId, ...args)`
- 原生回调 JS：
  - `window.NativeBridge.callback(JSON.stringify({ callbackId, success, data, error }))`
- UA 识别：`navigator.userAgent` 包含 `workbenchapp`（不区分大小写）时视为原生容器；若包含 `ios` 则平台为 iOS。

常用 API（部分）：

- `getDeviceInfo()`: 返回设备信息（iOS 端建议返回 JSON 字符串）。
- `getNetworkStatus()`: 返回网络状态（同样建议 JSON 字符串）。
- `showToast(message, duration)`: 展示原生 Toast/Alert。
- `getStorage(key)` / `setStorage(key, value)`: 使用原生持久化（iOS 可用 `UserDefaults`）。
- `openCamera()` / `pickImage(maxCount)`: 打开相机/相册。

> 注意：`nativeBridge.getDeviceInfo()` 和 `getNetworkStatus()` 期望原生回传 `data` 为 JSON 字符串，H5 会再 `JSON.parse` 一次。

## 二、iOS 端集成步骤

### 1. 准备 WKWebView

```swift
import WebKit
import Network

class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?
    init(target: WKScriptMessageHandler) { self.target = target }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}

class WebContainerController: UIViewController, WKScriptMessageHandler, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    private var webView: WKWebView!
    private let monitor = NWPathMonitor()

    override func viewDidLoad() {
        super.viewDidLoad()

        let config = WKWebViewConfiguration()
        let ucc = WKUserContentController()

        // JSBridge 通道：名字必须为 "NativeBridge"
        ucc.add(WeakScriptMessageHandler(target: self), name: "NativeBridge")
        config.userContentController = ucc

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        // UA 增补：包含 "workbenchapp ios"，H5 用来识别原生环境与平台
        if #available(iOS 9.0, *) {
            webView.customUserAgent = (webView.value(forKey: "userAgent") as? String ?? "") + " workbenchapp ios"
        }

        view.addSubview(webView)

        // 加载资源：二选一
        // 1) 远端地址（推荐开发调试）：
        // let url = URL(string: "https://your-hosted-mobile-app.example.com/")!
        // webView.load(URLRequest(url: url))

        // 2) 本地包内资源（推荐生产离线）：
        if let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
        }
    }

    // JS -> Native 方法分发
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "NativeBridge", let body = message.body as? [String: Any] else { return }
        let method = body["method"] as? String ?? ""
        let callbackId = body["callbackId"] as? String ?? ""
        let args = body["args"] as? [Any] ?? []

        switch method {
        case "getDeviceInfo":
            let info: [String: Any] = [
                "platform": "ios",
                "version": UIDevice.current.systemVersion,
                "model": UIDevice.current.model,
                "brand": "Apple",
                "screenWidth": UIScreen.main.bounds.width,
                "screenHeight": UIScreen.main.bounds.height,
                "density": UIScreen.main.scale
            ]
            sendCallback(callbackId: callbackId, success: true, dataJSONString: jsonString(info))

        case "getNetworkStatus":
            // 简化：NWPathMonitor 判断连通性和类型
            var type = "unknown"
            let strength = 100 // 可按需评估信号强度
            if let iface = monitor.currentPath.availableInterfaces.first {
                switch iface.type { case .wifi: type = "wifi"; case .cellular: type = "cellular"; default: break }
            }
            let data: [String: Any] = [
                "isConnected": monitor.currentPath.status == .satisfied,
                "type": type,
                "strength": strength,
                "quality": strength >= 80 ? "excellent" : (strength >= 50 ? "good" : (strength > 0 ? "poor" : "none"))
            ]
            sendCallback(callbackId: callbackId, success: true, dataJSONString: jsonString(data))

        case "showToast":
            let message = (args.first as? String) ?? ""
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            present(alert, animated: true) {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { alert.dismiss(animated: true) }
            }
            sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "getStorage":
            let key = (args.first as? String) ?? ""
            let value = UserDefaults.standard.string(forKey: key)
            sendCallback(callbackId: callbackId, success: true, dataJSONString: jsonString(value))

        case "setStorage":
            let key = (args.first as? String) ?? ""
            let value = (args.dropFirst().first as? String) ?? ""
            UserDefaults.standard.setValue(value, forKey: key)
            sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

        case "openCamera":
            // 省略：present UIImagePickerController，拿到图片后回调 Base64/文件路径
            sendCallback(callbackId: callbackId, success: false, error: "not_implemented")

        case "pickImage":
            sendCallback(callbackId: callbackId, success: false, error: "not_implemented")

        default:
            sendCallback(callbackId: callbackId, success: false, error: "unknown_method")
        }
    }

    private func jsonString(_ obj: Any?) -> String {
        if obj == nil { return "null" }
        if JSONSerialization.isValidJSONObject(obj!) {
            let data = try! JSONSerialization.data(withJSONObject: obj!, options: [])
            return String(data: data, encoding: .utf8) ?? "null"
        }
        // 基础类型（String/Number/Bool）包装为 JSON 字面量
        if let s = obj as? String { return "\"\(s.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\""))\"" }
        if let b = obj as? Bool { return b ? "true" : "false" }
        if let n = obj as? NSNumber { return n.stringValue }
        return "null"
    }

    private func sendCallback(callbackId: String, success: Bool, dataJSONString: String? = nil, error: String? = nil) {
        var json = "{\\\"callbackId\\\":\\\"\(callbackId)\\\",\\\"success\\\":\(success ? "true" : "false")"
        if let e = error { json += ",\\\"error\\\":\\\"\(e)\\\"" }
        if let dataStr = dataJSONString { json += ",\\\"data\\\":\(dataStr)" } else { json += ",\\\"data\\\":null" }
        json += "}"
        let js = "window.NativeBridge && window.NativeBridge.callback(\"\(json)\")"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
```

要点：

- JSBridge 名称必须是 `NativeBridge`；
- 回调时执行 `window.NativeBridge.callback(JSONString)`，且 `data` 对于设备/网络两个 API 传 JSON 字符串；
- 设置 UA 包含 `workbenchapp ios` 以匹配前端的原生环境检测；
- 建议在生产使用本地离线包（`www/index.html` + `www/assets/**`）。

### 2. 资源打包与加载

前端构建：

```bash
pnpm -F mobile build
# 产物在 apps/mobile/dist
```

Xcode 中将 `apps/mobile/dist` 拖入工程，重命名为 `www` 资源目录（勾选 “Copy items if needed”）。

加载：参见上文 `loadFileURL` 示例。

> 可选：也可以加载远端地址，配合原生“本地兜底”策略（网络不可用时回退到内置包）。

## 三、联调验证

- 在原生容器中访问以下隐藏页面：
  - `/network-test`：一键跑通网络连通、JSBridge（`getDeviceInfo`/`getNetworkStatus`/`showToast`）验证。
  - `/device-test`：查看设备参数与适配效果。
  - `/bridge-test`：常用能力演示（剪贴板/分享/选择文件/震动/导航栏/关闭等）。
- 预期：运行测试时会触发原生 `showToast`，并展示原生回传的设备/网络信息。

## 四、可选增强

- 深链/跳转：定义 URL Scheme（如 `myapp://h5?path=/task-process/detail/123`），原生解析后调用 JS 执行 `location.assign(path)`。
- 原生导航联动：当 H5 无路可退时（`history.length<=1`）调用原生 `close()`/`pop()`；也可增加 H5 -> 原生 API `setNavBar(options)` 控制标题/返回按钮显示。
- 安全：白名单方法分发；对 `message.body` 做 schema 校验；记录审计日志。
- 监控：在桥接层上报调用耗时、失败率，便于 APM 与问题定位。

## 五、问题排查

- H5 未识别为原生环境：确认 WKWebView UA 是否包含 `workbenchapp ios`。
- JS 调用无响应：确认已 `add` 到 `NativeBridge` 名称；检查 `message.body` 格式。
- 回调报错：确认回调为 `JSON.stringify` 后的字符串；`data` 字段为 JSON 字符串（设备/网络两个 API）。

---

## 附：常用原生能力处理示例（Swift）

在 `userContentController(_:didReceive:)` 的 `switch method` 中新增分支：

```swift
case "copyToClipboard":
    let text = (args.first as? String) ?? ""
    UIPasteboard.general.string = text
    sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

case "getClipboardText":
    let text = UIPasteboard.general.string
    sendCallback(callbackId: callbackId, success: true, dataJSONString: jsonString(text))

case "share":
    if let dict = args.first as? [String: Any] {
        let items: [Any] = [dict["text"] as? String, dict["url"] as? String].compactMap { $0 }
        let vc = UIActivityViewController(activityItems: items, applicationActivities: nil)
        vc.popoverPresentationController?.sourceView = self.view
        self.present(vc, animated: true)
        sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")
    } else {
        sendCallback(callbackId: callbackId, success: false, error: "bad_args")
    }

case "openFilePicker":
    let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.item], asCopy: true)
    picker.allowsMultipleSelection = true
    picker.delegate = self
    // 在 delegate 回调中将选择结果转发给 JS，可通过 emitEvent 通知（见下）
    self.present(picker, animated: true)
    sendCallback(callbackId: callbackId, success: true, dataJSONString: "[]")

case "vibrate":
    // 轻触反馈
    let generator = UIImpactFeedbackGenerator(style: .light)
    generator.impactOccurred()
    sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

case "setNavBar":
    if let dict = args.first as? [String: Any] {
        self.title = (dict["title"] as? String) ?? self.title
        // showBack/rightText 可按需处理
        sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")
    } else {
        sendCallback(callbackId: callbackId, success: false, error: "bad_args")
    }

case "closeWebView":
    self.dismiss(animated: true)
    sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")

case "openDeepLink":
    if let urlStr = args.first as? String, let url = URL(string: urlStr) {
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
        sendCallback(callbackId: callbackId, success: true, dataJSONString: "\"ok\"")
    } else {
        sendCallback(callbackId: callbackId, success: false, error: "bad_url")
    }
```

如果需要从原生向 H5 主动推送事件（例如文件选择结果、深链唤起等），可调用：

```swift
// 1) 简单：传 JSON 字符串
let eventJSON = "{\\\"event\\\":\\\"deepLink\\\",\\\"data\\\":{\\\"url\\\":\\\"myapp://settings\\\"}}"
webView.evaluateJavaScript("window.NativeBridge && window.NativeBridge.emitEvent(\"\(eventJSON)\")")

// 2) 或者传 name + data
// window.NativeBridge.emitEvent('deepLink', { url: '...' })
```

> 相机/相册：可基于 `UIImagePickerController`/`PHPickerViewController` 实现，选择完成后将图片 `base64`/文件路径通过 `emitEvent('imagePicked', { items: [...] })` 推送给 H5，或直接在 `openCamera/pickImage` 成功回调返回。

### 相机/相册实现样例

```swift
import PhotosUI

extension WebContainerController: PHPickerViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func presentPhotoPicker(maxCount: Int = 1) {
        if #available(iOS 14, *) {
            var config = PHPickerConfiguration()
            config.selectionLimit = maxCount
            config.filter = .images
            let picker = PHPickerViewController(configuration: config)
            picker.delegate = self
            self.present(picker, animated: true)
        } else {
            let picker = UIImagePickerController()
            picker.sourceType = .photoLibrary
            picker.delegate = self
            self.present(picker, animated: true)
        }
    }

    func presentCamera() {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else { return }
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = self
        self.present(picker, animated: true)
    }

    // PHPicker (iOS14+)
    @available(iOS 14, *)
    public func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        var images: [String] = []
        let group = DispatchGroup()
        for r in results {
            if r.itemProvider.canLoadObject(ofClass: UIImage.self) {
                group.enter()
                r.itemProvider.loadObject(ofClass: UIImage.self) { (obj, err) in
                    defer { group.leave() }
                    if let img = obj as? UIImage, let data = img.jpegData(compressionQuality: 0.8) {
                        let b64 = data.base64EncodedString()
                        images.append("data:image/jpeg;base64,\(b64)")
                    }
                }
            }
        }
        group.notify(queue: .main) {
            // 方式一：事件通知
            let json = try! JSONSerialization.data(withJSONObject: ["event":"imagePicked","data":["items":images]], options: [])
            let jsonStr = String(data: json, encoding: .utf8)!
            self.webView.evaluateJavaScript("window.NativeBridge.emitEvent(\"\(jsonStr)\")")
        }
    }

    // UIImagePickerController (相册/相机 旧接口)
    public func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true)
        if let img = info[.originalImage] as? UIImage, let data = img.jpegData(compressionQuality: 0.8) {
            let b64 = data.base64EncodedString()
            let js = "window.NativeBridge.emitEvent(\\\"{\\\\\"event\\\\\":\\\\\"imagePicked\\\\\",\\\\\"data\\\\\":{\\\\\"items\\\\\":[\\\\\"data:image/jpeg;base64,\(b64)\\\\\"]}}\\\")"
            self.webView.evaluateJavaScript(js)
        }
    }
}
```
