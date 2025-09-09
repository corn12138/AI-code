# iOS 运行快速指南

目标：启动 iOS 原生容器（WKWebView），让 `apps/mobile` H5 在原生内运行与通信。

## 方案 A：开发态（远端加载）

1) 启动 H5 开发服务器（默认 8000）

```bash
pnpm -F mobile dev
```

2) Xcode 配置（新建或现有工程）

- 打开/创建 Xcode 工程（建议名称：WorkbenchApp）。
- 将 `apps/ios-native/WorkbenchApp` 整个目录拖入工程（Create folder references / Copy items if needed）。
- 在 Scheme 的 Run 配置里添加环境变量：
  - `H5_URL = http://localhost:8000`（模拟器）
- 在 Info.plist 添加 ATS 例外（仅开发）：
  - `NSAppTransportSecurity` → `NSAllowsArbitraryLoads = YES`

3) 运行

- 选择 iOS 模拟器，Run。
- WebView 将加载 `H5_URL`，在地址栏导航至：
  - `/network-test`（网络/桥接一键测试）
  - `/device-test`（设备信息与适配）
  - `/bridge-test`（剪贴板/分享/选文件/震动/导航栏/关闭/深链）

## 方案 B：离线包（本地加载）

1) 打包 H5 并拷贝到 iOS `www/`

```bash
bash scripts/sync-mobile-to-ios.sh
```

2) Xcode 中将 `apps/ios-native/WorkbenchApp/www` 作为文件夹引用加入工程（勾选 Copy items if needed）。

3) 运行时切换为离线包

- 在 Scheme 的 Run 环境变量中设置：`H5_OFFLINE = 1`
- 不设置 `H5_URL` 或留空。

## 联调验证

- 打开 `/network-test`，点击“运行测试”：应看到原生弹窗 Toast，页面显示设备/网络信息（来自原生）。
- `/bridge-test` 可测试剪贴板/分享/震动/关闭等能力。

## 常见问题

- 无法访问 `http://localhost`：在真机上请将 `H5_URL` 改为本机局域网 IP，例如 `http://192.168.1.100:8000`，并配置 ATS 例外域名。
- H5 未识别为原生环境：确认 WKWebView 的 UA 包含 `workbenchapp ios`；或确认已注册 `messageHandlers.NativeBridge`（本模板已处理）。
- JS 调用无响应：确认消息体结构为 `{ method, callbackId, args }`；回调使用 `window.NativeBridge.callback(JSONString)`（模板已实现）。

## 权限与配置（相机/相册/文件）

- 在 Info.plist 中添加权限文案：
  - `NSCameraUsageDescription`：需要访问相机用于拍摄照片上传
  - `NSPhotoLibraryUsageDescription`：需要访问相册以选择照片上传
  - `NSPhotoLibraryAddUsageDescription`：需要写入相册以保存拍摄的照片
- 模板示例：`apps/ios-native/WorkbenchApp/Resources/Info.plist`
- 如需文件选择（非图片），`UIDocumentPickerViewController` 已接入，iOS 需启用 iCloud Drive 或本地“文件”访问。
