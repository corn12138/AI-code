# 🍎 iOS 原生应用文档

基于 Swift 的 iOS 原生应用，支持与 H5 移动端的混合开发模式。

## 🚀 应用特性

### 核心功能
- **原生性能**: 基于 Swift 的高性能原生应用
- **混合开发**: 支持 H5 页面嵌入和原生页面切换
- **WebView 集成**: 无缝的 Web 内容展示
- **原生功能**: 访问设备原生功能（相机、相册、推送通知）
- **离线支持**: 本地缓存和离线功能
- **三端统一**: 与 Android、Web 端共享同一套 NestJS BFF API
- **推送通知**: 原生推送通知支持

### 技术亮点
- **Swift**: 现代化的 iOS 开发语言
- **SwiftUI**: 声明式 UI 框架
- **WebKit**: 现代 Web 内容展示
- **Combine**: 响应式编程框架
- **Core Data**: 本地数据存储
- **URLSession**: 网络请求处理
- **UserNotifications**: 推送通知框架
- **AVFoundation**: 相机和媒体功能

## 📁 项目结构

```
ios-native/
├── WorkbenchApp/           # 📱 应用代码
│   ├── App/                # 🏠 应用入口
│   │   ├── WorkbenchApp.swift
│   │   ├── ContentView.swift
│   │   └── WorkbenchAppApp.swift
│   ├── Network/            # 🌐 网络层
│   │   └── NetworkManager.swift
│   ├── Resources/          # 🎨 资源文件
│   │   └── Info.plist
│   ├── Utils/              # 🔧 工具类
│   │   └── Utils.swift
│   ├── Views/              # 👁️ 视图组件
│   │   ├── HomeView.swift
│   │   └── WebView.swift
│   ├── WebView/            # 🌐 WebView 组件
│   │   ├── WebView.swift
│   │   ├── WebViewCoordinator.swift
│   │   └── WebViewDelegate.swift
│   └── www/                # 🌐 Web 资源
├── package.json            # 📦 包管理
├── README.md               # 📋 项目说明
├── RUN_IOS_QUICKSTART.md   # 🚀 快速开始指南
└── run-ios.sh              # 🚀 运行脚本
```

## 🛠️ 技术栈详情

### 开发环境
- **Xcode**: 15.0+ (官方开发环境)
- **Swift**: 5.9+ (编程语言)
- **iOS SDK**: 17.0+ (系统 SDK)
- **macOS**: 12.0+ (开发系统要求)

### 核心框架
- **SwiftUI**: 声明式 UI 框架
- **WebKit**: Web 内容展示框架
- **Combine**: 响应式编程框架
- **Foundation**: 基础框架
- **UIKit**: UI 组件框架 (兼容性)

### 网络和存储
- **URLSession**: 网络请求处理
- **Core Data**: 本地数据存储
- **UserDefaults**: 轻量级数据存储
- **Keychain**: 安全数据存储

### 系统功能
- **UserNotifications**: 推送通知
- **AVFoundation**: 相机和媒体
- **PhotosUI**: 相册访问
- **Network**: 网络状态监控
- **BackgroundTasks**: 后台任务

### 测试框架
- **XCTest**: 单元测试框架
- **XCUITest**: UI 测试框架
- **Quick/Nimble**: BDD 测试框架 (可选)

### 部署和分发
- **TestFlight**: 测试分发
- **App Store Connect**: 应用商店管理
- **Fastlane**: 自动化部署 (可选)

## 🛠️ 快速开始

### 环境要求
- **Xcode**: >= 15.0
- **iOS**: >= 13.0 (deployment_target)
- **macOS**: >= 12.0
- **Node.js**: >= 16 (用于混合开发)

### 安装依赖
```bash
# 安装 Node.js 依赖
pnpm install

# 同步移动端代码
./sync-mobile-to-ios.sh
```

### 开发模式

#### 启动 Xcode
```bash
# 打开 Xcode 项目
open WorkbenchApp.xcworkspace
```

#### 运行应用
```bash
# 使用脚本运行
./run-ios.sh

# 或使用 xcodebuild
cd WorkbenchApp && xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp build
```

### 构建发布
```bash
# 构建调试版本
cd WorkbenchApp && xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp build

# 构建发布版本
cd WorkbenchApp && xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Release build
```

## 📚 详细文档

### 🏗️ 架构设计
- **混合架构**: H5 + 原生混合开发模式
- **WebKit 集成**: 现代 Web 内容展示
- **原生功能**: 设备功能访问
- **性能优化**: 内存和渲染优化

### 🔧 开发指南
- **Swift 开发**: 现代化 iOS 开发
- **SwiftUI**: 声明式 UI 开发
- **WebKit**: Web 内容集成
- **测试开发**: 单元测试和 UI 测试

## 🎯 技术栈

### 开发语言
- **Swift**: 主要开发语言
- **SwiftUI**: 声明式 UI 框架
- **Objective-C**: 兼容性支持

### 框架和库
- **UIKit**: 传统 UI 框架
- **SwiftUI**: 现代 UI 框架
- **WebKit**: Web 内容展示
- **Combine**: 响应式编程

### 开发工具
- **Xcode**: 官方 IDE
- **Swift Package Manager**: 包管理
- **Instruments**: 性能分析
- **Simulator**: 模拟器测试

## 🚀 部署

### 调试版本
```bash
# 在模拟器中运行
cd WorkbenchApp && xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -destination 'platform=iOS Simulator,name=iPhone 14'
```

### 发布版本
```bash
# 构建发布版本
cd WorkbenchApp && xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Release build

# 归档应用
cd WorkbenchApp && xcodebuild archive -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Release
```

## 🧪 测试

### 单元测试
```bash
cd WorkbenchApp && xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -destination 'platform=iOS Simulator,name=iPhone 14'
```

### UI 测试
```bash
cd WorkbenchApp && xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -destination 'platform=iOS Simulator,name=iPhone 14' -only-testing:WorkbenchAppUITests
```

### 代码检查
```bash
# 使用 SwiftLint
swiftlint

# 使用 SwiftFormat
swift-format lint --recursive .
```

## 📱 混合开发

### H5 集成
- **WebKit 配置**: 支持现代 Web 标准
- **JavaScript 桥接**: 原生与 Web 通信
- **资源管理**: 本地资源缓存
- **性能优化**: WebKit 性能调优

### 原生功能
- **设备访问**: 相机、位置、存储等
- **系统集成**: 通知、分享、设置等
- **性能监控**: 应用性能指标
- **错误处理**: 异常捕获和处理

## 📈 项目状态

- ✅ **基础架构**: 完整的项目结构
- ✅ **混合开发**: H5 集成支持
- ✅ **构建系统**: Xcode 项目配置
- ✅ **开发工具**: Xcode 支持
- ✅ **测试框架**: 单元测试和 UI 测试

## 🔗 相关链接

- [应用根目录](../../apps/ios-native/)
- [快速开始指南](../../apps/ios-native/RUN_IOS_QUICKSTART.md)
- [运行脚本](../../apps/ios-native/run-ios.sh)
- [移动端应用](../../apps/mobile/) - H5 移动端应用

## 📝 开发注意事项

### 性能优化
- 合理使用内存，避免内存泄漏
- 优化 WebKit 性能
- 使用异步处理避免主线程阻塞

### 兼容性
- 支持 iOS 14.0+
- 测试不同设备尺寸
- 处理不同 iOS 版本差异

### 安全考虑
- 网络安全配置
- 数据加密存储
- 权限管理
- App Transport Security

---

*最后更新: 2025-01-03*
*维护者: AI Assistant*