package com.aicode.mobile

import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import com.aicode.mobile.webview.CustomWebView
import com.aicode.mobile.webview.WebViewBridge
import com.aicode.mobile.webview.WebViewManager

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: CustomWebView
    private lateinit var webViewManager: WebViewManager
    private lateinit var webViewBridge: WebViewBridge
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 启用WebView调试（仅在Debug模式下）
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
        
        setupWebView()
        loadH5App()
    }
    
    private fun setupWebView() {
        webView = findViewById(R.id.webview)
        webViewBridge = WebViewBridge(this)
        webViewManager = WebViewManager(this, webView, webViewBridge)
        
        // 配置WebView
        webViewManager.setupWebView()
    }
    
    private fun loadH5App() {
        val url = if (BuildConfig.DEBUG) {
            // 开发环境：加载远程开发服务器
            BuildConfig.H5_DEV_URL
        } else {
            // 生产环境：优先加载本地资源，降级到远程
            if (hasLocalAssets()) {
                "file:///android_asset/www/index.html"
            } else {
                BuildConfig.H5_PROD_URL
            }
        }
        
        Logger.d("MainActivity", "Loading H5 app from: $url")
        webView.loadUrl(url)
    }
    
    /**
     * 检查本地资源是否存在
     */
    private fun hasLocalAssets(): Boolean {
        return try {
            assets.open("www/index.html").use { true }
        } catch (e: Exception) {
            Logger.w("MainActivity", "Local assets not found: ${e.message}")
            false
        }
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        webViewManager.destroy()
    }
}
