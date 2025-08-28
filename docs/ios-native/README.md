# iOS 原生应用文档

## 项目概述

iOS 原生应用是一个使用 Swift 和 SwiftUI 构建的现代化 iOS 应用，主要功能是作为移动工作台的原生容器，通过 WKWebView 嵌入 H5 应用，并提供丰富的原生功能支持。

## 技术栈

### 核心技术
- **语言**: Swift 5.0+
- **UI 框架**: SwiftUI
- **WebView**: WKWebView
- **桥接**: WKScriptMessageHandler
- **网络**: URLSession
- **存储**: UserDefaults, Keychain
- **推送**: UserNotifications
- **最低支持**: iOS 14.0+

### 架构特点
- 🏗️ MVVM 架构模式
- 🌉 JavaScript Bridge 通信
- 📱 原生 UI + H5 内容混合
- 🔄 自动更新机制
- 🛡️ 安全存储
- 📊 性能监控

## 项目结构

```
apps/ios-native/WorkbenchApp/
├── WorkbenchApp/
│   ├── App/
│   │   ├── WorkbenchApp.swift      # 应用入口
│   │   └── ContentView.swift       # 主视图
│   ├── Views/                      # UI 视图
│   │   ├── HomeView.swift          # 首页视图
│   │   ├── WebViewContainer.swift  # WebView 容器
│   │   └── SplashView.swift        # 启动页
│   ├── ViewModels/                 # 视图模型
│   │   ├── AppViewModel.swift      # 应用状态管理
│   │   └── WebViewModel.swift      # WebView 状态管理
│   ├── Services/                   # 服务层
│   │   ├── WebBridgeService.swift  # 桥接服务
│   │   ├── NetworkService.swift    # 网络服务
│   │   ├── StorageService.swift    # 存储服务
│   │   └── NotificationService.swift # 通知服务
│   ├── Models/                     # 数据模型
│   │   ├── AppConfig.swift         # 应用配置
│   │   ├── User.swift              # 用户模型
│   │   └── BridgeMessage.swift     # 桥接消息模型
│   ├── Utils/                      # 工具类
│   │   ├── Extensions.swift        # 扩展方法
│   │   ├── Constants.swift         # 常量定义
│   │   └── Logger.swift            # 日志工具
│   └── Resources/                  # 资源文件
│       ├── Assets.xcassets         # 图片资源
│       ├── Localizable.strings     # 本地化文件
│       └── Info.plist              # 应用配置
├── WorkbenchApp.xcodeproj/         # Xcode 项目文件
├── README.md                       # 项目说明
└── package.json                    # 依赖管理
```

## 核心功能

### 1. 应用启动与初始化

```swift
// WorkbenchApp.swift
@main
struct WorkbenchApp: App {
    @StateObject private var appViewModel = AppViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appViewModel)
                .onAppear {
                    appViewModel.initialize()
                }
        }
    }
}
```

### 2. WebView 容器

```swift
// WebViewContainer.swift
struct WebViewContainer: UIViewRepresentable {
    @ObservedObject var webViewModel: WebViewModel
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        
        // 配置 JavaScript Bridge
        let userContentController = WKUserContentController()
        userContentController.add(context.coordinator, name: "nativeBridge")
        configuration.userContentController = userContentController
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        if let url = webViewModel.currentURL {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
}
```

### 3. JavaScript Bridge

```swift
// WebBridgeService.swift
class WebBridgeService: NSObject, WKScriptMessageHandler {
    weak var webView: WKWebView?
    
    func userContentController(_ userContentController: WKUserContentController, 
                             didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let method = body["method"] as? String else { return }
        
        switch method {
        case "getDeviceInfo":
            handleGetDeviceInfo(body)
        case "showToast":
            handleShowToast(body)
        case "openCamera":
            handleOpenCamera(body)
        case "getLocation":
            handleGetLocation(body)
        default:
            print("未知的桥接方法: \(method)")
        }
    }
    
    // 调用 JavaScript 方法
    func callJavaScript(method: String, data: [String: Any]) {
        let jsonData = try? JSONSerialization.data(withJSONObject: data)
        let jsonString = String(data: jsonData ?? Data(), encoding: .utf8) ?? "{}"
        
        let script = """
            if (window.nativeBridge && window.nativeBridge.onNativeMessage) {
                window.nativeBridge.onNativeMessage('\(method)', \(jsonString));
            }
        """
        
        DispatchQueue.main.async {
            self.webView?.evaluateJavaScript(script)
        }
    }
}
```

### 4. 设备信息获取

```swift
// DeviceInfo 扩展
extension WebBridgeService {
    private func handleGetDeviceInfo(_ params: [String: Any]) {
        let deviceInfo: [String: Any] = [
            "platform": "iOS",
            "version": UIDevice.current.systemVersion,
            "model": UIDevice.current.model,
            "name": UIDevice.current.name,
            "isNative": true,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0",
            "bundleId": Bundle.main.bundleIdentifier ?? "",
            "screenSize": [
                "width": UIScreen.main.bounds.width,
                "height": UIScreen.main.bounds.height
            ]
        ]
        
        if let callbackId = params["callbackId"] as? String {
            callJavaScript(method: "callback", data: [
                "callbackId": callbackId,
                "data": deviceInfo
            ])
        }
    }
}
```

### 5. 原生功能实现

#### Toast 提示
```swift
private func handleShowToast(_ params: [String: Any]) {
    guard let message = params["message"] as? String else { return }
    
    DispatchQueue.main.async {
        // 使用原生 Toast 实现
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        
        if let topController = UIApplication.shared.windows.first?.rootViewController {
            topController.present(alert, animated: true)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                alert.dismiss(animated: true)
            }
        }
    }
}
```

#### 相机访问
```swift
private func handleOpenCamera(_ params: [String: Any]) {
    DispatchQueue.main.async {
        let imagePickerController = UIImagePickerController()
        imagePickerController.sourceType = .camera
        imagePickerController.delegate = self
        
        if let topController = UIApplication.shared.windows.first?.rootViewController {
            topController.present(imagePickerController, animated: true)
        }
    }
}
```

#### 位置服务
```swift
private func handleGetLocation(_ params: [String: Any]) {
    let locationManager = CLLocationManager()
    locationManager.delegate = self
    locationManager.requestWhenInUseAuthorization()
    locationManager.requestLocation()
}
```

## 应用配置

### Info.plist 配置

```xml
<dict>
    <!-- 应用基本信息 -->
    <key>CFBundleName</key>
    <string>工作台</string>
    <key>CFBundleDisplayName</key>
    <string>移动工作台</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    
    <!-- 权限配置 -->
    <key>NSCameraUsageDescription</key>
    <string>需要访问相机以拍摄照片</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>需要访问相册以选择照片</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>需要获取位置信息</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>需要访问麦克风以录制音频</string>
    
    <!-- 网络安全配置 -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    
    <!-- URL Schemes -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>com.workbench.app</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>workbench</string>
            </array>
        </dict>
    </array>
</dict>
```

### 应用配置模型

```swift
// AppConfig.swift
struct AppConfig {
    static let shared = AppConfig()
    
    let h5BaseURL: String
    let apiBaseURL: String
    let appScheme: String
    let enableDebug: Bool
    
    private init() {
        #if DEBUG
        self.h5BaseURL = "http://localhost:8000"
        self.enableDebug = true
        #else
        self.h5BaseURL = "https://app.example.com"
        self.enableDebug = false
        #endif
        
        self.apiBaseURL = "https://api.example.com"
        self.appScheme = "workbench"
    }
}
```

## 状态管理

### AppViewModel

```swift
// AppViewModel.swift
class AppViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var isLoggedIn = false
    @Published var currentUser: User?
    @Published var networkStatus: NetworkStatus = .unknown
    
    private let storageService = StorageService()
    private let networkService = NetworkService()
    
    func initialize() {
        checkLoginStatus()
        setupNetworkMonitoring()
    }
    
    private func checkLoginStatus() {
        if let token = storageService.getToken() {
            isLoggedIn = true
            // 验证 token 有效性
        }
    }
    
    private func setupNetworkMonitoring() {
        // 网络状态监控
    }
}
```

### WebViewModel

```swift
// WebViewModel.swift
class WebViewModel: ObservableObject {
    @Published var currentURL: URL?
    @Published var isLoading = false
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var title = ""
    
    private let bridgeService = WebBridgeService()
    
    func loadURL(_ urlString: String) {
        guard let url = URL(string: urlString) else { return }
        currentURL = url
    }
    
    func reload() {
        // 重新加载当前页面
    }
    
    func goBack() {
        // 返回上一页
    }
    
    func goForward() {
        // 前进下一页
    }
}
```

## 本地化支持

### Localizable.strings (中文)

```
// zh-Hans.lproj/Localizable.strings
"app_name" = "移动工作台";
"loading" = "加载中...";
"network_error" = "网络连接失败";
"permission_camera" = "需要相机权限";
"permission_location" = "需要位置权限";
"ok" = "确定";
"cancel" = "取消";
"retry" = "重试";
```

### Localizable.strings (英文)

```
// en.lproj/Localizable.strings
"app_name" = "Mobile Workbench";
"loading" = "Loading...";
"network_error" = "Network connection failed";
"permission_camera" = "Camera permission required";
"permission_location" = "Location permission required";
"ok" = "OK";
"cancel" = "Cancel";
"retry" = "Retry";
```

## 开发与调试

### 开发环境设置

1. **Xcode 要求**: Xcode 14.0+
2. **iOS 模拟器**: iOS 14.0+
3. **开发者账号**: 用于真机调试

### 调试功能

```swift
// Logger.swift
class Logger {
    static func debug(_ message: String) {
        #if DEBUG
        print("🐛 [DEBUG] \(message)")
        #endif
    }
    
    static func info(_ message: String) {
        print("ℹ️ [INFO] \(message)")
    }
    
    static func warning(_ message: String) {
        print("⚠️ [WARNING] \(message)")
    }
    
    static func error(_ message: String) {
        print("❌ [ERROR] \(message)")
    }
}
```

### WebView 调试

```swift
// 启用 WebView 调试
#if DEBUG
if #available(iOS 16.4, *) {
    webView.isInspectable = true
}
#endif
```

## 构建与发布

### 开发构建

```bash
# 安装依赖
npm install

# 打开 Xcode 项目
open WorkbenchApp.xcodeproj
```

### 生产构建

1. 更新版本号
2. 配置签名证书
3. 选择 Release 配置
4. Archive 构建
5. 上传到 App Store Connect

### 自动化构建

```yaml
# .github/workflows/ios.yml
name: iOS Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Xcode
      uses: maxim-lobanov/setup-xcode@v1
      with:
        xcode-version: latest-stable
    
    - name: Build
      run: |
        cd apps/ios-native
        xcodebuild -project WorkbenchApp.xcodeproj \
                   -scheme WorkbenchApp \
                   -configuration Release \
                   -destination 'generic/platform=iOS' \
                   build
```

## 性能优化

### WebView 优化

```swift
// 预加载 WebView
private func preloadWebView() {
    let configuration = WKWebViewConfiguration()
    configuration.processPool = WKProcessPool()
    
    // 禁用不必要的功能
    configuration.allowsInlineMediaPlayback = false
    configuration.allowsPictureInPictureMediaPlayback = false
}

// 内存管理
private func optimizeMemory() {
    webView.configuration.websiteDataStore.removeData(
        ofTypes: WKWebsiteDataStore.allWebsiteDataTypes(),
        modifiedSince: Date(timeIntervalSince1970: 0)
    ) { }
}
```

### 启动优化

```swift
// 延迟初始化
private lazy var expensiveService = ExpensiveService()

// 后台任务
private func initializeInBackground() {
    DispatchQueue.global(qos: .utility).async {
        // 耗时初始化操作
        DispatchQueue.main.async {
            // 更新 UI
        }
    }
}
```

## 测试

### 单元测试

```swift
// WorkbenchAppTests.swift
import XCTest
@testable import WorkbenchApp

class WebBridgeServiceTests: XCTestCase {
    var bridgeService: WebBridgeService!
    
    override func setUp() {
        super.setUp()
        bridgeService = WebBridgeService()
    }
    
    func testDeviceInfoRetrieval() {
        // 测试设备信息获取
    }
    
    func testJavaScriptExecution() {
        // 测试 JavaScript 执行
    }
}
```

### UI 测试

```swift
// WorkbenchAppUITests.swift
import XCTest

class WorkbenchAppUITests: XCTestCase {
    func testLaunchScreenDisplay() {
        let app = XCUIApplication()
        app.launch()
        
        XCTAssertTrue(app.staticTexts["移动工作台"].exists)
    }
    
    func testWebViewLoading() {
        let app = XCUIApplication()
        app.launch()
        
        // 等待 WebView 加载
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 10))
    }
}
```

## 故障排除

### 常见问题

1. **WebView 无法加载**
   - 检查网络权限配置
   - 确认 H5 地址可访问
   - 查看控制台错误信息

2. **桥接通信失败**
   - 验证方法名称正确
   - 检查参数格式
   - 确认回调机制

3. **权限获取失败**
   - 检查 Info.plist 配置
   - 确认用户授权流程
   - 测试权限申请时机

4. **内存泄漏**
   - 检查循环引用
   - 使用 weak 引用
   - 及时释放资源

### 调试工具

- Xcode Debugger
- Instruments
- Safari Web Inspector
- Console.app

## 许可证

MIT License
