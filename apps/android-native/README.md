# Android 原生应用 - 飞书风格工作台

## 🎯 项目概述

这是一个Android原生应用，模仿飞书的移动端界面设计，提供工作台功能，点击功能图标后渲染H5移动端内容。

## 🏗️ 架构设计

### 核心组件

1. **FeishuStyleFragment** - 飞书风格的主界面
   - 4x3 网格布局的功能图标
   - 支持未读消息数量显示
   - 新功能标识
   - 最近使用记录

2. **WorkbenchGridAdapter** - 工作台网格适配器
   - 支持点击事件处理
   - 动态颜色配置
   - 徽章显示

3. **WebViewFragment** - H5内容渲染
   - 完整的WebView配置
   - 进度条显示
   - 返回键处理

### 功能模块

| 功能 | 图标 | 颜色 | H5页面 |
|------|------|------|--------|
| 文档 | 📄 | 蓝色 | `/documents` |
| 打卡 | 📍 | 绿色 | `/checkin` |
| 日历 | 📅 | 紫色 | `/calendar` |
| 聊天 | 💬 | 橙色 | `/chat` |
| 任务 | ✅ | 红色 | `/tasks` |
| 会议 | 📹 | 青色 | `/meeting` |
| 云盘 | 📁 | 靛蓝 | `/drive` |
| 审批 | 🔖 | 粉色 | `/approval` |
| 报表 | 📊 | 棕色 | `/report` |
| 人事 | 👥 | 薄荷绿 | `/hr` |
| 财务 | 💰 | 紫色 | `/finance` |
| 设置 | ⚙️ | 灰色 | `/settings` |

## 🚀 快速开始

### 环境要求

- Android Studio Arctic Fox 或更高版本
- Android SDK 21+
- Kotlin 1.8.10+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd apps/android-native
   ```

2. **配置环境变量**
   ```bash
   # 在 app/src/main/assets/config.properties 中配置
   H5_DEV_URL=http://localhost:8002
   H5_PROD_URL=https://your-production-domain.com
   ```

3. **构建运行**
   ```bash
   ./gradlew assembleDebug
   ./gradlew installDebug
   ```

## 📱 界面预览

### 主界面
- 顶部：工作台标题和副标题
- 中部：4x3 功能图标网格
- 底部：最近使用列表

### 功能特性
- ✅ 响应式网格布局
- ✅ 动态颜色主题
- ✅ 未读消息徽章
- ✅ 新功能标识
- ✅ 点击反馈动画
- ✅ WebView H5渲染

## 🔧 配置说明

### H5页面URL配置

在 `FeishuStyleFragment.kt` 中配置各功能的H5页面URL：

```kotlin
WorkbenchItem(
    id = "documents",
    name = "文档",
    icon = R.drawable.ic_documents,
    color = "#1890FF",
    url = "http://localhost:8002/documents"  // 配置H5页面URL
)
```

### 开发环境配置

```kotlin
// 开发环境
val devUrls = mapOf(
    "documents" to "http://10.0.2.2:8002/documents",
    "checkin" to "http://10.0.2.2:8002/checkin"
)

// 生产环境
val prodUrls = mapOf(
    "documents" to "https://your-domain.com/documents",
    "checkin" to "https://your-domain.com/checkin"
)
```

## 🎨 自定义样式

### 颜色主题

在 `colors.xml` 中定义颜色：

```xml
<resources>
    <color name="workbench_blue">#1890FF</color>
    <color name="workbench_green">#52C41A</color>
    <color name="workbench_purple">#722ED1</color>
    <!-- 更多颜色... -->
</resources>
```

### 图标资源

将图标文件放置在 `res/drawable/` 目录下：
- `ic_documents.xml`
- `ic_checkin.xml`
- `ic_calendar.xml`
- 等等...

## 🔄 与H5集成

### WebView配置

```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    allowFileAccess = true
    // 更多配置...
}
```

### JavaScript Bridge

```kotlin
// 注册JavaScript接口
webView.addJavascriptInterface(WebViewBridge(), "Android")

class WebViewBridge {
    @JavascriptInterface
    fun getDeviceInfo(): String {
        return "Android ${Build.VERSION.RELEASE}"
    }
}
```

## 📊 性能优化

### 内存管理
- WebView复用机制
- 图片资源优化
- 列表视图回收

### 网络优化
- 请求缓存
- 图片懒加载
- 预加载机制

## 🧪 测试

### 单元测试
```bash
./gradlew test
```

### UI测试
```bash
./gradlew connectedAndroidTest
```

### 功能测试
- 点击功能图标测试
- WebView加载测试
- 返回键处理测试

## 📝 开发规范

### 代码风格
- 遵循Kotlin官方编码规范
- 使用Kotlin DSL构建脚本
- 统一的命名规范

### 提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 🚀 部署

### 构建Release版本
```bash
./gradlew assembleRelease
```

### 生成APK
```bash
./gradlew bundleRelease
```

## 📞 技术支持

如有问题，请查看：
- [项目文档](../docs/)
- [常见问题](../docs/faq.md)
- [API文档](../docs/api.md)

---

**版本**: 1.0.0  
**最后更新**: 2025-01-27
