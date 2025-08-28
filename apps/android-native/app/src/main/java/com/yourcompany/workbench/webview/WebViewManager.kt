package com.yourcompany.workbench.webview

import android.annotation.SuppressLint
import android.content.Context
import android.webkit.*
import android.widget.Toast
import com.yourcompany.workbench.utils.DeviceUtil
import org.json.JSONObject

class WebViewManager(private val context: Context) {
    
    private val h5URL = "http://10.0.2.2:8002" // 模拟器地址，真机请使用实际IP
    
    @SuppressLint("SetJavaScriptEnabled")
    fun setupWebView(webView: WebView, progressCallback: (Int) -> Unit) {
        // 基本设置
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            setSupportZoom(true)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }
        
        // 添加 JavaScript Interface
        webView.addJavascriptInterface(JsBridge(context), "Android")
        
        // 设置 WebViewClient
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressCallback(0)
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressCallback(100)
                
                // 注入原生桥接脚本
                injectNativeBridge(view)
            }
            
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                // 处理加载错误
                Toast.makeText(context, "页面加载失败: ${error?.description}", Toast.LENGTH_SHORT).show()
            }
        }
        
        // 设置 WebChromeClient
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressCallback(newProgress)
            }
            
            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                android.app.AlertDialog.Builder(context)
                    .setTitle("提示")
                    .setMessage(message)
                    .setPositiveButton("确定") { _, _ ->
                        result?.confirm()
                    }
                    .setCancelable(false)
                    .show()
                return true
            }
            
            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                android.app.AlertDialog.Builder(context)
                    .setTitle("确认")
                    .setMessage(message)
                    .setPositiveButton("确定") { _, _ ->
                        result?.confirm()
                    }
                    .setNegativeButton("取消") { _, _ ->
                        result?.cancel()
                    }
                    .setCancelable(false)
                    .show()
                return true
            }
        }
    }
    
    private fun injectNativeBridge(webView: WebView?) {
        val bridgeScript = """
            window.Android = window.Android || {};
            
            // 注入设备信息
            window.NativeDevice = {
                platform: 'android',
                version: '${android.os.Build.VERSION.RELEASE}',
                model: '${android.os.Build.MODEL}',
                brand: '${android.os.Build.BRAND}',
                isNative: true
            };
            
            // 确保 Android 对象可用
            if (typeof window.Android.callNativeMethod === 'function') {
                console.log('Android bridge is ready');
            }
        """
        
        webView?.evaluateJavascript(bridgeScript, null)
    }
    
    fun loadWorkbench(webView: WebView) {
        webView.loadUrl(h5URL)
    }
}

/**
 * JavaScript Bridge 实现
 */
class JsBridge(private val context: Context) {
    
    @JavascriptInterface
    fun callNativeMethod(method: String, params: String): String {
        return try {
            val paramsJson = if (params.isNotEmpty()) JSONObject(params) else JSONObject()
            
            when (method) {
                "getDeviceInfo" -> handleGetDeviceInfo()
                "showToast" -> handleShowToast(paramsJson)
                "getNetworkStatus" -> handleGetNetworkStatus()
                "openCamera" -> handleOpenCamera(paramsJson)
                "openGallery" -> handleOpenGallery(paramsJson)
                else -> createErrorResponse("Unknown method: $method")
            }
        } catch (e: Exception) {
            createErrorResponse("Error executing method $method: ${e.message}")
        }
    }
    
    private fun handleGetDeviceInfo(): String {
        val deviceInfo = JSONObject().apply {
            put("platform", "android")
            put("version", android.os.Build.VERSION.RELEASE)
            put("model", android.os.Build.MODEL)
            put("brand", android.os.Build.BRAND)
            put("uuid", DeviceUtil.getDeviceId(context))
            put("appVersion", DeviceUtil.getAppVersion(context))
            put("buildNumber", DeviceUtil.getBuildNumber(context))
        }
        
        return createSuccessResponse(deviceInfo)
    }
    
    private fun handleShowToast(params: JSONObject): String {
        val message = params.optString("message", "")
        val duration = params.optInt("duration", 3000)
        
        // 在主线程显示 Toast
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            Toast.makeText(
                context,
                message,
                if (duration > 3000) Toast.LENGTH_LONG else Toast.LENGTH_SHORT
            ).show()
        }
        
        return createSuccessResponse(null)
    }
    
    private fun handleGetNetworkStatus(): String {
        val networkStatus = JSONObject().apply {
            put("isConnected", DeviceUtil.isNetworkConnected(context))
            put("connectionType", DeviceUtil.getNetworkType(context))
            put("isMetered", DeviceUtil.isNetworkMetered(context))
        }
        
        return createSuccessResponse(networkStatus)
    }
    
    private fun handleOpenCamera(params: JSONObject): String {
        // TODO: 实现相机功能
        return createErrorResponse("Camera not implemented yet")
    }
    
    private fun handleOpenGallery(params: JSONObject): String {
        // TODO: 实现相册功能
        return createErrorResponse("Gallery not implemented yet")
    }
    
    private fun createSuccessResponse(data: Any?): String {
        return JSONObject().apply {
            put("success", true)
            put("data", data ?: JSONObject.NULL)
            put("error", JSONObject.NULL)
        }.toString()
    }
    
    private fun createErrorResponse(error: String): String {
        return JSONObject().apply {
            put("success", false)
            put("data", JSONObject.NULL)
            put("error", error)
        }.toString()
    }
}
