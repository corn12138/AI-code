package com.yourcompany.workbench.webview

import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.gson.Gson
import com.yourcompany.workbench.utils.Logger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * WebView与原生功能的桥接类
 * 提供原生功能给H5调用
 */
class WebViewBridge(
    private val context: Context,
    private val webView: WebView,
    private val bridgeCallback: BridgeCallback
) {
    private val gson = Gson()
    private val scope = CoroutineScope(Dispatchers.Main)

    /**
     * 获取设备信息
     */
    @JavascriptInterface
    fun getDeviceInfo(): String {
        return try {
            val deviceInfo = DeviceInfo(
                platform = "android",
                version = android.os.Build.VERSION.RELEASE,
                model = android.os.Build.MODEL,
                brand = android.os.Build.BRAND,
                screenWidth = context.resources.displayMetrics.widthPixels,
                screenHeight = context.resources.displayMetrics.heightPixels,
                density = context.resources.displayMetrics.density
            )
            gson.toJson(deviceInfo)
        } catch (e: Exception) {
            Logger.e("WebViewBridge", "获取设备信息失败", e)
            "{}"
        }
    }

    /**
     * 获取网络状态
     */
    @JavascriptInterface
    fun getNetworkStatus(): String {
        return try {
            val networkInfo = bridgeCallback.getNetworkStatus()
            gson.toJson(networkInfo)
        } catch (e: Exception) {
            Logger.e("WebViewBridge", "获取网络状态失败", e)
            "{}"
        }
    }

    /**
     * 调用相机
     */
    @JavascriptInterface
    fun openCamera(callbackId: String) {
        scope.launch {
            try {
                bridgeCallback.openCamera { result ->
                    val response = BridgeResponse(
                        callbackId = callbackId,
                        success = result.isSuccess,
                        data = result.getOrNull(),
                        error = result.exceptionOrNull()?.message
                    )
                    callJsCallback(response)
                }
            } catch (e: Exception) {
                Logger.e("WebViewBridge", "调用相机失败", e)
                val response = BridgeResponse(
                    callbackId = callbackId,
                    success = false,
                    error = e.message
                )
                callJsCallback(response)
            }
        }
    }

    /**
     * 选择图片
     */
    @JavascriptInterface
    fun pickImage(callbackId: String, maxCount: Int = 1) {
        scope.launch {
            try {
                bridgeCallback.pickImage(maxCount) { result ->
                    val response = BridgeResponse(
                        callbackId = callbackId,
                        success = result.isSuccess,
                        data = result.getOrNull(),
                        error = result.exceptionOrNull()?.message
                    )
                    callJsCallback(response)
                }
            } catch (e: Exception) {
                Logger.e("WebViewBridge", "选择图片失败", e)
                val response = BridgeResponse(
                    callbackId = callbackId,
                    success = false,
                    error = e.message
                )
                callJsCallback(response)
            }
        }
    }

    /**
     * 显示Toast消息
     */
    @JavascriptInterface
    fun showToast(message: String, duration: String = "short") {
        scope.launch {
            try {
                bridgeCallback.showToast(message, duration)
            } catch (e: Exception) {
                Logger.e("WebViewBridge", "显示Toast失败", e)
            }
        }
    }

    /**
     * 获取本地存储数据
     */
    @JavascriptInterface
    fun getStorage(key: String): String {
        return try {
            val value = bridgeCallback.getStorage(key)
            gson.toJson(value)
        } catch (e: Exception) {
            Logger.e("WebViewBridge", "获取存储数据失败", e)
            "null"
        }
    }

    /**
     * 设置本地存储数据
     */
    @JavascriptInterface
    fun setStorage(key: String, value: String) {
        scope.launch {
            try {
                bridgeCallback.setStorage(key, value)
            } catch (e: Exception) {
                Logger.e("WebViewBridge", "设置存储数据失败", e)
            }
        }
    }

    /**
     * 调用JS回调函数
     */
    private fun callJsCallback(response: BridgeResponse) {
        val jsCode = """
            if (window.NativeBridge && window.NativeBridge.callback) {
                window.NativeBridge.callback('${gson.toJson(response)}');
            }
        """.trimIndent()
        
        webView.post {
            webView.evaluateJavascript(jsCode, null)
        }
    }

    /**
     * 数据类定义
     */
    data class DeviceInfo(
        val platform: String,
        val version: String,
        val model: String,
        val brand: String,
        val screenWidth: Int,
        val screenHeight: Int,
        val density: Float
    )

    data class NetworkInfo(
        val isConnected: Boolean,
        val type: String,
        val strength: Int
    )

    data class BridgeResponse(
        val callbackId: String,
        val success: Boolean,
        val data: Any? = null,
        val error: String? = null
    )

    /**
     * 桥接回调接口
     */
    interface BridgeCallback {
        fun getNetworkStatus(): NetworkInfo
        fun openCamera(callback: (Result<String>) -> Unit)
        fun pickImage(maxCount: Int, callback: (Result<List<String>>) -> Unit)
        fun showToast(message: String, duration: String)
        fun getStorage(key: String): String?
        fun setStorage(key: String, value: String)
    }
}
