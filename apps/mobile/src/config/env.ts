/**
 * 环境配置管理
 * 统一管理所有环境变量和应用配置
 */

export interface AppConfig {
    // 应用信息
    appTitle: string
    appVersion: string
    appDescription: string

    // API 配置
    apiBaseUrl: string
    apiTimeout: number

    // 功能开关
    enableVConsole: boolean
    enablePWA: boolean
    enableMock: boolean

    // 上传配置
    maxFileSize: number
    allowedFileTypes: string[]

    // CDN配置
    cdnBaseUrl: string
    staticBaseUrl: string

    // 环境信息
    isDev: boolean
    isProd: boolean
    isTest: boolean
}

// 获取环境变量的辅助函数
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // UMI构建时使用process.env，运行时使用import.meta.env
  const env = typeof process !== 'undefined' ? process.env : (import.meta as any)?.env || {}
  return env[key] || defaultValue
}

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
    const value = getEnvVar(key)
    return value === 'true' || value === '1' || (defaultValue && !value)
}

const getEnvNumber = (key: string, defaultValue: number = 0): number => {
    const value = getEnvVar(key)
    return value ? Number(value) : defaultValue
}

// 应用配置
export const appConfig: AppConfig = {
    // 应用信息
    appTitle: getEnvVar('VITE_APP_TITLE', '移动端工作台'),
    appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    appDescription: getEnvVar('VITE_APP_DESCRIPTION', '现代化移动端工作台应用'),

    // API 配置
    apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001'),
    apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 10000),

    // 功能开关
    enableVConsole: getEnvBoolean('VITE_ENABLE_VCONSOLE', true),
    enablePWA: getEnvBoolean('VITE_ENABLE_PWA', true),
    enableMock: getEnvBoolean('VITE_ENABLE_MOCK', false),

    // 上传配置
    maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
    allowedFileTypes: getEnvVar('VITE_ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,application/pdf').split(','),

    // CDN配置
    cdnBaseUrl: getEnvVar('VITE_CDN_BASE_URL', 'https://cdn.yourdomain.com'),
    staticBaseUrl: getEnvVar('VITE_STATIC_BASE_URL', '/static'),

      // 环境信息
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
}

// 主题配置
export const themeConfig = {
    primaryColor: '#1677ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#ff4d4f',
    infoColor: '#1890ff',

    borderRadius: {
        small: '4px',
        medium: '6px',
        large: '8px',
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },

    breakpoints: {
        mobile: '(max-width: 768px)',
        tablet: '(min-width: 769px) and (max-width: 1024px)',
        desktop: '(min-width: 1025px)',
    },
}

// 路由配置
export const routeConfig = {
    // 公开路由（无需登录）
    publicRoutes: ['/login', '/register', '/forgot-password', '/404'],

    // 默认重定向
    defaultRoute: '/',
    loginRoute: '/login',
    homeRoute: '/',

    // Tab bar 路由
    tabRoutes: [
        {
            path: '/',
            title: '首页',
            icon: 'home',
        },
        {
            path: '/apps',
            title: '应用',
            icon: 'apps',
        },
        {
            path: '/message',
            title: '消息',
            icon: 'message',
        },
        {
            path: '/profile',
            title: '我的',
            icon: 'profile',
        },
    ],
}

// Tab Bar 配置
export const tabBarConfig = {
    style: {
        backgroundColor: themeConfig.backgroundColor,
        borderTop: `1px solid ${themeConfig.borderColor}`,
    },
    tabs: routeConfig.tabRoutes.map(route => ({
        key: route.path,
        title: route.title,
        icon: route.icon,
        activeIcon: route.icon,
        badge: undefined,
    })),
}

// Header 配置
export const headerConfig = {
    style: {
        backgroundColor: themeConfig.primaryColor,
        color: '#ffffff',
    },
    titleStyle: {
        fontSize: '18px',
        fontWeight: 'bold',
    },
    backButton: {
        show: true,
        color: '#ffffff',
    },
    pageTitles: {
        '/': '首页',
        '/apps': '应用',
        '/message': '消息',
        '/profile': '我的',
        '/settings': '设置',
        '/notifications': '通知',
        '/documents': '文档',
    } as Record<string, string>,
}

// Home 配置
export const homeConfig = {
    welcomeText: '欢迎使用移动工作台',
    subtitle: '高效办公，随时随地',
    quickActions: [
        { id: 1, title: '新建任务', icon: 'add', link: '/tasks/new' },
        { id: 2, title: '扫一扫', icon: 'scan', link: '/scan' },
        { id: 3, title: '消息中心', icon: 'message', link: '/message' },
        { id: 4, title: '个人中心', icon: 'user', link: '/profile' },
    ],
}

// Icon 配置
export const iconConfig = {
    size: {
        small: 16,
        medium: 20,
        large: 24,
        xlarge: 32,
    },
    color: {
        primary: themeConfig.primaryColor,
        secondary: themeConfig.textColor,
        success: themeConfig.successColor,
        warning: themeConfig.warningColor,
        error: themeConfig.errorColor,
    },
}

// 导出默认配置
export default appConfig
