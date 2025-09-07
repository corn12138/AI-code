# Android 原生应用

这是工作台应用的Android原生版本，提供H5容器和原生功能桥接。

## 功能特性

- 🚀 **WebView容器**: 无缝加载H5应用
- 🔗 **原生桥接**: 提供设备信息、相机、存储等原生功能
- 📱 **响应式设计**: 适配不同屏幕尺寸
- 🔄 **下拉刷新**: 支持页面刷新
- 📊 **网络监控**: 实时网络状态检测
- 🔔 **推送通知**: Firebase集成
- 🧪 **完整测试**: 单元测试和集成测试

## 技术栈

- **语言**: Kotlin
- **架构**: MVVM + Repository
- **UI**: Material Design Components
- **网络**: Retrofit + OkHttp
- **图片**: Glide
- **存储**: Room Database
- **测试**: JUnit + Mockito + Espresso
- **推送**: Firebase Cloud Messaging

## 项目结构

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/yourcompany/workbench/
│   │   │   ├── application/          # 应用层
│   │   │   ├── webview/              # WebView相关
│   │   │   │   ├── CustomWebView.kt  # 自定义WebView
│   │   │   │   └── WebViewBridge.kt  # 原生桥接
│   │   │   ├── ui/                   # UI层
│   │   │   ├── model/                # 数据模型
│   │   │   ├── adapter/              # 适配器
│   │   │   └── utils/                # 工具类
│   │   └── res/                      # 资源文件
│   └── test/                         # 单元测试
│       └── java/com/yourcompany/workbench/
│           └── WebViewBridgeTest.kt
└── build.gradle                      # 构建配置
```

## 快速开始

### 环境要求

- Android Studio Arctic Fox 或更高版本
- Android SDK 21+
- Kotlin 1.8.10+
- Gradle 8.0.2+

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd apps/android-native

# 同步Gradle依赖
./gradlew build
```

### 开发配置

1. **配置H5地址**:
   在 `package.json` 中修改 `config` 部分：

   ```json
   {
     "config": {
       "h5_dev_url": "http://10.0.2.2:8002",
       "h5_prod_url": "https://your-production-domain.com"
     }
   }
   ```

2. **配置应用信息**:
   ```json
   {
     "config": {
       "application_id": "com.yourcompany.workbench",
       "app_name": "工作台",
       "version_name": "1.0.0",
       "version_code": 1
     }
   }
   ```

### 构建和运行

```bash
# 调试版本
npm run android:debug

# 发布版本
npm run android:build

# 安装到设备
npm run android:install

# 清理构建
npm run android:clean
```

## 原生桥接功能

### 设备信息
```kotlin
// 获取设备信息
val deviceInfo = webViewBridge.getDeviceInfo()
```

### 网络状态
```kotlin
// 获取网络状态
val networkInfo = webViewBridge.getNetworkStatus()
```

### 相机功能
```kotlin
// 调用相机
webViewBridge.openCamera { result ->
    when (result) {
        is Success -> {
            val imagePath = result.getOrNull()
            // 处理图片路径
        }
        is Failure -> {
            val error = result.exceptionOrNull()
            // 处理错误
        }
    }
}
```

### 图片选择
```kotlin
// 选择图片
webViewBridge.pickImage(maxCount = 3) { result ->
    when (result) {
        is Success -> {
            val imagePaths = result.getOrNull()
            // 处理图片路径列表
        }
        is Failure -> {
            val error = result.exceptionOrNull()
            // 处理错误
        }
    }
}
```

### 本地存储
```kotlin
// 设置存储
webViewBridge.setStorage("key", "value")

// 获取存储
val value = webViewBridge.getStorage("key")
```

## 测试

### 单元测试
```bash
# 运行单元测试
npm run android:test

# 运行特定测试
./gradlew test --tests WebViewBridgeTest
```

### 集成测试
```bash
# 运行集成测试
./gradlew connectedAndroidTest
```

### 测试覆盖率
```bash
# 生成测试覆盖率报告
./gradlew jacocoTestReport
```

## 部署

### 生成APK
```bash
# 生成调试APK
./gradlew assembleDebug

# 生成发布APK
./gradlew assembleRelease
```

### 生成AAB
```bash
# 生成Android App Bundle
./gradlew bundleRelease
```

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

```kotlin
// 在WebViewBridge中处理H5调用
@JavascriptInterface
fun openCamera(callbackId: String) {
    // 处理相机调用
    bridgeCallback.openCamera { result ->
        // 返回结果给H5
        callJsCallback(response)
    }
}
```

## 配置说明

### 权限配置
在 `package.json` 中配置所需权限：

```json
{
  "permissions": [
    "android.permission.INTERNET",
    "android.permission.CAMERA",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE"
  ]
}
```

### 功能配置
```json
{
  "features": {
    "webview": {
      "javascript_enabled": true,
      "dom_storage": true,
      "pull_to_refresh": true
    },
    "native_integration": {
      "camera": true,
      "gallery": true,
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
   - 检查WebView设置

2. **原生功能调用失败**
   - 确认权限已授予
   - 检查桥接接口实现
   - 查看日志输出

3. **构建失败**
   - 清理项目: `./gradlew clean`
   - 更新依赖: `./gradlew --refresh-dependencies`
   - 检查Gradle版本兼容性

### 调试技巧

1. **启用WebView调试**:
   ```kotlin
   if (BuildConfig.DEBUG) {
       WebView.setWebContentsDebuggingEnabled(true)
   }
   ```

2. **查看日志**:
   ```bash
   adb logcat | grep Workbench
   ```

3. **远程调试WebView**:
   - 在Chrome中访问 `chrome://inspect`
   - 选择WebView进行调试

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
