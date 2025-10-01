# 移动端H5应用嵌入使用指南

## 🎯 方案概述

我们已经成功实现了 `@mobile/` H5应用嵌入到 `@android-native/` 和 `@ios-native/` 原生应用的完整方案。

### 核心特性
- ✅ **开发环境**: 远程加载，支持热重载调试
- ✅ **生产环境**: 本地打包，无网络依赖，快速启动
- ✅ **自动化构建**: 一键构建和部署H5资源
- ✅ **原生桥接**: 完整的API调用和设备功能支持

## 📱 使用方法

### 开发环境 (推荐日常开发)

#### 1. 启动后端服务
```bash
cd apps/server
npm run dev
```

#### 2. 启动移动端H5应用 (SSR模式)
```bash
cd apps/mobile
npm run dev:ssr
```

#### 3. 运行原生应用 (开发模式)
```bash
# Android
cd apps/android-native
./run-android.sh

# iOS
cd apps/ios-native
./run-ios.sh
```

**开发模式特点**:
- Android加载: `http://10.0.2.2:3000`
- iOS加载: `http://localhost:3000`
- 支持热重载，H5代码修改实时生效
- 需要网络连接

### 生产环境 (发布版本)

#### 1. 构建并运行原生应用 (生产模式)
```bash
# Android
cd apps/android-native
./run-android.sh --release

# iOS
cd apps/ios-native
./run-ios.sh --release
```

**生产模式特点**:
- 自动构建H5资源并打包到原生应用
- 加载本地文件，无网络依赖
- 启动速度快，支持离线使用
- 包体积稍大（增加约500KB）

## 🔧 手动构建流程

### 构建H5资源

#### 1. 构建原生版本的H5应用
```bash
cd apps/mobile
npm run build:native
```

#### 2. 复制到原生应用
```bash
# 复制到Android
npm run copy:android

# 复制到iOS
npm run copy:ios

# 或者一次性构建并复制
npm run build:android  # 构建并复制到Android
npm run build:ios      # 构建并复制到iOS
```

### 构建原生应用

#### Android
```bash
cd apps/android-native

# 开发版本
./gradlew assembleDebug

# 生产版本 (会自动复制H5资源)
./gradlew assembleRelease
```

#### iOS
```bash
cd apps/ios-native

# 在Xcode中构建，或使用命令行
xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Release
```

## 📂 文件结构

### 构建产物位置

#### H5应用构建产物
```
apps/mobile/
├── dist/           # 常规构建产物 (SSR服务器使用)
└── dist-native/    # 原生应用构建产物
    ├── index.html
    ├── assets/
    │   ├── index.js
    │   ├── index.css
    │   └── ...
    ├── manifest.json
    └── service-worker.js
```

#### Android应用资源
```
apps/android-native/app/src/main/assets/www/
├── index.html
├── assets/
└── ...
```

#### iOS应用资源
```
apps/ios-native/WorkbenchApp/www/
├── index.html
├── assets/
└── ...
```

## ⚙️ 配置说明

### Vite构建配置

**原生构建特殊配置**:
```typescript
// vite.config.ts
export default defineConfig(({ command, mode }) => {
  const isNativeBuild = mode === 'native';
  
  return {
    base: isNativeBuild ? './' : '/',  // 相对路径，适配file://协议
    build: {
      outDir: isNativeBuild ? 'dist-native' : 'dist',
      sourcemap: !isNativeBuild,  // 原生构建不需要sourcemap
      // ...
    }
  };
});
```

### Android配置

**URL加载逻辑**:
```kotlin
// MainActivity.kt
private fun loadH5App() {
    val url = if (BuildConfig.DEBUG) {
        BuildConfig.H5_DEV_URL  // "http://10.0.2.2:3000"
    } else {
        if (hasLocalAssets()) {
            "file:///android_asset/www/index.html"  // 本地资源
        } else {
            BuildConfig.H5_PROD_URL  // 远程降级
        }
    }
    webView.loadUrl(url)
}
```

**自动构建任务**:
```gradle
// build.gradle
task copyH5Assets(type: Copy) {
    from '../../../mobile/dist-native'
    into 'src/main/assets/www'
}

// Release构建时自动复制H5资源
tasks.whenTaskAdded { task ->
    if (task.name == 'processReleaseAssets') {
        task.dependsOn copyH5Assets
    }
}
```

### iOS配置

**URL加载逻辑**:
```swift
// WebViewContainer.swift
private func loadH5App() {
    #if DEBUG
    let url = "http://localhost:3000"
    webViewManager.loadURL(url)
    #else
    if let bundlePath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
       let bundleUrl = URL(string: "file://\(bundlePath)") {
        webViewManager.loadFileURL(bundleUrl)
    } else {
        let url = "https://your-production-domain.com"
        webViewManager.loadURL(url)
    }
    #endif
}
```

## 🚀 性能优化

### H5应用优化

1. **资源压缩**:
   - CSS/JS自动压缩
   - 图片资源优化
   - 移除sourcemap (生产构建)

2. **代码分割**:
   ```typescript
   // vite.config.ts
   rollupOptions: {
     output: {
       manualChunks: {
         'react-vendor': ['react', 'react-dom'],
         'ui-vendor': ['clsx', 'lucide-react'],
         'store-vendor': ['zustand']
       }
     }
   }
   ```

3. **缓存策略**:
   - 文件名包含hash，支持长期缓存
   - Service Worker离线缓存

### 原生应用优化

1. **WebView配置**:
   ```kotlin
   // Android
   webView.settings.apply {
       cacheMode = WebSettings.LOAD_DEFAULT
       setAppCacheEnabled(true)
       domStorageEnabled = true
   }
   ```

2. **资源预加载**:
   - 应用启动时预加载WebView
   - 本地资源无网络延迟

## 🔍 调试指南

### 开发环境调试

1. **H5应用调试**:
   - Chrome DevTools: `chrome://inspect` (Android)
   - Safari Web Inspector (iOS)

2. **网络请求调试**:
   - 确保后端服务运行在 `localhost:3001`
   - 检查API代理配置

3. **原生桥接调试**:
   ```javascript
   // 在H5中测试原生功能
   console.log('设备信息:', await window.NativeBridge.getDeviceInfo());
   console.log('网络状态:', await window.NativeBridge.getNetworkStatus());
   ```

### 生产环境调试

1. **本地资源检查**:
   ```bash
   # Android
   adb shell ls /android_asset/www/
   
   # iOS
   # 在Xcode中检查Bundle资源
   ```

2. **WebView日志**:
   ```kotlin
   // Android
   if (BuildConfig.DEBUG) {
       WebView.setWebContentsDebuggingEnabled(true)
   }
   ```

## 🚨 常见问题

### 1. H5页面无法加载

**开发环境**:
- 检查H5开发服务器是否运行
- 确认网络连接正常
- 验证URL配置正确

**生产环境**:
- 检查本地资源是否存在
- 验证文件路径正确
- 查看WebView错误日志

### 2. API调用失败

- 确认后端服务运行正常
- 检查网络权限配置
- 验证API地址配置

### 3. 原生桥接不工作

- 检查JavaScript接口注册
- 验证方法名称匹配
- 查看原生端错误日志

### 4. 构建失败

**H5构建失败**:
- 检查依赖安装: `npm install`
- 清理缓存: `rm -rf node_modules/.vite`

**原生构建失败**:
- Android: `./gradlew clean`
- iOS: 清理Xcode项目

## 📊 方案对比

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| 加载方式 | 远程HTTP | 本地文件 |
| 启动速度 | 慢 (网络请求) | 快 (本地加载) |
| 网络依赖 | 需要 | 无需 |
| 热重载 | 支持 | 不支持 |
| 调试便利性 | 高 | 中 |
| 离线能力 | 无 | 完全支持 |
| 包体积 | 小 | 稍大 (+500KB) |

## 🎯 最佳实践

1. **开发阶段**: 使用开发模式，享受热重载和快速调试
2. **测试阶段**: 使用生产模式，验证离线功能和性能
3. **发布前**: 确保生产构建正常，测试所有功能
4. **版本管理**: H5资源版本与原生应用版本保持同步

## 🔄 更新策略

### 当前方案 (静态打包)
- H5更新需要重新发布原生应用
- 适合功能稳定的应用

### 未来扩展 (热更新)
- 可以实现H5资源的动态更新
- 保持快速启动 + 灵活更新
- 需要额外的更新检查机制

---

通过这个完整的嵌入方案，我们实现了：
- 🚀 **开发效率**: 开发环境热重载，调试便利
- ⚡ **用户体验**: 生产环境快速启动，离线可用
- 🔧 **维护性**: 自动化构建，一键部署
- 📱 **兼容性**: 同时支持Android和iOS平台
