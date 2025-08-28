/**
 * API客户端配置
 * 统一的HTTP客户端，包含拦截器、错误处理等
 */

import { useAuthStore } from '@/stores/auth/useAuthStore'
import { toast } from '@/stores/ui/useUIStore'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { appConfig } from '../config/env'

// API响应基础结构
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
    success: boolean
    timestamp: number
}

// API错误类型
export interface ApiError {
    code: number
    message: string
    details?: any
}

// 创建axios实例
export const apiClient = axios.create({
    baseURL: appConfig.apiBaseUrl,
    timeout: appConfig.apiTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 添加认证token
        const { token } = useAuthStore.getState()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // 开发环境下打印请求信息
        if (appConfig.isDev) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                headers: config.headers,
                params: config.params,
                data: config.data,
            })
        }

        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const { data } = response

        // 开发环境下打印响应信息
        if (appConfig.isDev) {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data,
            })
        }

        // 统一处理业务错误
        if (!data.success && data.code !== 200) {
            const error: ApiError = {
                code: data.code,
                message: data.message,
                details: data.data,
            }

            // 显示错误提示
            toast.error(data.message)

            return Promise.reject(error)
        }

        return response
    },
    async (error: AxiosError<ApiResponse>) => {
        const { response, config } = error

        // 开发环境下打印错误信息
        if (appConfig.isDev) {
            console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
                status: response?.status,
                data: response?.data,
                message: error.message,
            })
        }

        // 处理不同的HTTP状态码
        if (response) {
            const { status, data } = response

            switch (status) {
                case 401:
                    // 未授权，清除认证信息并跳转到登录页
                    useAuthStore.getState().logout()
                    toast.error('登录已过期，请重新登录')
                    // 这里可以添加路由跳转逻辑
                    break

                case 403:
                    toast.error('没有权限访问该资源')
                    break

                case 404:
                    toast.error('请求的资源不存在')
                    break

                case 422:
                    // 表单验证错误
                    if (data?.data && typeof data.data === 'object') {
                        const firstErrorMessage = Object.values(data.data)[0]
                        toast.error(firstErrorMessage as string)
                    } else {
                        toast.error(data?.message || '请求参数错误')
                    }
                    break

                case 429:
                    toast.error('请求过于频繁，请稍后再试')
                    break

                case 500:
                    toast.error('服务器内部错误')
                    break

                default:
                    toast.error(data?.message || `请求失败 (${status})`)
            }

            // 返回统一的错误格式
            const apiError: ApiError = {
                code: status,
                message: data?.message || error.message,
                details: data?.data,
            }

            return Promise.reject(apiError)
        }

        // 网络错误或其他错误
        if (error.code === 'ECONNABORTED') {
            toast.error('请求超时，请检查网络连接')
        } else if (!navigator.onLine) {
            toast.error('网络连接异常，请检查网络设置')
        } else {
            toast.error('网络错误，请稍后重试')
        }

        return Promise.reject({
            code: 0,
            message: error.message,
            details: error,
        } as ApiError)
    }
)

// 请求方法封装
export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<ApiResponse<T>>(url, config).then(res => res.data.data),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<ApiResponse<T>>(url, data, config).then(res => res.data.data),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<ApiResponse<T>>(url, data, config).then(res => res.data.data),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<ApiResponse<T>>(url, data, config).then(res => res.data.data),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<ApiResponse<T>>(url, config).then(res => res.data.data),
}

// 上传文件方法
export const uploadFile = async (
    url: string,
    file: File,
    onProgress?: (percent: number) => void
) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post<ApiResponse<{ url: string; filename: string }>>(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percent)
            }
        },
    }).then(res => res.data.data)
}

// 并发请求
export const concurrent = <T extends readonly unknown[] | []>(
    requests: readonly [...{ [K in keyof T]: Promise<T[K]> }]
): Promise<T> => {
    return Promise.all(requests) as Promise<T>
}

// 请求重试
export const retry = async <T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> => {
    let lastError: any

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await request()
        } catch (error) {
            lastError = error
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
            }
        }
    }

    throw lastError
}

export default api
