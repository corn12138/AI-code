package com.aicode.mobile.network

import com.aicode.mobile.BuildConfig
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

/**
 * API服务类
 * 负责与后端API进行通信
 */
class ApiService {
    
    private val gson = Gson()
    private val client: OkHttpClient
    
    init {
        val builder = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
        
        // 在Debug模式下添加日志拦截器
        if (BuildConfig.DEBUG) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            builder.addInterceptor(loggingInterceptor)
        }
        
        client = builder.build()
    }
    
    /**
     * 获取文章列表
     */
    suspend fun fetchArticles(
        category: String? = null,
        page: Int = 1,
        pageSize: Int = 10
    ): ApiResponse<ArticleListResponse> = withContext(Dispatchers.IO) {
        val url = buildString {
            append(BuildConfig.API_BASE_URL)
            append("/api/mobile/docs")
            append("?page=$page&pageSize=$pageSize")
            if (!category.isNullOrEmpty() && category != "latest") {
                append("&category=$category")
            }
        }
        
        val request = Request.Builder()
            .url(url)
            .get()
            .build()
        
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: ""
        
        if (response.isSuccessful) {
            gson.fromJson(responseBody, ApiResponse::class.java) as ApiResponse<ArticleListResponse>
        } else {
            throw Exception("API请求失败: ${response.code} - ${response.message}")
        }
    }
    
    /**
     * 获取文章详情
     */
    suspend fun fetchArticleById(articleId: String): ApiResponse<Article> = withContext(Dispatchers.IO) {
        val url = "${BuildConfig.API_BASE_URL}/api/mobile/docs/$articleId"
        
        val request = Request.Builder()
            .url(url)
            .get()
            .build()
        
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: ""
        
        if (response.isSuccessful) {
            gson.fromJson(responseBody, ApiResponse::class.java) as ApiResponse<Article>
        } else {
            throw Exception("API请求失败: ${response.code} - ${response.message}")
        }
    }
    
    /**
     * API响应数据类
     */
    data class ApiResponse<T>(
        val code: Int,
        val message: String,
        val data: T,
        val success: Boolean = true
    )
    
    /**
     * 文章列表响应数据类
     */
    data class ArticleListResponse(
        val items: List<Article>,
        val total: Int,
        val page: Int,
        val pageSize: Int,
        val hasMore: Boolean
    )
    
    /**
     * 文章数据类
     */
    data class Article(
        val id: String,
        val title: String,
        val summary: String?,
        val content: String,
        val category: String,
        val author: String,
        val readTime: Int,
        val tags: List<String>,
        val imageUrl: String?,
        val isHot: Boolean,
        val published: Boolean,
        val createdAt: String,
        val updatedAt: String
    )
}

