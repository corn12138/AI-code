import SwiftUI

struct ContentView: View {
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @State private var selectedTab = 0  // 默认显示工作台页面
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 强制全屏背景
                Color.white
                    .ignoresSafeArea(.all, edges: .all)
                    .frame(width: geometry.size.width, height: geometry.size.height)
                
                if #available(iOS 14.0, *) {
                    // iOS 14.0+ 使用带选择器的 TabView
                    TabView(selection: $selectedTab) {
                        tabContent
                    }
                    .accentColor(.blue)
                    .ignoresSafeArea(.all, edges: .all)
                    .onAppear {
                        setupApp()
                    }
                } else {
                    // iOS 13.0 使用基础 TabView
                    TabView {
                        tabContent
                    }
                    .accentColor(.blue)
                    .ignoresSafeArea(.all, edges: .all)
                    .onAppear {
                        setupApp()
                    }
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .ignoresSafeArea(.all, edges: .all)
        }
        .ignoresSafeArea(.all, edges: .all)
    }
    
    @ViewBuilder
    private var tabContent: some View {
        // 工作台首页
        FeishuStyleView()
            .tabItem {
                Image(systemName: "house.fill")
                Text("工作台")
            }
            .tag(0)
        
        // 文档浏览页面
        DocumentBrowserView()
            .tabItem {
                Image(systemName: "doc.text.fill")
                Text("文章")
            }
            .tag(1)
        
        // WebView 页面
        AdvancedWebViewPage()
            .tabItem {
                Image(systemName: "globe")
                Text("应用")
            }
            .tag(2)
        
        // 设置页面
        SettingsView()
            .tabItem {
                Image(systemName: "gearshape.fill")
                Text("设置")
            }
            .tag(3)
    }
    
    private func setupApp() {
        // 应用启动时的初始化
        print("WorkbenchApp 启动完成")
        
        // 监听 Tab 切换通知
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("SwitchToTab"),
            object: nil,
            queue: .main
        ) { notification in
            if let userInfo = notification.userInfo,
               let tabIndex = userInfo["tabIndex"] as? Int {
                selectedTab = tabIndex
            }
        }
    }
}

// MARK: - WebView 页面
struct WebViewPage: View {
    @StateObject private var webViewManager = WebViewManager()
    @State private var isLoading = true
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // WebView
                WebViewRepresentable(webViewManager: webViewManager)
                    .onAppear {
                        loadH5App()
                    }
                
                if isLoading {
                    ProgressView("加载中...")
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                        .padding()
                        .background(Color.white.opacity(0.8))
                        .cornerRadius(10)
                        .shadow(radius: 5)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("应用")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("刷新") {
                        webViewManager.reload()
                    }
                }
            }
        }
    }
    
    private func loadH5App() {
        #if DEBUG
        // 开发环境：优先加载本地移动端应用
        if let bundlePath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
           let bundleUrl = URL(string: "file://\(bundlePath)") {
            webViewManager.loadFileURL(bundleUrl)
            print("加载本地移动端应用: \(bundleUrl)")
        } else {
            // 降级到远程开发服务器
            let url = "http://localhost:3002"
            webViewManager.loadURL(url)
            print("加载远程开发服务器: \(url)")
        }
        #else
        // 生产环境：加载本地资源
        if let bundlePath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
           let bundleUrl = URL(string: "file://\(bundlePath)") {
            webViewManager.loadFileURL(bundleUrl)
            print("加载本地移动端应用: \(bundleUrl)")
        } else {
            print("错误：找不到本地移动端应用文件")
        }
        #endif
    }
}

// MARK: - 设置页面
struct SettingsView: View {
    @StateObject private var networkMonitor = NetworkMonitor.shared
    
    var body: some View {
        GeometryReader { geometry in
            Form {
                Section(header: Text("网络状态")) {
                    HStack {
                        Text("连接状态")
                        Spacer()
                        Text(networkMonitor.isConnected ? "已连接" : "未连接")
                            .foregroundColor(networkMonitor.isConnected ? .green : .red)
                    }
                    HStack {
                        Text("连接类型")
                        Spacer()
                        Text(networkMonitor.connectionType)
                    }
                }
                
                Section(header: Text("应用信息")) {
                    HStack {
                        Text("版本")
                        Spacer()
                        Text("1.0.0")
                    }
                    HStack {
                        Text("构建")
                        Spacer()
                        Text("1")
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("设置")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}