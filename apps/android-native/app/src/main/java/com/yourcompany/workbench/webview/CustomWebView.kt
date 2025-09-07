package com.yourcompany.workbench.webview

import android.content.Context
import android.util.AttributeSet
import android.webkit.*
import android.widget.FrameLayout
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.yourcompany.workbench.utils.Logger

/**
 * 自定义WebView，集成H5加载和原生桥接功能
 */
class CustomWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val webView: WebView
    private val swipeRefreshLayout: SwipeRefreshLayout
    private var webViewBridge: WebViewBridge? = null
    private var webViewCallback: WebViewCallback? = null

    init {
        // 初始化WebView
        webView = WebView(context).apply {
            settings.apply {
                // 启用JavaScript
                javaScriptEnabled = true
                // 启用DOM存储
                domStorageEnabled = true
                // 启用数据库存储
                databaseEnabled = true
                // 启用应用缓存
                setAppCacheEnabled(true)
                // 启用混合内容
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                // 启用文件访问
                allowFileAccess = true
                // 启用内容访问
                allowContentAccess = true
                // 设置缓存模式
                cacheMode = WebSettings.LOAD_DEFAULT
                // 启用缩放
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false
                // 设置用户代理
                userAgentString = userAgentString + " WorkbenchApp/1.0.0"
            }

            // 设置WebViewClient
            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    webViewCallback?.onPageStarted(url)
                    Logger.d("CustomWebView", "页面开始加载: $url")
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    webViewCallback?.onPageFinished(url)
                    swipeRefreshLayout.isRefreshing = false
                    Logger.d("CustomWebView", "页面加载完成: $url")
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    webViewCallback?.onError(error?.description?.toString())
                    Logger.e("CustomWebView", "页面加载错误: ${error?.description}")
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString()
                    return if (url?.startsWith("tel:") == true || 
                             url?.startsWith("mailto:") == true ||
                             url?.startsWith("sms:") == true) {
                        // 处理特殊协议
                        webViewCallback?.onSpecialUrl(url)
                        true
                    } else {
                        false
                    }
                }
            }

            // 设置WebChromeClient
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    webViewCallback?.onProgressChanged(newProgress)
                }

                override fun onReceivedTitle(view: WebView?, title: String?) {
                    super.onReceivedTitle(view, title)
                    webViewCallback?.onTitleChanged(title)
                }

                override fun onPermissionRequest(request: PermissionRequest?) {
                    super.onPermissionRequest(request)
                    webViewCallback?.onPermissionRequest(request)
                }
            }
        }

        // 初始化下拉刷新
        swipeRefreshLayout = SwipeRefreshLayout(context).apply {
            setOnRefreshListener {
                reload()
            }
            addView(webView)
        }

        addView(swipeRefreshLayout)
    }

    /**
     * 设置桥接回调
     */
    fun setBridgeCallback(callback: WebViewBridge.BridgeCallback) {
        webViewBridge = WebViewBridge(context, webView, callback)
        webView.addJavascriptInterface(webViewBridge!!, "NativeBridge")
    }

    /**
     * 设置WebView回调
     */
    fun setWebViewCallback(callback: WebViewCallback) {
        this.webViewCallback = callback
    }

    /**
     * 加载H5页面
     */
    fun loadH5Url(url: String) {
        Logger.d("CustomWebView", "加载H5页面: $url")
        webView.loadUrl(url)
    }

    /**
     * 加载本地HTML
     */
    fun loadLocalHtml(html: String) {
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
    }

    /**
     * 重新加载
     */
    fun reload() {
        webView.reload()
    }

    /**
     * 返回上一页
     */
    fun goBack(): Boolean {
        return if (webView.canGoBack()) {
            webView.goBack()
            true
        } else {
            false
        }
    }

    /**
     * 前进到下一页
     */
    fun goForward(): Boolean {
        return if (webView.canGoForward()) {
            webView.goForward()
            true
        } else {
            false
        }
    }

    /**
     * 执行JavaScript
     */
    fun evaluateJavascript(script: String, resultCallback: ValueCallback<String>? = null) {
        webView.evaluateJavascript(script, resultCallback)
    }

    /**
     * 注入JavaScript接口
     */
    fun injectJavaScriptInterface(name: String, obj: Any) {
        webView.addJavascriptInterface(obj, name)
    }

    /**
     * 清除缓存
     */
    fun clearCache() {
        webView.clearCache(true)
        webView.clearHistory()
    }

    /**
     * 设置下拉刷新是否启用
     */
    fun setRefreshEnabled(enabled: Boolean) {
        swipeRefreshLayout.isEnabled = enabled
    }

    /**
     * WebView回调接口
     */
    interface WebViewCallback {
        fun onPageStarted(url: String?) {}
        fun onPageFinished(url: String?) {}
        fun onProgressChanged(progress: Int) {}
        fun onTitleChanged(title: String?) {}
        fun onError(error: String?) {}
        fun onSpecialUrl(url: String?) {}
        fun onPermissionRequest(request: PermissionRequest?) {}
    }
}
