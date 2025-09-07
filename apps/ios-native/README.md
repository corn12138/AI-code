# iOS 原生应用

这是工作台应用的iOS原生版本，提供H5容器和原生功能桥接。

## 功能特性

- 🚀 **WKWebView容器**: 高性能H5应用加载
- 🔗 **原生桥接**: 提供设备信息、相机、存储等原生功能
- 📱 **响应式设计**: 适配iPhone和iPad
- 🔄 **下拉刷新**: 支持页面刷新
- 📊 **网络监控**: 实时网络状态检测
- 🔔 **推送通知**: Firebase集成
- 🧪 **完整测试**: 单元测试和UI测试

## 技术栈

- **语言**: Swift 5.0+
- **架构**: MVVM + Coordinator
- **UI**: UIKit + SwiftUI (混合)
- **网络**: URLSession + Combine
- **图片**: Photos Framework
- **存储**: UserDefaults + Core Data
- **测试**: XCTest + XCUITest
- **推送**: Firebase Cloud Messaging

## 项目结构

```
WorkbenchApp/
├── App/
│   ├── AppDelegate.swift           # 应用代理
│   └── SceneDelegate.swift         # 场景代理
├── Views/
│   ├── MainViewController.swift    # 主视图控制器
│   └── WebViewController.swift     # WebView控制器
├── WebView/
│   ├── WebViewBridge.swift         # 原生桥接
│   └── WebViewManager.swift        # WebView管理
├── Utils/
│   ├── NetworkMonitor.swift        # 网络监控
│   └── Logger.swift                # 日志工具
└── Resources/
    ├── Info.plist                  # 应用配置
    └── Assets.xcassets             # 资源文件
```

## 快速开始

### 环境要求

- Xcode 14.0+
- iOS 13.0+
- Swift 5.0+
- CocoaPods 或 Swift Package Manager

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd apps/ios-native

# 安装依赖 (如果使用CocoaPods)
pod install

# 打开工作空间
open WorkbenchApp.xcworkspace
```

### 开发配置

1. **配置H5地址**:
   在 `package.json` 中修改 `config` 部分：

   ```json
   {
     "config": {
       "h5_dev_url": "http://localhost:8002",
       "h5_prod_url": "https://your-production-domain.com"
     }
   }
   ```

2. **配置应用信息**:
   ```json
   {
     "config": {
       "bundle_id": "com.yourcompany.workbench",
       "app_name": "工作台",
       "version": "1.0.0",
       "build_number": "1"
     }
   }
   ```

### 构建和运行

```bash
# 构建调试版本
npm run ios:build

# 清理构建
npm run ios:clean

# 生成归档
npm run ios:archive

# 导出IPA
npm run ios:export
```

## 原生桥接功能

### 设备信息
```swift
// 获取设备信息
let deviceInfo = webViewBridge.getDeviceInfo()
```

### 网络状态
```swift
// 获取网络状态
let networkInfo = webViewBridge.getNetworkStatus()
```

### 相机功能
```swift
// 调用相机
webViewBridge.openCamera { result in
    switch result {
    case .success(let imagePath):
        // 处理图片路径
        print("拍照成功: \(imagePath)")
    case .failure(let error):
        // 处理错误
        print("拍照失败: \(error)")
    }
}
```

### 图片选择
```swift
// 选择图片
webViewBridge.pickImage(maxCount: 3) { result in
    switch result {
    case .success(let imagePaths):
        // 处理图片路径列表
        print("选择图片: \(imagePaths)")
    case .failure(let error):
        // 处理错误
        print("选择图片失败: \(error)")
    }
}
```

### 本地存储
```swift
// 设置存储
webViewBridge.setStorage(key: "key", value: "value")

// 获取存储
let value = webViewBridge.getStorage(key: "key")
```

## 测试

### 单元测试
```bash
# 运行单元测试
xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -destination 'platform=iOS Simulator,name=iPhone 14'

# 运行特定测试
xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -only-testing:WebViewBridgeTests
```

### UI测试
```bash
# 运行UI测试
xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -destination 'platform=iOS Simulator,name=iPhone 14' -only-testing:WorkbenchAppUITests
```

### 测试覆盖率
```bash
# 生成测试覆盖率报告
xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -enableCodeCoverage YES
```

## 部署

### 生成IPA
```bash
# 构建归档
xcodebuild archive -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -archivePath build/WorkbenchApp.xcarchive

# 导出IPA
xcodebuild -exportArchive -archivePath build/WorkbenchApp.xcarchive -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
```

### App Store发布
1. 在Xcode中配置证书和描述文件
2. 构建Release版本
3. 上传到App Store Connect
4. 提交审核

## 与H5集成

### H5端调用原生功能

```javascript
import { nativeBridge } from '@/utils/nativeBridge';

// 获取设备信息
const deviceInfo = await nativeBridge.getDeviceInfo();

// 调用相机
const imagePath = await nativeBridge.openCamera();

// 选择图片
const imagePaths = await nativeBridge.pickImage(3);

// 显示Toast
await nativeBridge.showToast('操作成功');

// 存储数据
await nativeBridge.setStorage('key', 'value');
const value = await nativeBridge.getStorage('key');
```

### 原生端接收H5消息

```swift
// 在WebViewBridge中处理H5调用
@objc func openCamera(_ callbackId: String) {
    bridgeCallback.openCamera { [weak self] result in
        DispatchQueue.main.async {
            self?.callJsCallback(callbackId: callbackId, result: result)
        }
    }
}
```

## 配置说明

### 权限配置
在 `Info.plist` 中配置所需权限：

```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机进行拍照</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册选择图片</string>
<key>NSMicrophoneUsageDescription</key>
<string>需要访问麦克风进行录音</string>
```

### 功能配置
```json
{
  "features": {
    "webview": {
      "javascript_enabled": true,
      "local_storage": true,
      "pull_to_refresh": true
    },
    "native_integration": {
      "camera": true,
      "photo_picker": true,
      "push_notifications": true
    }
  }
}
```

## 故障排除

### 常见问题

1. **H5页面无法加载**
   - 检查网络连接
   - 确认H5服务器地址配置正确
   - 检查WKWebView设置

2. **原生功能调用失败**
   - 确认权限已授予
   - 检查桥接接口实现
   - 查看控制台日志

3. **构建失败**
   - 清理项目: `xcodebuild clean`
   - 重置模拟器
   - 检查证书和描述文件

### 调试技巧

1. **启用WebView调试**:
   ```swift
   #if DEBUG
   WKWebView.setWebContentsDebuggingEnabled(true)
   #endif
   ```

2. **查看日志**:
   ```bash
   # 在Xcode控制台查看日志
   # 或使用 Console.app 查看设备日志
   ```

3. **远程调试WebView**:
   - 在Safari中启用开发者菜单
   - 连接设备或模拟器
   - 在Safari开发者工具中调试WebView

## 性能优化

### WebView优化
- 启用WKWebView的预加载功能
- 配置合适的缓存策略
- 优化JavaScript执行

### 内存管理
- 及时释放WebView资源
- 使用弱引用避免循环引用
- 监控内存使用情况

### 网络优化
- 实现请求缓存
- 使用CDN加速
- 压缩传输数据

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
