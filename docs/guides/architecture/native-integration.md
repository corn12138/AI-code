# 原生应用集成指南

本文档介绍如何将H5移动应用无缝集成到Android和iOS原生应用中，实现混合开发架构。

## 架构概述

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │    │   iOS App       │    │   H5 Mobile     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ WebView     │ │    │ │ WKWebView   │ │    │ │ React/UMI   │ │
│ │ Container   │ │    │ │ Container   │ │    │ │ Application │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Native      │ │    │ │ Native      │ │    │ │ Native      │ │
│ │ Bridge      │ │◄──►│ │ Bridge      │ │◄──►│ │ Bridge      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 核心组件

### 1. WebView容器
- **Android**: 自定义WebView，支持下拉刷新、进度条等
- **iOS**: WKWebView，高性能Web内容渲染
- **功能**: JavaScript启用、DOM存储、文件访问等

### 2. 原生桥接
- **Android**: JavaScriptInterface注解方法
- **iOS**: WKScriptMessageHandler协议
- **功能**: 设备信息、相机、存储、网络状态等

### 3. H5桥接工具
- **统一接口**: 跨平台原生功能调用
- **自动检测**: 平台环境自动识别
- **降级处理**: Web环境功能降级

## 快速开始

### 1. 配置H5应用

在H5应用中安装原生桥接工具：

```bash
# 在mobile项目中
npm install @shared/native-bridge
```

### 2. 配置原生应用

#### Android配置

```kotlin
// 在MainActivity中
class MainActivity : AppCompatActivity() {
    private lateinit var customWebView: CustomWebView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        customWebView = findViewById(R.id.webview)
        
        // 设置桥接回调
        customWebView.setBridgeCallback(object : WebViewBridge.BridgeCallback {
            override fun getNetworkStatus(): NetworkInfo {
                return NetworkInfo(true, "wifi", 80)
            }
            
            override fun openCamera(callback: (Result<String>) -> Unit) {
                // 实现相机调用
            }
            
            // 其他回调实现...
        })
        
        // 加载H5应用
        customWebView.loadH5Url("http://localhost:8002")
    }
}
```

#### iOS配置

```swift
// 在WebViewController中
class WebViewController: UIViewController {
    private var webView: WKWebView!
    private var webViewBridge: WebViewBridge!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        setupBridge()
        loadH5App()
    }
    
    private func setupBridge() {
        webViewBridge = WebViewBridge(
            webView: webView,
            viewController: self,
            bridgeCallback: self
        )
    }
    
    private func loadH5App() {
        let url = URL(string: "http://localhost:8002")!
        webView.load(URLRequest(url: url))
    }
}

extension WebViewController: BridgeCallback {
    func getNetworkStatus() -> NetworkInfo {
        return NetworkInfo(isConnected: true, type: "wifi", strength: 80)
    }
    
    func openCamera(completion: @escaping (Result<String, Error>) -> Void) {
        // 实现相机调用
    }
    
    // 其他回调实现...
}
```

### 3. H5端调用

```typescript
import { nativeBridge } from '@/utils/nativeBridge';

// 获取设备信息
const deviceInfo = await nativeBridge.getDeviceInfo();
console.log('设备信息:', deviceInfo);

// 调用相机
try {
    const imagePath = await nativeBridge.openCamera();
    console.log('拍照成功:', imagePath);
} catch (error) {
    console.error('拍照失败:', error);
}

// 选择图片
const imagePaths = await nativeBridge.pickImage(3);
console.log('选择图片:', imagePaths);

// 显示Toast
await nativeBridge.showToast('操作成功');

// 存储数据
await nativeBridge.setStorage('user_token', 'abc123');
const token = await nativeBridge.getStorage('user_token');
```

## 功能接口

### 设备信息

```typescript
interface DeviceInfo {
  platform: 'android' | 'ios' | 'web';
  version: string;
  model: string;
  brand: string;
  screenWidth: number;
  screenHeight: number;
  density: number;
}

// 获取设备信息
const deviceInfo = await nativeBridge.getDeviceInfo();
```

### 网络状态

```typescript
interface NetworkInfo {
  isConnected: boolean;
  type: string;
  strength: number;
}

// 获取网络状态
const networkInfo = await nativeBridge.getNetworkStatus();
```

### 相机功能

```typescript
// 调用相机拍照
const imagePath = await nativeBridge.openCamera();

// 选择图片
const imagePaths = await nativeBridge.pickImage(maxCount);
```

### 存储功能

```typescript
// 设置存储
await nativeBridge.setStorage(key, value);

// 获取存储
const value = await nativeBridge.getStorage(key);
```

### Toast消息

```typescript
// 显示Toast
await nativeBridge.showToast(message, duration);
```

## 环境检测

### 平台检测

```typescript
// 检查是否在原生环境中
const isNative = nativeBridge.isNativeEnvironment();

// 获取当前平台
const platform = nativeBridge.getPlatform(); // 'android' | 'ios' | 'web'
```

### 功能可用性检测

```typescript
// 检查相机功能是否可用
const canUseCamera = nativeBridge.isNativeEnvironment();

// 检查存储功能是否可用
const canUseStorage = true; // 原生和Web都支持
```

## 错误处理

### 原生功能不可用

```typescript
try {
    const imagePath = await nativeBridge.openCamera();
} catch (error) {
    if (error.message.includes('Web环境不支持')) {
        // 降级到Web实现
        console.log('使用Web相机功能');
    } else {
        // 其他错误处理
        console.error('相机调用失败:', error);
    }
}
```

### 网络错误

```typescript
try {
    const networkInfo = await nativeBridge.getNetworkStatus();
} catch (error) {
    // 使用默认网络状态
    const fallbackNetworkInfo = {
        isConnected: navigator.onLine,
        type: 'unknown',
        strength: 0
    };
}
```

## 性能优化

### WebView优化

#### Android
```kotlin
webView.settings.apply {
    // 启用硬件加速
    setLayerType(View.LAYER_TYPE_HARDWARE, null)
    
    // 启用缓存
    cacheMode = WebSettings.LOAD_DEFAULT
    domStorageEnabled = true
    databaseEnabled = true
    
    // 优化渲染
    setRenderPriority(WebSettings.RenderPriority.HIGH)
}
```

#### iOS
```swift
let configuration = WKWebViewConfiguration()
configuration.allowsInlineMediaPlayback = true
configuration.mediaTypesRequiringUserActionForPlayback = []

webView = WKWebView(frame: .zero, configuration: configuration)
webView.allowsBackForwardNavigationGestures = true
```

### 内存管理

```typescript
// H5端内存优化
class NativeBridgeManager {
    private callbacks = new Map<string, Function>();
    
    // 清理过期回调
    private cleanupCallbacks() {
        const now = Date.now();
        for (const [id, callback] of this.callbacks) {
            if (now - parseInt(id.split('_')[1]) > 30000) {
                this.callbacks.delete(id);
            }
        }
    }
}
```

## 测试策略

### 单元测试

```typescript
// H5端测试
describe('NativeBridge', () => {
    it('should detect platform correctly', () => {
        expect(nativeBridge.getPlatform()).toBe('web');
    });
    
    it('should handle native calls', async () => {
        const deviceInfo = await nativeBridge.getDeviceInfo();
        expect(deviceInfo.platform).toBe('web');
    });
});
```

### 集成测试

```kotlin
// Android端测试
@Test
fun testWebViewBridge() {
    val bridge = WebViewBridge(context, webView, callback)
    val deviceInfo = bridge.getDeviceInfo()
    assertNotNull(deviceInfo)
}
```

### E2E测试

```typescript
// 端到端测试
describe('Native Integration', () => {
    it('should work in native environment', async () => {
        // 模拟原生环境
        mockNativeEnvironment();
        
        const deviceInfo = await nativeBridge.getDeviceInfo();
        expect(deviceInfo.platform).toBe('ios');
    });
});
```

## 部署配置

### Android配置

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.workbench"
        minSdk 21
        targetSdk 34
    }
    
    buildTypes {
        debug {
            buildConfigField "String", "H5_URL", "\"http://10.0.2.2:8002\""
        }
        release {
            buildConfigField "String", "H5_URL", "\"https://your-domain.com\""
        }
    }
}
```

### iOS配置

```swift
// 在Info.plist中配置
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<key>NSCameraUsageDescription</key>
<string>需要访问相机进行拍照</string>
```

### H5配置

```typescript
// 环境配置
const config = {
    development: {
        h5Url: 'http://localhost:8002',
        apiUrl: 'http://localhost:3000'
    },
    production: {
        h5Url: 'https://your-domain.com',
        apiUrl: 'https://api.your-domain.com'
    }
};
```

## 故障排除

### 常见问题

1. **H5页面无法加载**
   - 检查网络连接
   - 确认URL配置正确
   - 检查WebView设置

2. **原生功能调用失败**
   - 确认权限已授予
   - 检查桥接接口实现
   - 查看日志输出

3. **跨域问题**
   - 配置CORS策略
   - 使用代理服务器
   - 配置WebView允许跨域

### 调试技巧

1. **WebView调试**
   ```bash
   # Android
   adb shell setprop debug.webview.enable true
   
   # iOS
   # 在Safari开发者工具中调试
   ```

2. **日志查看**
   ```bash
   # Android
   adb logcat | grep Workbench
   
   # iOS
   # 在Xcode控制台查看
   ```

3. **网络调试**
   ```bash
   # 使用Charles或Fiddler抓包
   # 检查网络请求和响应
   ```

## 最佳实践

### 1. 渐进式增强
- 优先使用Web标准API
- 原生功能作为增强
- 提供降级方案

### 2. 性能优化
- 延迟加载非关键功能
- 缓存静态资源
- 优化图片加载

### 3. 用户体验
- 提供加载指示器
- 处理网络错误
- 支持离线功能

### 4. 安全性
- 验证原生调用
- 加密敏感数据
- 防止XSS攻击

## 版本管理

### 版本兼容性

```json
{
  "nativeBridge": {
    "version": "1.0.0",
    "minAndroidVersion": "21",
    "minIOSVersion": "13.0",
    "supportedFeatures": [
      "deviceInfo",
      "camera",
      "storage",
      "network"
    ]
  }
}
```

### 升级策略

1. **向后兼容**: 保持API兼容性
2. **功能检测**: 运行时检测功能可用性
3. **渐进升级**: 分阶段升级功能

## 总结

通过本文档的指导，您可以成功实现H5应用与原生应用的无缝集成。关键要点：

1. **统一接口**: 使用统一的桥接接口
2. **环境检测**: 自动检测运行环境
3. **错误处理**: 完善的错误处理机制
4. **性能优化**: 持续的性能优化
5. **测试覆盖**: 全面的测试策略

这种混合开发架构既保持了H5的灵活性，又充分利用了原生功能的优势，为用户提供最佳的使用体验。
