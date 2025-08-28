# 混合应用架构设计

## 🎯 架构概述

这是一个**原生 + H5**的混合应用架构，采用**飞书风格**的设计理念：

- **原生端**：负责导航入口、系统级功能、性能优化
- **H5端**：负责业务逻辑、页面路由、UI交互

## 🏗️ 架构优势

### ✅ 开发效率最大化

#### 原生端优势
- **轻量级**：只需维护导航框架，代码量少
- **性能优化**：系统级功能，启动速度快
- **原生体验**：流畅的动画和交互

#### H5端优势
- **技术栈成熟**：React + Umi + Antd Mobile
- **开发效率高**：热更新、组件复用
- **跨平台一致**：iOS/Android共用代码

### 🔄 工作流程

```
用户点击原生图标 → 打开WebView → 加载H5页面 → 使用Umi路由 → 业务逻辑处理
```

## 📱 页面路由映射

### 原生端 → H5端路由映射

| 原生功能 | 图标 | H5路由 | 页面组件 |
|----------|------|--------|----------|
| 文档 | 📄 | `/documents` | `Documents.tsx` |
| 打卡 | 📍 | `/checkin` | `Checkin.tsx` |
| 日历 | 📅 | `/calendar` | `Calendar.tsx` |
| 聊天 | 💬 | `/chat` | `Chat.tsx` |
| 任务 | ✅ | `/tasks` | `Tasks.tsx` |
| 会议 | 📹 | `/meeting` | `Meeting.tsx` |
| 云盘 | 📁 | `/drive` | `Drive.tsx` |
| 审批 | 🔖 | `/approval` | `Approval.tsx` |
| 报表 | 📊 | `/report` | `Report.tsx` |
| 人事 | 👥 | `/hr` | `HR.tsx` |
| 财务 | 💰 | `/finance` | `Finance.tsx` |
| 设置 | ⚙️ | `/settings` | `Settings.tsx` |

## 🔧 技术实现

### 1. 原生端配置

#### Android (Kotlin)
```kotlin
// FeishuStyleFragment.kt
private fun openH5Page(item: WorkbenchItem) {
    val webViewFragment = WebViewFragment.newInstance(item.url, item.name)
    parentFragmentManager.beginTransaction()
        .replace(R.id.nav_host_fragment, webViewFragment)
        .addToBackStack(null)
        .commit()
}
```

#### iOS (SwiftUI)
```swift
// FeishuStyleView.swift
private func openH5Page(_ item: WorkbenchItem) {
    let webView = WebViewManager.shared.createWebView(url: item.url, title: item.name)
    // 导航到WebView
}
```

### 2. H5端路由配置

#### Umi路由配置
```typescript
// routes.ts
export const routes: RouteConfig[] = [
  {
    path: '/documents',
    component: '@/pages/Documents/Documents',
    meta: { title: '文档', requireAuth: true }
  },
  {
    path: '/checkin',
    component: '@/pages/Checkin/Checkin',
    meta: { title: '打卡', requireAuth: true }
  },
  // ... 更多路由
]
```

#### 页面组件结构
```typescript
// Documents.tsx
const Documents: React.FC = () => {
  // 业务逻辑
  const [documents, setDocuments] = useState<Document[]>([])
  
  // 数据处理
  const handleDocumentClick = (doc: Document) => {
    // 文档操作逻辑
  }
  
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* UI组件 */}
    </div>
  )
}
```

## 🚀 开发流程

### 1. 启动开发环境

```bash
# 启动H5开发服务器
cd apps/mobile
npm run dev

# 启动原生应用
cd apps/android-native
./gradlew installDebug
```

### 2. 开发新功能

#### 步骤1：在原生端添加图标
```kotlin
WorkbenchItem(
    id = "new-feature",
    name = "新功能",
    icon = R.drawable.ic_new_feature,
    color = "#1890FF",
    url = "http://localhost:8002/new-feature"
)
```

#### 步骤2：在H5端添加路由
```typescript
{
    path: '/new-feature',
    component: '@/pages/NewFeature/NewFeature',
    meta: { title: '新功能', requireAuth: true }
}
```

#### 步骤3：创建页面组件
```typescript
// NewFeature.tsx
const NewFeature: React.FC = () => {
    return (
        <div className="p-4">
            <h1>新功能页面</h1>
        </div>
    )
}
```

### 3. 测试集成

1. **点击原生图标** → 验证WebView打开
2. **H5页面加载** → 验证路由正确
3. **功能交互** → 验证业务逻辑
4. **返回导航** → 验证返回键处理

## 📊 性能优化

### WebView优化
- **预加载**：常用页面预加载
- **缓存策略**：静态资源缓存
- **内存管理**：及时释放WebView

### H5端优化
- **代码分割**：按路由懒加载
- **图片优化**：WebP格式、懒加载
- **状态管理**：Zustand轻量级状态

## 🔄 通信机制

### 原生 → H5
```javascript
// JavaScript Bridge
window.Android.callNativeMethod('showToast', { message: '来自H5的消息' })
```

### H5 → 原生
```kotlin
// Android
@JavascriptInterface
fun getDeviceInfo(): String {
    return "Android ${Build.VERSION.RELEASE}"
}
```

## 🎨 UI设计规范

### 设计原则
- **一致性**：原生端和H5端视觉统一
- **响应式**：适配不同屏幕尺寸
- **可访问性**：支持无障碍访问

### 组件库
- **Antd Mobile**：移动端组件库
- **Tailwind CSS**：原子化CSS框架
- **自定义组件**：业务专用组件

## 📝 开发规范

### 代码规范
- **TypeScript**：类型安全
- **ESLint**：代码质量
- **Prettier**：代码格式化

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

## 🚀 部署流程

### 开发环境
```bash
# H5端
npm run dev  # 启动开发服务器

# 原生端
./gradlew assembleDebug  # 构建调试版本
```

### 生产环境
```bash
# H5端
npm run build  # 构建生产版本

# 原生端
./gradlew assembleRelease  # 构建发布版本
```

## 📞 技术支持

### 常见问题
1. **WebView白屏**：检查H5服务器是否启动
2. **路由404**：检查Umi路由配置
3. **样式异常**：检查CSS兼容性

### 调试工具
- **Chrome DevTools**：H5端调试
- **Android Studio**：原生端调试
- **vConsole**：移动端调试

---

**架构版本**: 1.0.0  
**最后更新**: 2025-01-27
