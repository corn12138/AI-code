package com.yourcompany.workbench.ui

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.ProgressBar
import androidx.fragment.app.Fragment
import com.yourcompany.workbench.R
import com.yourcompany.workbench.webview.WebViewManager

class WorkbenchFragment : Fragment() {
    
    private var webView: WebView? = null
    private var progressBar: ProgressBar? = null
    private lateinit var webViewManager: WebViewManager
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_workbench, container, false)
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        webView = view.findViewById(R.id.webview)
        progressBar = view.findViewById(R.id.progress_bar)
        
        setupWebView()
    }
    
    private fun setupWebView() {
        webView?.let { webView ->
            webViewManager = WebViewManager(requireContext())
            webViewManager.setupWebView(webView) { progress ->
                // 更新进度条
                progressBar?.apply {
                    if (progress == 100) {
                        visibility = View.GONE
                    } else {
                        visibility = View.VISIBLE
                        setProgress(progress, true)
                    }
                }
            }
            
            // 加载 H5 应用
            webViewManager.loadWorkbench(webView)
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        webView?.destroy()
        webView = null
        progressBar = null
    }
    
    fun canGoBack(): Boolean {
        return webView?.canGoBack() ?: false
    }
    
    fun goBack() {
        webView?.goBack()
    }
    
    fun reload() {
        webView?.reload()
    }
}
