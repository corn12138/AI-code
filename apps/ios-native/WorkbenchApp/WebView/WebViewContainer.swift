import SwiftUI
import WebKit

struct WebViewContainer: View {
    @StateObject private var webViewManager = WebViewManager()
    @State private var isLoading = true
    @State private var loadingProgress: Double = 0.0
    
    var body: some View {
        ZStack {
            WebViewRepresentable(
                webViewManager: webViewManager,
                isLoading: $isLoading,
                loadingProgress: $loadingProgress
            )
            
            if isLoading {
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
        }
        .onAppear {
            loadH5App()
        }
    }
    
    private func loadH5App() {
        #if DEBUG
        // 开发环境：加载远程开发服务器
        let url = "http://localhost:3000"
        webViewManager.loadURL(url)
        #else
        // 生产环境：优先加载本地资源，降级到远程
        if let bundlePath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
           let bundleUrl = URL(string: "file://\(bundlePath)") {
            webViewManager.loadFileURL(bundleUrl)
        } else {
            // 降级到远程加载
            let url = "https://your-production-domain.com"
            webViewManager.loadURL(url)
        }
        #endif
    }
}

struct WebViewRepresentable: UIViewRepresentable {
    let webViewManager: WebViewManager
    @Binding var isLoading: Bool
    @Binding var loadingProgress: Double
    
    func makeUIView(context: Context) -> WKWebView {
        let webView = webViewManager.createWebView()
        
        // 设置代理
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        
        // 添加进度观察者
        webView.addObserver(context.coordinator, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)
        webView.addObserver(context.coordinator, forKeyPath: #keyPath(WKWebView.isLoading), options: .new, context: nil)
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // 更新UI视图（如果需要）
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let parent: WebViewRepresentable
        
        init(_ parent: WebViewRepresentable) {
            self.parent = parent
        }
        
        // MARK: - KVO
        override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
            if keyPath == #keyPath(WKWebView.estimatedProgress) {
                DispatchQueue.main.async {
                    self.parent.loadingProgress = (object as? WKWebView)?.estimatedProgress ?? 0.0
                }
            } else if keyPath == #keyPath(WKWebView.isLoading) {
                DispatchQueue.main.async {
                    self.parent.isLoading = (object as? WKWebView)?.isLoading ?? false
                }
            }
        }
        
        // MARK: - WKNavigationDelegate
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = true
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
            }
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
            }
            print("WebView navigation failed: \(error.localizedDescription)")
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
            }
            print("WebView provisional navigation failed: \(error.localizedDescription)")
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
        
        deinit {
            // 移除观察者
            parent.webViewManager.webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
            parent.webViewManager.webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.isLoading))
        }
    }
}

