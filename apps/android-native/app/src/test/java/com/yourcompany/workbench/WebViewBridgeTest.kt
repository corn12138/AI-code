package com.yourcompany.workbench

import android.content.Context
import android.webkit.WebView
import com.yourcompany.workbench.webview.WebViewBridge
import io.mockk.*
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.junit.MockitoJUnitRunner
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@RunWith(MockitoJUnitRunner::class)
class WebViewBridgeTest {

    @Mock
    private lateinit var mockContext: Context

    @Mock
    private lateinit var mockWebView: WebView

    @Mock
    private lateinit var mockBridgeCallback: WebViewBridge.BridgeCallback

    private lateinit var webViewBridge: WebViewBridge

    @Before
    fun setUp() {
        webViewBridge = WebViewBridge(mockContext, mockWebView, mockBridgeCallback)
    }

    @Test
    fun `test getDeviceInfo returns valid JSON`() {
        // Given
        val deviceInfo = webViewBridge.getDeviceInfo()

        // Then
        assertNotNull(deviceInfo)
        assert(deviceInfo.contains("platform"))
        assert(deviceInfo.contains("android"))
    }

    @Test
    fun `test getNetworkStatus calls callback`() {
        // Given
        val mockNetworkInfo = WebViewBridge.NetworkInfo(
            isConnected = true,
            type = "wifi",
            strength = 80
        )
        whenever(mockBridgeCallback.getNetworkStatus()).thenReturn(mockNetworkInfo)

        // When
        val result = webViewBridge.getNetworkStatus()

        // Then
        assertNotNull(result)
        assert(result.contains("isConnected"))
        assert(result.contains("true"))
    }

    @Test
    fun `test showToast calls callback`() = runTest {
        // Given
        val message = "测试消息"
        val duration = "long"

        // When
        webViewBridge.showToast(message, duration)

        // Then
        verify { mockBridgeCallback.showToast(message, duration) }
    }

    @Test
    fun `test getStorage calls callback`() {
        // Given
        val key = "test_key"
        val expectedValue = "test_value"
        whenever(mockBridgeCallback.getStorage(key)).thenReturn(expectedValue)

        // When
        val result = webViewBridge.getStorage(key)

        // Then
        assertEquals("\"$expectedValue\"", result)
    }

    @Test
    fun `test setStorage calls callback`() = runTest {
        // Given
        val key = "test_key"
        val value = "test_value"

        // When
        webViewBridge.setStorage(key, value)

        // Then
        verify { mockBridgeCallback.setStorage(key, value) }
    }
}
