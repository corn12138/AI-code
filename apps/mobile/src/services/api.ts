import { Toast } from 'antd-mobile'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { appConfig } from '@/config/env'

// API 基础配置
const API_BASE_URL = appConfig.apiBaseUrl

// 创建 axios 实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 添加认证token
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = generateRequestId()

        return config
    },
    (error: AxiosError) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    (error: AxiosError) => {
        console.error('Response error:', error)

        // 处理不同的错误状态
        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    // 未授权，清除token并跳转到登录页
                    localStorage.removeItem('auth_token')
                    window.location.href = '/login'
                    Toast.show({
                        icon: 'fail',
                        content: '登录已过期，请重新登录',
                    })
                    break
                case 403:
                    Toast.show({
                        icon: 'fail',
                        content: '没有权限访问此资源',
                    })
                    break
                case 404:
                    Toast.show({
                        icon: 'fail',
                        content: '请求的资源不存在',
                    })
                    break
                case 500:
                    Toast.show({
                        icon: 'fail',
                        content: '服务器内部错误',
                    })
                    break
                default:
                    Toast.show({
                        icon: 'fail',
                        content: (data as any)?.message || '请求失败',
                    })
            }
        } else if (error.request) {
            // 网络错误
            Toast.show({
                icon: 'fail',
                content: '网络连接失败，请检查网络设置',
            })
        } else {
            // 其他错误
            Toast.show({
                icon: 'fail',
                content: '请求发生未知错误',
            })
        }

        return Promise.reject(error)
    }
)

// 生成请求ID
function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// API 方法封装
export const api = {
    // GET 请求
    get: <T = any>(url: string, params?: any): Promise<T> => {
        return apiClient.get(url, { params }).then(response => response.data)
    },

    // POST 请求
    post: <T = any>(url: string, data?: any): Promise<T> => {
        return apiClient.post(url, data).then(response => response.data)
    },

    // PUT 请求
    put: <T = any>(url: string, data?: any): Promise<T> => {
        return apiClient.put(url, data).then(response => response.data)
    },

    // DELETE 请求
    delete: <T = any>(url: string): Promise<T> => {
        return apiClient.delete(url).then(response => response.data)
    },

    // PATCH 请求
    patch: <T = any>(url: string, data?: any): Promise<T> => {
        return apiClient.patch(url, data).then(response => response.data)
    },

    // 文件上传
    upload: <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
        const formData = new FormData()
        formData.append('file', file)

        return apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress(progress)
                }
            },
        }).then(response => response.data)
    },
}

// 认证相关API
export const authApi = {
    // 登录
    login: (credentials: { username: string; password: string }) => {
        return api.post('/auth/login', credentials)
    },

    // 注册
    register: (userInfo: { username: string; email: string; password: string }) => {
        return api.post('/auth/register', userInfo)
    },

    // 退出登录
    logout: () => {
        return api.post('/auth/logout')
    },

    // 刷新token
    refreshToken: () => {
        return api.post('/auth/refresh')
    },

    // 获取用户信息
    getUserInfo: () => {
        return api.get('/auth/user')
    },
}

// 用户相关API
export const userApi = {
    // 获取用户资料
    getProfile: () => {
        return api.get('/user/profile')
    },

    // 更新用户资料
    updateProfile: (profile: any) => {
        return api.put('/user/profile', profile)
    },

    // 上传头像
    uploadAvatar: (file: File, onProgress?: (progress: number) => void) => {
        return api.upload('/user/avatar', file, onProgress)
    },

    // 修改密码
    changePassword: (passwords: { oldPassword: string; newPassword: string }) => {
        return api.post('/user/change-password', passwords)
    },
}

export default api
