// 基础类型定义

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
    timestamp?: number
    traceId?: string
}

/**
 * 分页数据类型
 */
export interface PageData<T = any> {
    list: T[]
    total: number
    page: number
    pageSize: number
    hasMore?: boolean
}

/**
 * 分页参数类型
 */
export interface PageParams {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

/**
 * 用户信息类型
 */
export interface User {
    id: string
    username: string
    email?: string
    phone?: string
    avatar?: string
    nickname?: string
    gender?: 'male' | 'female' | 'unknown'
    birthday?: string
    location?: string
    bio?: string
    status: 'active' | 'inactive' | 'banned'
    roles?: string[]
    permissions?: string[]
    createdAt: string
    updatedAt: string
    lastLoginAt?: string
}

/**
 * 登录凭据类型
 */
export interface LoginCredentials {
    username: string
    password: string
    rememberMe?: boolean
    captcha?: string
}

/**
 * 注册信息类型
 */
export interface RegisterInfo {
    username: string
    email: string
    password: string
    confirmPassword: string
    phone?: string
    captcha?: string
    agreeTerms: boolean
}

/**
 * 菜单项类型
 */
export interface MenuItem {
    key: string
    title: string
    icon?: React.ReactNode
    path?: string
    badge?: number | string
    description?: string
    color?: string
    disabled?: boolean
    children?: MenuItem[]
}

/**
 * 表单字段类型
 */
export interface FormField {
    name: string
    label: string
    type: 'text' | 'password' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'file'
    required?: boolean
    placeholder?: string
    defaultValue?: any
    options?: { label: string; value: any }[]
    rules?: any[]
    disabled?: boolean
    hidden?: boolean
}

/**
 * 通知消息类型
 */
export interface Notification {
    id: string
    title: string
    content: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    createdAt: string
    actionUrl?: string
    actionText?: string
}

/**
 * 文件信息类型
 */
export interface FileInfo {
    id?: string
    name: string
    size: number
    type: string
    url?: string
    thumbnailUrl?: string
    uploadProgress?: number
    status?: 'uploading' | 'success' | 'error'
    errorMessage?: string
}

/**
 * 设备信息类型
 */
export interface DeviceInfo {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    deviceType: 'mobile' | 'tablet' | 'desktop'
    screenWidth: number
    screenHeight: number
    isLandscape: boolean
    isPortrait: boolean
    isTouchDevice: boolean
    isIOS: boolean
    isAndroid: boolean
    pixelRatio: number
}

/**
 * 应用配置类型
 */
export interface AppConfig {
    appName: string
    version: string
    apiBaseUrl: string
    theme: 'light' | 'dark' | 'auto'
    language: string
    enableNotifications: boolean
    enableSounds: boolean
    maxFileSize: number
    allowedFileTypes: string[]
}

/**
 * 路由元信息类型
 */
export interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    keepAlive?: boolean
    showInMenu?: boolean
    icon?: React.ReactNode
    order?: number
}

/**
 * 错误信息类型
 */
export interface ErrorInfo {
    code: string | number
    message: string
    details?: any
    timestamp?: number
    stack?: string
}

/**
 * 统计数据类型
 */
export interface StatData {
    label: string
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'stable'
    trendValue?: number
    color?: string
}

/**
 * 操作日志类型
 */
export interface OperationLog {
    id: string
    userId: string
    username: string
    action: string
    resource: string
    details?: string
    ip: string
    userAgent: string
    createdAt: string
}

/**
 * 搜索参数类型
 */
export interface SearchParams {
    keyword?: string
    category?: string
    tags?: string[]
    dateRange?: [string, string]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: Record<string, any>
}

/**
 * 地理位置类型
 */
export interface Location {
    latitude: number
    longitude: number
    address?: string
    city?: string
    province?: string
    country?: string
}

/**
 * 事件类型
 */
export interface AppEvent {
    type: string
    payload?: any
    timestamp: number
    source?: string
}

/**
 * 缓存项类型
 */
export interface CacheItem<T = any> {
    key: string
    value: T
    expiredAt?: number
    createdAt: number
}

/**
 * 主题配置类型
 */
export interface ThemeConfig {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    borderColor: string
    shadowColor: string
    fontSize: {
        small: string
        medium: string
        large: string
    }
    spacing: {
        small: string
        medium: string
        large: string
    }
}

// 导出所有类型
export type {
    ApiResponse, AppConfig, AppEvent,
    CacheItem, DeviceInfo, ErrorInfo, FileInfo, FormField, Location, LoginCredentials, MenuItem, Notification, OperationLog, PageData,
    PageParams, RegisterInfo, RouteMeta, SearchParams, StatData, ThemeConfig, User
}

