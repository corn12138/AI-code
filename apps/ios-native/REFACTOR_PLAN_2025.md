# iOS 原生项目重构计划（2025）

**文档日期**：2025年10月17日  
**项目**：WorkbenchApp iOS 原生应用  
**状态**：规划中

---

## 📊 一、现状评估

### 1.1 项目概览
- **项目名称**：WorkbenchApp（AI技术文章阅读应用）
- **技术栈**：Swift + SwiftUI + WebKit
- **部署目标**：iOS 14.0+
- **代码行数**：~1500+ 行（不含WebView和API代码）
- **主要功能**：
  - H5 WebView 容器
  - 技术文章浏览
  - 搜索功能
  - 分类筛选
  - 网络监控

### 1.2 当前架构
```
WorkbenchApp
├── App/
│   └── WorkbenchApp.swift (AppDelegate + App Entry)
├── Views/
│   ├── ContentView.swift
│   ├── DocumentBrowserView.swift
│   ├── FeishuStyleView.swift
│   └── TestWorkbenchView.swift
├── WebView/
│   ├── WebViewManager.swift
│   ├── AdvancedWebViewManager.swift
│   ├── WebViewRepresentable.swift
│   └── AdvancedWebViewRepresentable.swift
├── ViewModels/
│   └── DocumentBrowserViewModel.swift
├── Network/
│   └── APIService.swift
├── Utils/
│   ├── NetworkMonitor.swift
│   └── CompatibilityHelper.swift
└── Resources/
    └── Assets.xcassets
```

### 1.3 历史重构情况
- ✅ 已完成：编译错误修复（2025年10月4日）
- ✅ 已完成：iOS 版本兼容性修复
- ✅ 已完成：应用入口点统一
- ⚠️ 待改进：架构设计和代码质量

---

## 🔍 二、问题诊断

### 2.1 架构设计问题

#### 问题 1：WebView 管理混乱
**现象**：
- 存在两个 WebView Manager：`WebViewManager` 和 `AdvancedWebViewManager`
- 两个对应的 Representable 实现
- 代码重复，职责不清

**影响**：
- 难以维护和扩展
- 容易引入 bug
- 开发效率低

**根本原因**：
- 缺少 Code Review 规范
- 没有统一的架构决策

#### 问题 2：视图层职责过重
**现象**：
- `DocumentBrowserView` 文件超过 400 行
- 混合了 UI、业务逻辑、数据处理
- 多个 @State 和 @StateObject 混乱

**影响**：
- 难以理解代码流程
- UI 修改容易破坏业务逻辑
- 测试困难

**根本原因**：
- 没有采用 Container/Presentational 组件模式
- MVVM 实施不彻底

#### 问题 3：错误处理缺失
**现象**：
- APIService 中缺少完整的错误处理
- 网络失败时自动降级到模拟数据
- 没有用户提示机制

**影响**：
- 用户体验差
- 难以排查问题
- 隐藏真实错误

#### 问题 4：没有依赖注入
**现象**：
- APIService 使用 singleton
- WebViewManager 通过 @StateObject 创建
- 难以单元测试

**影响**：
- 无法 Mock 依赖
- 单元测试困难
- 代码耦合度高

### 2.2 代码质量问题

#### 问题 5：缺少网络超时处理
**现象**：
```swift
request.timeoutInterval = 10.0  // 只在 APIService 中设置
```
- 没有重试机制
- 没有超时提示

#### 问题 6：内存泄漏风险
**现象**：
- WebView 的观察者手动移除（✓ 正确）
- 但 Combine 订阅可能泄漏
- 没有 weak self 保护

#### 问题 7：性能优化缺失
**现象**：
- 没有图片缓存
- 没有列表虚拟化
- 没有性能监控

#### 问题 8：测试覆盖不足
**现象**：
- 只有骨架测试文件
- 没有单元测试
- 没有 UI 测试

### 2.3 开发工程化问题

#### 问题 9：配置管理混乱
**现象**：
```swift
private let baseURL = "http://192.168.1.3:3001/api"  // 硬编码
```
- API 地址硬编码
- 没有环境配置
- 难以切换环境

#### 问题 10：缺少日志和监控
**现象**：
- 没有统一的日志系统
- 没有崩溃日志收集
- 没有性能监控

---

## 🎯 三、重构目标

### 3.1 功能目标
- ✅ 维持现有所有功能
- ✅ 改进用户体验
- ✅ 提升代码可维护性

### 3.2 技术目标
- ✅ 统一 WebView 实现
- ✅ 完善 MVVM 架构
- ✅ 实现依赖注入
- ✅ 完善错误处理
- ✅ 达到 >70% 单元测试覆盖率
- ✅ 实现配置管理

### 3.3 指标目标

| 指标 | 当前 | 目标 |
|------|------|------|
| 代码行数 (views) | 1500+ | <1000 |
| 最大单文件行数 | 533 | <300 |
| 单元测试覆盖率 | ~0% | >70% |
| 编译时间 | - | <30s |
| 崩溃率 | - | 0% |

---

## 🔧 四、重构方案

### 4.1 第一阶段：架构优化（1 周）

#### 4.1.1 统一 WebView 管理

**目标**：合并两个 WebView Manager 为一个统一实现

**步骤**：

1. **创建 `WebViewService` 协议**
```swift
protocol WebViewService {
    var isLoading: AnyPublisher<Bool, Never> { get }
    var progress: AnyPublisher<Double, Never> { get }
    var canGoBack: AnyPublisher<Bool, Never> { get }
    
    func loadURL(_ url: URL)
    func loadHTMLString(_ html: String)
    func reload()
    func goBack()
    func evaluateJavaScript(_ script: String) -> AnyPublisher<Any?, Error>
}
```

2. **创建统一的 `DefaultWebViewManager` 实现**
   - 合并 `WebViewManager` 和 `AdvancedWebViewManager` 的所有功能
   - 使用 Combine 替代 KVO
   - 添加内存管理文档

3. **删除旧的实现**
   - 删除 `WebViewManager.swift`
   - 删除 `AdvancedWebViewManager.swift`
   - 更新所有引用

4. **统一 Representable**
   - 创建 `WebViewRepresentable.swift` 作为唯一入口
   - 删除 `AdvancedWebViewRepresentable.swift`

**预期成果**：
- 代码行数减少 40%
- 消除代码重复
- 改善可维护性

---

#### 4.1.2 分解大型视图

**目标**：将 400+ 行的 `DocumentBrowserView` 分解为多个小组件

**步骤**：

1. **创建容器组件结构**
```swift
// DocumentBrowserView (主容器) - 100-150 行
// ├── SearchBar (搜索栏) - 50 行
// ├── CategoryTabs (分类标签) - 50 行
// ├── DocumentList (文档列表) - 80 行
// │   └── DocumentCard (文档卡片) - 50 行
// └── SearchSheet (搜索弹层) - 150 行
```

2. **提取公共组件**
   - `SearchBar.swift`
   - `CategoryTabs.swift`
   - `DocumentCard.swift`
   - `LoadingView.swift`
   - `ErrorView.swift`

3. **优化 ViewModel**
   - 分离搜索逻辑
   - 提供清晰的 API
   - 移除 UI 相关代码

**预期成果**：
- 单文件最大行数 <250 行
- 提高组件复用性
- 改善代码可读性

---

### 4.2 第二阶段：依赖注入 & 错误处理（1.5 周）

#### 4.2.1 实现依赖注入

**目标**：解耦组件，提高可测试性

**步骤**：

1. **创建 Container 类**
```swift
class AppContainer {
    let apiService: APIService
    let webViewManager: WebViewService
    let networkMonitor: NetworkMonitor
    
    static let shared = AppContainer()
    
    private init() {
        // 初始化所有依赖
    }
}
```

2. **改造 APIService**
```swift
protocol APIServiceProtocol {
    func getDocs(params: QueryParams) -> AnyPublisher<PaginatedResult<MobileDoc>, Error>
    func getDoc(id: String) -> AnyPublisher<MobileDoc, Error>
    func searchDocs(query: String, params: QueryParams) -> AnyPublisher<PaginatedResult<MobileDoc>, Error>
}
```

3. **注入到 ViewModel**
```swift
class DocumentBrowserViewModel: ObservableObject {
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = AppContainer.shared.apiService) {
        self.apiService = apiService
    }
}
```

**预期成果**：
- 所有类都可注入依赖
- 便于单元测试
- 代码耦合度降低

---

#### 4.2.2 完善错误处理

**目标**：统一的错误处理和用户提示机制

**步骤**：

1. **定义错误类型**
```swift
enum AppError: LocalizedError {
    case network(NetworkError)
    case parsing(ParsingError)
    case validation(String)
    case unknown(Error)
    
    var errorDescription: String? { ... }
    var recoverySuggestion: String? { ... }
}
```

2. **创建错误处理中间件**
```swift
class ErrorHandler {
    func handle(_ error: Error) -> UserFacingError
    func retry<T>(_ operation: @escaping () -> AnyPublisher<T, Error>) -> AnyPublisher<T, Error>
}
```

3. **在 ViewModel 中实现错误处理**
```swift
@Published var error: UserFacingError?

private func loadDocuments() {
    apiService.getDocs(params: params)
        .mapError { AppError($0) }
        .catch { [weak self] error in
            self?.error = UserFacingError(from: error)
            return Empty()
        }
        .assign(to: &$documents)
}
```

4. **创建错误展示 UI**
```swift
struct ErrorView: View {
    let error: UserFacingError
    let onRetry: () -> Void
    
    var body: some View { ... }
}
```

**预期成果**：
- 用户可见的错误提示
- 自动重试机制
- 改善用户体验

---

### 4.3 第三阶段：配置管理 & 监控（1 周）

#### 4.3.1 配置管理系统

**目标**：支持多环境配置，消除硬编码

**步骤**：

1. **创建配置文件**
```
Config/
├── Development.xcconfig
├── Staging.xcconfig
└── Production.xcconfig
```

2. **创建 Configuration 结构体**
```swift
struct AppConfiguration {
    let apiBaseURL: URL
    let webViewBaseURL: URL
    let environment: Environment
    let logLevel: LogLevel
    
    static let current = AppConfiguration.load()
}
```

3. **使用 Build Configuration**
   - 在 Xcode 中配置不同的 Build Configuration
   - 动态加载对应的配置文件

**预期成果**：
- 支持多环境切换
- 消除硬编码
- 便于部署

---

#### 4.3.2 日志和监控系统

**目标**：统一的日志系统，便于排查问题

**步骤**：

1. **创建 Logger**
```swift
protocol Logger {
    func debug(_ message: String, file: String, function: String, line: Int)
    func info(_ message: String)
    func warning(_ message: String)
    func error(_ message: String, error: Error?)
}
```

2. **实现日志收集**
   - 本地文件存储
   - 远程上传（可选）
   - 日志轮转

3. **添加性能监控**
```swift
struct PerformanceMonitor {
    static func track<T>(_ name: String, _ operation: () -> T) -> T
}
```

**预期成果**：
- 更好的错误诊断
- 性能瓶颈识别
- 用户问题追踪

---

### 4.4 第四阶段：测试和优化（2 周）

#### 4.4.1 单元测试

**目标**：>70% 的代码覆盖率

**覆盖的主要模块**：
- ✅ APIService（模拟网络）
- ✅ DocumentBrowserViewModel（业务逻辑）
- ✅ AppConfiguration（配置）
- ✅ WebViewService（WebView 功能）
- ✅ ErrorHandler（错误处理）

**创建测试文件**：
```
Tests/
├── APIServiceTests.swift
├── ViewModelTests.swift
├── ConfigurationTests.swift
├── WebViewServiceTests.swift
└── ErrorHandlerTests.swift
```

**示例测试**：
```swift
class APIServiceTests: XCTestCase {
    var sut: APIService!
    var mockURLSession: MockURLSession!
    
    func testGetDocs_Success() {
        // Given
        let expected = createMockDocs()
        mockURLSession.data = try! JSONEncoder().encode(expected)
        
        // When
        let result = sut.getDocs(params: QueryParams(...))
        
        // Then
        XCTAssertEqual(result, expected)
    }
}
```

#### 4.4.2 性能优化

**优化项**：
1. **图片缓存**
   - 集成 SDWebImageSwiftUI 或 Kingfisher
   - 实现两级缓存

2. **列表优化**
   - 实现虚拟滚动（LazyStack）
   - 分页加载

3. **WebView 优化**
   - 启用网页缓存
   - 预加载策略
   - 内存监控

---

### 4.5 第五阶段：文档和规范（1 周）

#### 4.5.1 代码规范

创建 `CODING_STANDARDS.md`：
- 命名规范
- 文件组织
- 代码注释要求
- MVVM 实施指南

#### 4.5.2 架构文档

创建 `ARCHITECTURE.md`：
- 整体架构图
- 各模块职责
- 数据流向
- 扩展指南

#### 4.5.3 API 文档

创建 `API_GUIDE.md`：
- WebViewService 使用指南
- APIService 使用指南
- 错误处理指南

---

## 📈 五、实施计划

### 时间表（6 周）

| 阶段 | 任务 | 时间 | 优先级 |
|------|------|------|--------|
| 1 | WebView 统一 | 3 天 | 🔴 高 |
| 1 | 视图分解 | 3 天 | 🔴 高 |
| 2 | 依赖注入 | 4 天 | 🟠 中 |
| 2 | 错误处理 | 3 天 | 🔴 高 |
| 3 | 配置管理 | 2 天 | 🟡 低 |
| 3 | 日志监控 | 3 天 | 🟠 中 |
| 4 | 单元测试 | 5 天 | 🔴 高 |
| 4 | 性能优化 | 3 天 | 🟠 中 |
| 5 | 文档编写 | 3 天 | 🟡 低 |

### 里程碑

- **Week 1-2**：架构优化完成
- **Week 3**：依赖注入和配置管理完成
- **Week 4-5**：测试和优化完成
- **Week 6**：文档完成，正式发布

---

## ✅ 六、验收标准

### 代码质量
- [ ] 单文件最大行数 < 300 行
- [ ] 循环复杂度 < 10
- [ ] 单元测试覆盖率 > 70%
- [ ] 0 个代码 warning
- [ ] 0 个内存泄漏

### 功能完整性
- [ ] 所有现有功能保留
- [ ] UI 外观无变化
- [ ] 性能无退化（启动时间 <2s）

### 文档完整性
- [ ] CODING_STANDARDS.md
- [ ] ARCHITECTURE.md
- [ ] API_GUIDE.md
- [ ] 代码注释完整

---

## 📚 七、参考资源

### Apple 官方文档
- [SwiftUI Best Practices](https://developer.apple.com/videos/play/wwdc2021/10018/)
- [Combine Framework](https://developer.apple.com/documentation/combine)
- [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview)

### 设计模式
- [MVVM Pattern in Swift](https://www.avanderlee.com/swift/mvvm/)
- [Dependency Injection](https://www.avanderlee.com/swift/dependency-injection/)
- [Error Handling](https://www.avanderlee.com/swift/error-handling/)

### 示例项目
- [Compose Samples](https://github.com/android/compose-samples)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)

---

## 🚀 八、后续计划

### 短期（1 个月）
- [ ] 上线重构后的应用
- [ ] 收集用户反馈
- [ ] 性能监控和优化

### 中期（3 个月）
- [ ] 升级到 iOS 15.0 最低版本
- [ ] 迁移到 async/await
- [ ] 实现更多原生功能

### 长期（6 个月）
- [ ] 升级到 Swift 6
- [ ] 迁移到 SwiftUI Navigation API
- [ ] 完整的 Widget 支持

---

## 📝 附录：快速参考

### 关键决策
1. ✅ 采用 MVVM 架构
2. ✅ 使用 Combine 而非 RxSwift
3. ✅ WebView 作为独立 Service
4. ✅ 依赖注入通过 init 参数
5. ✅ 错误处理统一返回 UserFacingError

### 禁止事项
- ❌ 不使用 singleton（除了 AppContainer）
- ❌ 不在 View 中直接调用 API
- ❌ 不使用全局变量
- ❌ 不手动管理内存（避免循环引用）
- ❌ 不混用 UIKit 和 SwiftUI 逻辑

---

**文档维护者**：架构团队  
**最后更新**：2025年10月17日  
**版本**：1.0

