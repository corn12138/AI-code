import Foundation
import UIKit
import WebKit

/// WebView与原生功能的桥接类
/// 提供原生功能给H5调用
class WebViewBridge: NSObject {

    private weak var webView: WKWebView?
    private weak var viewController: UIViewController?
    private let bridgeCallback: BridgeCallback

    init(webView: WKWebView, viewController: UIViewController, bridgeCallback: BridgeCallback) {
        self.webView = webView
        self.viewController = viewController
        self.bridgeCallback = bridgeCallback
        super.init()
    }

    // MARK: - JavaScript Interface

    /**
     * 获取设备信息
     */
    @objc func getDeviceInfo() -> String {
        let deviceInfo = DeviceInfo(
            platform: "ios",
            version: UIDevice.current.systemVersion,
            model: UIDevice.current.model,
            brand: "Apple",
            screenWidth: Int(UIScreen.main.bounds.width),
            screenHeight: Int(UIScreen.main.bounds.height),
            density: UIScreen.main.scale
        )

        return deviceInfo.toJSONString()
    }

    /**
     * 获取网络状态
     */
    @objc func getNetworkStatus() -> String {
        let networkInfo = bridgeCallback.getNetworkStatus()
        return networkInfo.toJSONString()
    }

    /**
     * 调用相机
     */
    @objc func openCamera(_ callbackId: String) {
        bridgeCallback.openCamera { [weak self] result in
            DispatchQueue.main.async {
                self?.callJsCallback(callbackId: callbackId, result: result)
            }
        }
    }

    /**
     * 选择图片
     */
    @objc func pickImage(_ callbackId: String, maxCount: Int) {
        bridgeCallback.pickImage(maxCount: maxCount) { [weak self] result in
            DispatchQueue.main.async {
                self?.callJsCallback(callbackId: callbackId, result: result)
            }
        }
    }

    /**
     * 显示Toast消息
     */
    @objc func showToast(_ message: String, duration: String) {
        DispatchQueue.main.async {
            self.bridgeCallback.showToast(message: message, duration: duration)
        }
    }

    /**
     * 获取本地存储数据
     */
    @objc func getStorage(_ key: String) -> String {
        let value = bridgeCallback.getStorage(key: key)
        return value ?? "null"
    }

    /**
     * 设置本地存储数据
     */
    @objc func setStorage(_ key: String, value: String) {
        bridgeCallback.setStorage(key: key, value: value)
    }

    // MARK: - Private Methods

    private func callJsCallback(callbackId: String, result: Result<Any, Error>) {
        let response = BridgeResponse(
            callbackId: callbackId,
            success: result.isSuccess,
            data: result.success,
            error: result.failure?.localizedDescription
        )

        let jsCode = """
                if (window.NativeBridge && window.NativeBridge.callback) {
                    window.NativeBridge.callback('\(response.toJSONString())');
                }
            """

        webView?.evaluateJavaScript(jsCode, completionHandler: nil)
    }
}

// MARK: - Data Models

struct DeviceInfo: Codable {
    let platform: String
    let version: String
    let model: String
    let brand: String
    let screenWidth: Int
    let screenHeight: Int
    let density: CGFloat
}

struct NetworkInfo: Codable {
    let isConnected: Bool
    let type: String
    let strength: Int
}

struct BridgeResponse: Codable {
    let callbackId: String
    let success: Bool
    let data: Any?
    let error: String?

    enum CodingKeys: String, CodingKey {
        case callbackId, success, data, error
    }

    init(callbackId: String, success: Bool, data: Any?, error: String?) {
        self.callbackId = callbackId
        self.success = success
        self.data = data
        self.error = error
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(callbackId, forKey: .callbackId)
        try container.encode(success, forKey: .success)
        try container.encode(error, forKey: .error)

        if let data = data {
            if let stringData = data as? String {
                try container.encode(stringData, forKey: .data)
            } else if let intData = data as? Int {
                try container.encode(intData, forKey: .data)
            } else if let boolData = data as? Bool {
                try container.encode(boolData, forKey: .data)
            } else if let arrayData = data as? [String] {
                try container.encode(arrayData, forKey: .data)
            }
        }
    }
}

// MARK: - Bridge Callback Protocol

protocol BridgeCallback: AnyObject {
    func getNetworkStatus() -> NetworkInfo
    func openCamera(completion: @escaping (Result<String, Error>) -> Void)
    func pickImage(maxCount: Int, completion: @escaping (Result<[String], Error>) -> Void)
    func showToast(message: String, duration: String)
    func getStorage(key: String) -> String?
    func setStorage(key: String, value: String)
}

// MARK: - Extensions

extension Encodable {
    func toJSONString() -> String {
        do {
            let data = try JSONEncoder().encode(self)
            return String(data: data, encoding: .utf8) ?? "{}"
        } catch {
            return "{}"
        }
    }
}

extension Result {
    var isSuccess: Bool {
        switch self {
        case .success:
            return true
        case .failure:
            return false
        }
    }

    var success: Success? {
        switch self {
        case .success(let value):
            return value
        case .failure:
            return nil
        }
    }

    var failure: Failure? {
        switch self {
        case .success:
            return nil
        case .failure(let error):
            return error
        }
    }
}
