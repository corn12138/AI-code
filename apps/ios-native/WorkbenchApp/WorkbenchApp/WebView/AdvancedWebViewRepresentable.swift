import SwiftUI
import WebKit

// MARK: - 大厂级别的 WebView 包装器
struct AdvancedWebViewRepresentable: UIViewRepresentable {
    @ObservedObject var webViewManager: AdvancedWebViewManager
    @State private var showingError = false
    
    func makeUIView(context: Context) -> WKWebView {
        let webView = webViewManager.createWebView()
        
        // 设置代理
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        
        // 配置 WebView
        configureWebView(webView)
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // 更新 WebView 配置
        updateWebViewConfiguration(uiView)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    // MARK: - Coordinator
    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let parent: AdvancedWebViewRepresentable
        
        init(_ parent: AdvancedWebViewRepresentable) {
            self.parent = parent
        }
        
        // MARK: - WKNavigationDelegate
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.webViewManager.isLoading = true
                self.parent.webViewManager.error = nil
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.webViewManager.isLoading = false
            }
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.webViewManager.isLoading = false
                self.parent.webViewManager.error = error
                self.parent.showingError = true
            }
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.webViewManager.isLoading = false
                self.parent.webViewManager.error = error
                self.parent.showingError = true
            }
        }
        
        // MARK: - WKUIDelegate
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: "提示", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
                completionHandler()
            })
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                window.rootViewController?.present(alert, animated: true)
            }
        }
        
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let alert = UIAlertController(title: "确认", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
                completionHandler(true)
            })
            alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in
                completionHandler(false)
            })
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                window.rootViewController?.present(alert, animated: true)
            }
        }
    }
    
    // MARK: - Private Methods
    
    private func configureWebView(_ webView: WKWebView) {
        // 禁用选择
        webView.allowsBackForwardNavigationGestures = true
        
        // 配置滚动
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.bounces = true
        webView.scrollView.showsVerticalScrollIndicator = true
        webView.scrollView.showsHorizontalScrollIndicator = false
        
        // 配置内容边距
        if #available(iOS 11.0, *) {
            webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        }
    }
    
    private func updateWebViewConfiguration(_ webView: WKWebView) {
        // 根据状态更新配置
        if webViewManager.isLoading {
            webView.scrollView.isScrollEnabled = false
        } else {
            webView.scrollView.isScrollEnabled = true
        }
    }
}

// MARK: - 高级 WebView 页面
struct AdvancedWebViewPage: View {
    @StateObject private var webViewManager = AdvancedWebViewManager()
    @State private var isLoading = true
    @State private var showingError = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // WebView
                AdvancedWebViewRepresentable(webViewManager: webViewManager)
                    .onAppear {
                        loadH5App()
                    }
                
                // 加载指示器
                if webViewManager.isLoading {
                    VStack {
                        ProgressView()
                            .scaleEffect(1.2)
                        
                        Text("加载中...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 8)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(.systemBackground))
                }
                
                // 错误提示
                if showingError {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.orange)
                        
                        Text("加载失败")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        if let error = webViewManager.error {
                            Text(error.localizedDescription)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        
                        Button("重试") {
                            showingError = false
                            loadH5App()
                        }
                        .foregroundColor(.blue)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.blue.opacity(0.1))
                        )
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.systemBackground))
                            .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
                    )
                    .padding(20)
                }
            }
            .navigationTitle(webViewManager.title.isEmpty ? "应用" : webViewManager.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if webViewManager.canGoBack {
                        Button(action: {
                            webViewManager.goBack()
                        }) {
                            Image(systemName: "chevron.left")
                        }
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack {
                        if webViewManager.canGoForward {
                            Button(action: {
                                webViewManager.goForward()
                            }) {
                                Image(systemName: "chevron.right")
                            }
                        }
                        
                        Button("刷新") {
                            webViewManager.reload()
                        }
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

// MARK: - 预览
#Preview {
    AdvancedWebViewPage()
}
