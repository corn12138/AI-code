# 移动端H5应用嵌入原生应用策略

## 📋 当前状态分析

### 现有配置
- **@mobile/**: SSR应用，运行在 `http://localhost:3000` (开发) / `http://10.0.2.2:3000` (Android模拟器)
- **@android-native/**: 通过WebView加载 `http://10.0.2.2:3000`
- **@ios-native/**: 通过WKWebView加载 `http://localhost:3000`

### 问题分析
1. **开发环境依赖**: 原生应用依赖本地开发服务器运行
2. **网络依赖**: 需要网络连接才能正常使用
3. **离线能力**: 无法离线使用
4. **性能问题**: 每次启动都需要网络请求
5. **部署复杂**: 生产环境需要额外的H5服务器

## 🎯 嵌入方案对比

### 方案一：远程加载 (当前方案)
```
原生应用 → WebView → HTTP请求 → H5服务器 → 返回页面
```

**优点**:
- 开发简单，H5应用独立部署
- 支持热更新，无需重新发布原生应用
- H5应用可以独立维护和更新

**缺点**:
- 依赖网络连接
- 首次加载慢
- 无法离线使用
- 需要维护额外的H5服务器

### 方案二：本地打包 (推荐)
```
原生应用 → WebView → 本地文件系统 → H5静态文件
```

**优点**:
- 无网络依赖，启动快
- 支持离线使用
- 减少服务器成本
- 更好的用户体验

**缺点**:
- 更新需要重新发布原生应用
- 包体积增大
- 开发调试相对复杂

### 方案三：混合方案 (最佳实践)
```
开发环境: 远程加载 (方便调试)
生产环境: 本地打包 + 远程更新检查
```

## 🚀 推荐实施方案

### 开发环境配置

#### Android开发环境
```kotlin
// MainActivity.kt
private fun getH5Url(): String {
    return if (BuildConfig.DEBUG) {
        // 开发环境：加载本地开发服务器
        BuildConfig.H5_DEV_URL // "http://10.0.2.2:3000"
    } else {
        // 生产环境：加载本地打包文件
        "file:///android_asset/www/index.html"
    }
}
```

#### iOS开发环境
```swift
// WebViewContainer.swift
private func getH5Url() -> String {
    #if DEBUG
    // 开发环境：加载本地开发服务器
    return "http://localhost:3000"
    #else
    // 生产环境：加载本地打包文件
    if let path = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www") {
        return "file://\(path)"
    }
    return "about:blank"
    #endif
}
```

### 生产环境配置

#### 1. H5应用构建优化

**package.json 脚本增强**:
```json
{
  "scripts": {
    "build:native": "vite build --base='./' --outDir=dist-native",
    "build:android": "npm run build:native && npm run copy:android",
    "build:ios": "npm run build:native && npm run copy:ios",
    "copy:android": "cp -r dist-native/* ../android-native/app/src/main/assets/www/",
    "copy:ios": "cp -r dist-native/* ../ios-native/WorkbenchApp/www/"
  }
}
```

**vite.config.ts 原生构建配置**:
```typescript
export default defineConfig(({ command, mode }) => {
  const isNativeBuild = mode === 'native';
  
  return {
    plugins: [react(), tsconfigPaths()],
    base: isNativeBuild ? './' : '/',
    build: {
      outDir: isNativeBuild ? 'dist-native' : 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          // 确保文件名稳定，便于原生应用缓存
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    }
  };
});
```

#### 2. Android集成配置

**build.gradle 增强**:
```gradle
android {
    sourceSets {
        main {
            assets.srcDirs = ['src/main/assets']
        }
    }
}

// 添加构建任务
task copyH5Assets(type: Copy) {
    from '../../../mobile/dist-native'
    into 'src/main/assets/www'
}

// 构建前自动复制H5资源
preBuild.dependsOn copyH5Assets
```

**assets目录结构**:
```
app/src/main/assets/www/
├── index.html
├── assets/
│   ├── index.js
│   ├── index.css
│   └── ...
└── ...
```

#### 3. iOS集成配置

**Xcode Build Phase**:
```bash
# 添加Run Script Phase
#!/bin/bash
cd "${SRCROOT}/../../../mobile"
npm run build:native
cp -r dist-native/* "${SRCROOT}/WorkbenchApp/www/"
```

**Bundle资源结构**:
```
WorkbenchApp.app/www/
├── index.html
├── assets/
│   ├── index.js
│   ├── index.css
│   └── ...
└── ...
```

## 🔧 实施步骤

### 第一阶段：构建系统优化

1. **修改@mobile/构建配置**
2. **添加原生构建脚本**
3. **创建资源复制任务**

### 第二阶段：原生应用集成

1. **Android资源集成**
2. **iOS Bundle资源集成**
3. **URL加载逻辑优化**

### 第三阶段：开发体验优化

1. **开发环境热重载**
2. **生产环境资源更新**
3. **错误处理和降级**

## 📱 具体实现代码

### Android实现

**WebViewManager.kt 增强**:
```kotlin
class WebViewManager(
    private val context: Context,
    private val webView: CustomWebView,
    private val webViewBridge: WebViewBridge
) {
    
    fun loadH5App() {
        val url = if (BuildConfig.DEBUG) {
            // 开发环境：远程加载
            BuildConfig.H5_DEV_URL
        } else {
            // 生产环境：本地加载
            "file:///android_asset/www/index.html"
        }
        
        Logger.d("WebViewManager", "Loading H5 app from: $url")
        webView.loadUrl(url)
    }
    
    // 检查本地资源是否存在
    private fun hasLocalAssets(): Boolean {
        return try {
            context.assets.open("www/index.html").use { true }
        } catch (e: Exception) {
            false
        }
    }
}
```

### iOS实现

**WebViewManager.swift 增强**:
```swift
class WebViewManager: NSObject, ObservableObject {
    
    func loadH5App() {
        let url: String
        
        #if DEBUG
        // 开发环境：远程加载
        url = "http://localhost:3000"
        #else
        // 生产环境：本地加载
        if let bundlePath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
           let bundleUrl = URL(string: "file://\(bundlePath)") {
            webView?.loadFileURL(bundleUrl, allowingReadAccessTo: bundleUrl.deletingLastPathComponent())
            return
        } else {
            // 降级到远程加载
            url = "https://your-production-domain.com"
        }
        #endif
        
        if let webUrl = URL(string: url) {
            webView?.load(URLRequest(url: webUrl))
        }
    }
}
```

## 🔄 热更新方案 (高级)

### 方案概述
结合本地打包和远程更新的优势：
1. 应用启动时加载本地资源（快速启动）
2. 后台检查远程版本更新
3. 下载新版本到本地缓存
4. 下次启动时使用新版本

### 实现思路
```
启动应用 → 加载本地资源 → 后台检查更新 → 下载新版本 → 下次启动使用
```

## 📊 性能对比

| 方案 | 启动速度 | 离线能力 | 更新灵活性 | 开发复杂度 | 维护成本 |
|------|----------|----------|------------|------------|----------|
| 远程加载 | 慢 | 无 | 高 | 低 | 高 |
| 本地打包 | 快 | 完全 | 低 | 中 | 低 |
| 混合方案 | 快 | 完全 | 高 | 高 | 中 |

## 🎯 推荐方案

**立即实施**: 本地打包方案
- 优化用户体验
- 减少网络依赖
- 简化部署架构

**未来扩展**: 混合方案 + 热更新
- 保持快速启动
- 支持灵活更新
- 最佳用户体验
