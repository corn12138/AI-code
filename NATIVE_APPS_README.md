# 原生应用开发指南

本项目包含了 Android 和 iOS 两个原生应用，它们都是 H5 容器应用，用于加载和展示移动端的 AI 技术文章阅读应用。

## 📱 应用概述

### Android 应用 (`@android-native/`)
- **包名**: `com.aicode.mobile`
- **应用名**: AI技术文章阅读
- **最低版本**: Android 5.0 (API 21)
- **目标版本**: Android 14 (API 34)

### iOS 应用 (`@ios-native/`)
- **Bundle ID**: `com.aicode.mobile`
- **应用名**: AI技术文章阅读
- **最低版本**: iOS 13.0
- **开发语言**: Swift + SwiftUI

## 🚀 快速开始

### 前置条件

1. **确保后端服务运行**:
   ```bash
   cd apps/server
   npm run dev
   ```

2. **确保移动端 H5 应用运行**:
   ```bash
   cd apps/mobile
   npm run dev:ssr
   ```

### Android 应用

#### 环境要求
- Android Studio Arctic Fox 或更高版本
- Android SDK 21+
- Kotlin 1.8.10+
- Gradle 8.0.2+

#### 运行步骤
1. **使用脚本运行** (推荐):
   ```bash
   cd apps/android-native
   ./run-android.sh
   ```

2. **手动运行**:
   ```bash
   cd apps/android-native
   ./gradlew assembleDebug
   ./gradlew installDebug
   ```

3. **在 Android Studio 中运行**:
   - 打开 `apps/android-native` 目录
   - 点击 Run 按钮

### iOS 应用

#### 环境要求
- Xcode 14.0+
- iOS 13.0+
- Swift 5.0+
- macOS 开发环境

#### 运行步骤
1. **使用脚本运行** (推荐):
   ```bash
   cd apps/ios-native
   ./run-ios.sh
   ```

2. **在 Xcode 中运行**:
   - 打开 `apps/ios-native/WorkbenchApp.xcworkspace`
   - 选择目标设备或模拟器
   - 点击 Run 按钮

## 🔧 技术架构

### Android 架构
```
MainActivity
├── CustomWebView (自定义WebView容器)
├── WebViewManager (WebView管理器)
├── WebViewBridge (原生桥接)
└── ApiService (API服务)
```

### iOS 架构
```
ContentView (SwiftUI)
├── WebViewContainer (WebView容器)
├── WebViewManager (WebView管理器)
├── APIService (API服务)
└── NetworkMonitor (网络监控)
```

## 🌐 原生桥接功能

两个原生应用都提供了以下桥接功能：

### 设备信息
```javascript
// H5 调用
const deviceInfo = await window.NativeBridge.getDeviceInfo();
```

### 网络状态
```javascript
// H5 调用
const networkStatus = await window.NativeBridge.getNetworkStatus();
```

### Toast 消息
```javascript
// H5 调用
await window.NativeBridge.showToast('操作成功');
```

### 本地存储
```javascript
// H5 调用
await window.NativeBridge.setStorage('key', 'value');
const value = await window.NativeBridge.getStorage('key');
```

### API 调用
```javascript
// H5 调用 - 获取文章列表
const articles = await window.NativeBridge.fetchArticles('frontend', 1, 10);

// H5 调用 - 获取文章详情
const article = await window.NativeBridge.fetchArticleById('article-id');
```

## 📝 配置说明

### Android 配置

#### 应用配置 (`package.json`)
```json
{
  "config": {
    "h5_dev_url": "http://10.0.2.2:3000",
    "h5_prod_url": "https://your-production-domain.com",
    "application_id": "com.aicode.mobile",
    "app_name": "AI技术文章阅读"
  }
}
```

#### 构建配置 (`build.gradle`)
- H5 开发地址: `http://10.0.2.2:3000`
- API 地址: `http://10.0.2.2:3001`
- 生产地址: 可在构建时配置

### iOS 配置

#### 应用配置 (`package.json`)
```json
{
  "config": {
    "h5_dev_url": "http://localhost:3000",
    "h5_prod_url": "https://your-production-domain.com",
    "bundle_id": "com.aicode.mobile",
    "app_name": "AI技术文章阅读"
  }
}
```

#### 网络配置 (`Info.plist`)
- 允许 HTTP 连接 (开发环境)
- 允许本地网络访问

## 🔍 调试指南

### Android 调试
1. **WebView 调试**:
   - 在 Chrome 中访问 `chrome://inspect`
   - 选择对应的 WebView 进行调试

2. **日志查看**:
   ```bash
   adb logcat | grep AiCodeMobile
   ```

### iOS 调试
1. **WebView 调试**:
   - 在 Safari 中启用开发者菜单
   - 连接设备或模拟器进行调试

2. **控制台日志**:
   - 在 Xcode 中查看控制台输出

## 🚨 常见问题

### Android 问题

1. **H5 页面无法加载**
   - 检查网络连接
   - 确认 H5 服务器地址配置正确
   - 检查 `usesCleartextTraffic="true"` 配置

2. **API 调用失败**
   - 确认后端服务正在运行
   - 检查 API 地址配置
   - 查看网络权限设置

### iOS 问题

1. **构建失败**
   - 确认 Xcode 版本兼容性
   - 检查证书和描述文件
   - 清理项目重新构建

2. **网络请求失败**
   - 检查 `NSAppTransportSecurity` 配置
   - 确认允许本地网络访问

## 📦 部署指南

### Android 部署
1. **生成 APK**:
   ```bash
   ./gradlew assembleRelease
   ```

2. **生成 AAB**:
   ```bash
   ./gradlew bundleRelease
   ```

### iOS 部署
1. **生成 Archive**:
   - 在 Xcode 中选择 Product → Archive
   - 导出 IPA 文件

2. **App Store 发布**:
   - 上传到 App Store Connect
   - 提交审核

## 🤝 开发贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License
