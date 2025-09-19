# 混合应用架构总览

## 🏗️ 整体架构

这是一个完整的混合开发解决方案，包含了H5移动端应用和iOS/Android原生容器应用。

```
Apps 生态系统
├── 📱 mobile (H5移动端)        - React + Umi + antd-mobile
├── 🍎 ios-native (iOS原生)     - Swift + SwiftUI + WKWebView  
├── 🤖 android-native (Android原生) - Kotlin + WebView
├── 📊 blog (博客系统)          - Next.js
├── 🔧 lowcode (低代码平台)     - React + Vite
└── ⚙️ server (后端服务)        - NestJS + TypeORM
```

## 🎯 核心理念

### "工作台"概念
- **原生应用入口**: iOS/Android原生应用作为主要入口
- **H5应用内容**: 移动端H5应用作为"工作台"功能模块
- **无缝集成**: 用户感觉不到是在使用混合应用

### 用户体验流程
1. 用户下载安装原生应用（iOS/Android）
2. 原生应用启动，显示底部导航：首页、**工作台**、消息、我的
3. 点击"工作台"Tab → 加载H5移动端应用
4. H5应用在WebView中运行，提供完整的业务功能
5. 原生应用提供系统集成功能（相机、推送、文件等）

## 📱 H5 移动端应用 (`mobile/`)

### 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Umi 4.x
- **UI组件**: antd-mobile
- **状态管理**: Zustand  
- **样式**: Tailwind CSS + PostCSS
- **PWA**: 支持离线访问

### 核心功能
- ✅ 响应式设计（手机、平板适配）
- ✅ 底部导航（首页、应用、消息、通知、文档、我的）
- ✅ 原生桥接通信
- ✅ 环境检测（原生容器 vs Web浏览器）
- ✅ vConsole调试工具
- ✅ 配置系统（dev/prd环境）

### 部署方式
- **开发环境**: http://localhost:8002
- **生产环境**: https://your-domain.com
- **原生容器**: 通过WebView加载

## 🍎 iOS 原生应用 (`ios-native/`)

### 技术栈
- **语言**: Swift
- **UI框架**: SwiftUI
- **WebView**: WKWebView
- **最低版本**: iOS 13.0

### 项目结构
```
WorkbenchApp/
├── App/                    # 应用入口
├── Views/                  # 界面视图
├── WebView/               # WebView管理
├── Utils/                 # 工具类
└── Resources/             # 资源文件
```

### 核心功能
- 🍎 原生底部导航（TabView）
- 🍎 WKWebView容器
- 🍎 JavaScript Bridge通信
- 🍎 原生功能集成（相机、相册、推送）
- 🍎 自动适配iPhone/iPad

### 开发步骤
1. 使用Xcode创建新项目
2. 导入Swift源代码文件
3. 配置WebView加载H5应用
4. 实现JavaScript Bridge
5. 添加原生功能模块
6. 测试和发布到App Store

## 🤖 Android 原生应用 (`android-native/`)

### 技术栈
- **语言**: Kotlin
- **UI框架**: Android View System
- **WebView**: Android WebView
- **最低版本**: Android 5.0 (API 21)

### 项目结构
```
app/src/main/
├── java/com/yourcompany/workbench/
│   ├── ui/                # 界面Fragment
│   ├── webview/          # WebView管理
│   ├── utils/            # 工具类
│   └── application/      # Application
└── res/                  # 资源文件
```

### 核心功能
- 🤖 原生底部导航（BottomNavigationView）
- 🤖 WebView容器
- 🤖 JavaScript Interface通信
- 🤖 原生功能集成（相机、相册、推送）
- 🤖 权限管理
- 🤖 FCM推送集成

### 开发步骤
1. 使用Android Studio创建新项目
2. 导入Kotlin源代码文件
3. 配置Gradle依赖
4. 配置WebView加载H5应用
5. 实现JavaScript Interface
6. 添加原生功能模块
7. 测试和发布到Google Play

## 🌉 原生-H5 通信桥梁

### 统一接口设计
```typescript
interface NativeMethods {
  // 设备信息
  getDeviceInfo(): Promise<DeviceInfo>
  getNetworkStatus(): Promise<NetworkStatus>
  
  // UI交互
  showToast(message: string): void
  showAlert(title: string, message: string): Promise<boolean>
  showConfirm(title: string, message: string): Promise<boolean>
  
  // 相机和相册
  openCamera(options?: CameraOptions): Promise<ImageResult>
  openGallery(options?: GalleryOptions): Promise<ImageResult>
  
  // 文件操作
  uploadFile(file: File): Promise<UploadResult>
  downloadFile(url: string): Promise<DownloadResult>
  
  // 存储
  setStorage(key: string, value: any): Promise<boolean>
  getStorage(key: string): Promise<any>
  
  // 分享
  shareText(text: string): Promise<boolean>
  shareImage(imageUrl: string): Promise<boolean>
}
```

### iOS实现方式
```swift
// WKWebView 消息处理
func userContentController(_ userContentController: WKUserContentController, 
                          didReceive message: WKScriptMessage) {
    // 处理H5发来的消息
    handleNativeMethod(method: method, params: params)
}
```

### Android实现方式
```kotlin
@JavascriptInterface
fun callNativeMethod(method: String, params: String): String {
    // 处理H5发来的消息
    return handleNativeMethod(method, params)
}
```

### H5调用方式
```javascript
// 自动检测平台并调用对应方法
nativeBridge.showToast('Hello from H5!')
nativeBridge.getDeviceInfo().then(info => {
    console.log('Device:', info)
})
```

## 🚀 部署策略

### 开发环境
1. **H5应用**: 
   ```bash
   cd apps/mobile && PORT=8002 pnpm dev
   ```
2. **iOS模拟器**: 加载 `http://localhost:8002`
3. **Android模拟器**: 加载 `http://10.0.2.2:8002`
4. **真机测试**: 加载 `http://192.168.1.x:8002`

### 生产环境
1. **H5应用**: 部署到CDN或云服务器
2. **iOS应用**: 发布到App Store
3. **Android应用**: 发布到Google Play
4. **配置更新**: 原生应用配置生产环境H5地址

## 📊 优势分析

### ✅ 技术优势
- **快速开发**: H5应用一次开发，多端复用
- **热更新**: H5部分可以随时更新，无需发版
- **原生体验**: 外层原生容器提供优秀的启动性能
- **功能完整**: 结合原生能力，功能无限制

### ✅ 业务优势
- **降低成本**: 减少原生开发工作量
- **加快迭代**: H5部分可以快速响应业务需求
- **统一体验**: 跨平台一致的用户界面
- **灵活部署**: 支持灰度发布和A/B测试

### ✅ 维护优势
- **代码复用**: 核心业务逻辑只需维护一套
- **团队协作**: 前端团队可以同时支持多端
- **技术栈统一**: 基于现有React技术栈
- **调试便利**: 支持Chrome DevTools调试

## 🛣️ 后续规划

### 第一阶段（当前）
- ✅ H5移动端应用完成
- ✅ 原生容器项目结构搭建
- ✅ 基础桥接通信实现
- 🔄 iOS项目完善（进行中）
- 🔄 Android项目完善（进行中）

### 第二阶段
- 📷 相机/相册功能集成
- 📤 文件上传下载
- 📱 推送通知集成
- 🔐 原生登录/生物识别
- 📊 性能监控和分析

### 第三阶段
- 🎨 UI/UX优化
- 🚀 性能优化
- 🧪 自动化测试
- 📦 CI/CD流水线
- 🏪 应用商店发布

## 📞 联系方式

如需技术支持或有任何问题，请联系：
- 📧 Email: tech@yourcompany.com
- 💬 微信群: 工作台技术交流群
- 📱 钉钉群: 123456789
