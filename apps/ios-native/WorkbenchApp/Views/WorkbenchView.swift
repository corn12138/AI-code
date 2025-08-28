import SwiftUI
import WebKit

struct WorkbenchView: View {
    @StateObject private var webViewManager = WebViewManager()

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 进度条
                if webViewManager.isLoading {
                    ProgressView()
                        .progressViewStyle(LinearProgressViewStyle())
                        .frame(height: 2)
                } else {
                    Rectangle()
                        .fill(Color.clear)
                        .frame(height: 2)
                }

                // WebView
                WebViewRepresentable(webViewManager: webViewManager)
                    .onAppear {
                        webViewManager.loadWorkbench()
                    }
            }
            .navigationTitle("工作台")
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
}

// WebView 包装器
struct WebViewRepresentable: UIViewRepresentable {
    @ObservedObject var webViewManager: WebViewManager

    func makeUIView(context: Context) -> WKWebView {
        return webViewManager.webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // 更新逻辑
    }
}

#Preview {
    WorkbenchView()
}
