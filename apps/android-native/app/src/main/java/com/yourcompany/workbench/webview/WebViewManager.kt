package com.aicode.mobile.webview

import android.annotation.SuppressLint
import android.content.Context
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.aicode.mobile.utils.Logger
import org.json.JSONObject

class WebViewManager(
    private val context: Context,
    private val webView: CustomWebView,
    private val webViewBridge: WebViewBridge
) {
    
    /**
     * 设置WebView
     */
    fun setupWebView() {
        // 设置桥接回调
        webView.setBridgeCallback(createBridgeCallback())
        
        // 设置WebView回调
        webView.setWebViewCallback(createWebViewCallback())
        
        Logger.d("WebViewManager", "WebView设置完成")
    }
    
    /**
     * 创建桥接回调
     */
    private fun createBridgeCallback(): WebViewBridge.BridgeCallback {
        return object : WebViewBridge.BridgeCallback {
            override fun getNetworkStatus(): WebViewBridge.NetworkInfo {
                // 实现网络状态获取
                return WebViewBridge.NetworkInfo(
                    isConnected = true,
                    type = "wifi",
                    strength = 4
                )
            }
            
            override fun openCamera(callback: (Result<String>) -> Unit) {
                // 实现相机功能
                callback(Result.failure(Exception("相机功能暂未实现")))
            }
            
            override fun pickImage(maxCount: Int, callback: (Result<List<String>>) -> Unit) {
                // 实现图片选择功能
                callback(Result.failure(Exception("图片选择功能暂未实现")))
            }
            
            override fun showToast(message: String, duration: String) {
                // 显示Toast
                val toastDuration = if (duration == "long") Toast.LENGTH_LONG else Toast.LENGTH_SHORT
                Toast.makeText(context, message, toastDuration).show()
            }
            
            override fun getStorage(key: String): String? {
                // 获取本地存储
                val sharedPrefs = context.getSharedPreferences("app_storage", Context.MODE_PRIVATE)
                return sharedPrefs.getString(key, null)
            }
            
            override fun setStorage(key: String, value: String) {
                // 设置本地存储
                val sharedPrefs = context.getSharedPreferences("app_storage", Context.MODE_PRIVATE)
                sharedPrefs.edit().putString(key, value).apply()
            }
        }
    }
    
    /**
     * 创建WebView回调
     */
    private fun createWebViewCallback(): CustomWebView.WebViewCallback {
        return object : CustomWebView.WebViewCallback {
            override fun onPageStarted(url: String?) {
                Logger.d("WebViewManager", "页面开始加载: $url")
            }
            
            override fun onPageFinished(url: String?) {
                Logger.d("WebViewManager", "页面加载完成: $url")
            }
            
            override fun onProgressChanged(progress: Int) {
                // 可以在这里更新进度条
            }
            
            override fun onError(error: String?) {
                Logger.e("WebViewManager", "页面加载错误: $error")
                Toast.makeText(context, "页面加载失败: $error", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    /**
     * 销毁WebView
     */
    fun destroy() {
        webView.clearCache()
        Logger.d("WebViewManager", "WebView已销毁")
    }
}
