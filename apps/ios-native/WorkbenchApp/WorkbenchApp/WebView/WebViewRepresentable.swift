import SwiftUI
import WebKit

struct WebViewRepresentable: UIViewRepresentable {
    @ObservedObject var webViewManager: WebViewManager
    
    func makeUIView(context: Context) -> WKWebView {
        return webViewManager.createWebView()
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // 更新UI视图（如果需要）
    }
}
