# iOS 原生应用 - 工作台容器

## 📱 项目概述

这是一个iOS原生应用，作为H5移动端应用的容器，提供"工作台"功能入口。

## 🏗️ 架构设计

```
iOS Native App
├── 主界面 (Tab/Navigation)
│   ├── 首页
│   ├── 工作台 → H5 Mobile App
│   ├── 消息
│   └── 我的
└── WebView 容器
    └── 加载 H5 Mobile 应用
```

## 🎯 核心功能

### 1. 工作台入口
- **图标**: 工作台 icon
- **标题**: "工作台"
- **点击**: 进入 H5 移动端应用

### 2. WebView 集成
- 使用 `WKWebView` 加载 H5 应用
- 支持 JavaScript Bridge 通信
- 自动适配屏幕尺寸
- 支持下拉刷新

### 3. 原生功能扩展
- 推送通知
- 相机/相册调用
- 文件上传下载
- 设备信息获取
- 网络状态监测

## 🛠️ 技术栈

- **开发语言**: Swift
- **UI框架**: SwiftUI / UIKit
- **WebView**: WKWebView
- **网络**: URLSession
- **存储**: UserDefaults / Core Data
- **推送**: APNs

## 📦 项目结构

```
WorkbenchApp/
├── App/
│   ├── WorkbenchApp.swift          # App入口
│   ├── ContentView.swift           # 主界面
│   └── Info.plist                  # 应用配置
├── Views/
│   ├── HomeView.swift              # 首页
│   ├── WorkbenchView.swift         # 工作台(WebView)
│   ├── MessageView.swift           # 消息
│   └── ProfileView.swift           # 我的
├── WebView/
│   ├── WebViewController.swift     # WebView控制器
│   ├── JSBridge.swift              # JS桥接
│   └── WebViewConfig.swift         # WebView配置
├── Utils/
│   ├── NetworkManager.swift        # 网络管理
│   ├── StorageManager.swift        # 存储管理
│   └── DeviceInfo.swift            # 设备信息
└── Resources/
    ├── Assets.xcassets             # 图片资源
    └── Localizable.strings         # 多语言
```

## 🚀 开发步骤

### 1. 创建 Xcode 项目
```bash
# 使用 Xcode 创建新项目
# 选择 iOS App
# 语言: Swift
# 界面: SwiftUI
# Bundle ID: com.yourcompany.workbench
```

### 2. 配置 WebView
```swift
import WebKit

class WebViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadH5App()
    }
    
    private func loadH5App() {
        let url = URL(string: "http://your-domain.com:8002")!
        webView.load(URLRequest(url: url))
    }
}
```

### 3. JavaScript Bridge
```swift
// 注入 JavaScript 桥接方法
webView.configuration.userContentController.add(self, name: "nativeHandler")

// 处理 H5 调用原生功能
func userContentController(_ userContentController: WKUserContentController, 
                          didReceive message: WKScriptMessage) {
    // 处理 H5 发来的消息
}
```

## 🔗 H5 集成配置

在 H5 应用中添加原生检测和调用：

```javascript
// 检测是否在原生应用中
const isInNativeApp = window.webkit && window.webkit.messageHandlers;

// 调用原生功能
function callNativeMethod(method, params) {
    if (isInNativeApp) {
        window.webkit.messageHandlers.nativeHandler.postMessage({
            method: method,
            params: params
        });
    }
}
```

## 📱 界面设计

### 底部Tab设计
- 🏠 首页
- 💼 工作台 (主要功能)
- 💬 消息
- 👤 我的

### 工作台页面
- 全屏 WebView
- 无边框设计
- 支持手势导航
- 加载指示器

## 🔧 环境配置

### 开发环境
- H5应用地址: `http://localhost:8002`
- 调试模式: 启用 Web Inspector

### 生产环境
- H5应用地址: `https://your-production-domain.com`
- HTTPS证书验证
- 性能优化

## 📋 待实现功能

- [ ] 项目基础结构搭建
- [ ] WebView 容器实现
- [ ] JavaScript Bridge 通信
- [ ] 底部导航栏
- [ ] 启动页面
- [ ] 图标和资源
- [ ] 网络状态处理
- [ ] 错误页面
- [ ] 推送通知集成
- [ ] App Store 发布准备
