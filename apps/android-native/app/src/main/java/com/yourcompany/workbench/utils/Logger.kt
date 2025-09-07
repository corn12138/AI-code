package com.yourcompany.workbench.utils

import android.util.Log
import com.yourcompany.workbench.BuildConfig

/**
 * 日志工具类
 */
object Logger {
    private const val TAG_PREFIX = "Workbench"
    private const val MAX_TAG_LENGTH = 23

    fun d(tag: String, message: String) {
        if (BuildConfig.DEBUG) {
            Log.d(getTag(tag), message)
        }
    }

    fun i(tag: String, message: String) {
        if (BuildConfig.DEBUG) {
            Log.i(getTag(tag), message)
        }
    }

    fun w(tag: String, message: String) {
        if (BuildConfig.DEBUG) {
            Log.w(getTag(tag), message)
        }
    }

    fun e(tag: String, message: String) {
        if (BuildConfig.DEBUG) {
            Log.e(getTag(tag), message)
        }
    }

    fun e(tag: String, message: String, throwable: Throwable?) {
        if (BuildConfig.DEBUG) {
            Log.e(getTag(tag), message, throwable)
        }
    }

    private fun getTag(tag: String): String {
        val fullTag = "$TAG_PREFIX-$tag"
        return if (fullTag.length > MAX_TAG_LENGTH) {
            fullTag.substring(0, MAX_TAG_LENGTH)
        } else {
            fullTag
        }
    }
}
