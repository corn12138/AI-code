/**
 * 路由配置
 * 集中管理所有路由定义
 */

import { routeConfig } from '../config/env'

export interface RouteConfig {
    path: string
    component?: string
    redirect?: string
    layout?: boolean
    routes?: RouteConfig[]
    meta?: {
        title?: string
        requireAuth?: boolean
        keepAlive?: boolean
        icon?: string
        hidden?: boolean
    }
}

// 页面路由配置
export const routes: RouteConfig[] = [
    // 认证相关路由
    {
        path: '/login',
        component: '@/pages/Auth/Login',
        layout: false,
        meta: {
            title: '登录',
            requireAuth: false,
        },
    },
    {
        path: '/register',
        component: '@/pages/Auth/Register',
        layout: false,
        meta: {
            title: '注册',
            requireAuth: false,
        },
    },
    {
        path: '/forgot-password',
        component: '@/pages/Auth/ForgotPassword',
        layout: false,
        meta: {
            title: '忘记密码',
            requireAuth: false,
        },
    },

    // 主应用路由
    {
        path: '/',
        component: '@/components/Layout/Layout',
        meta: {
            requireAuth: true,
        },
        routes: [
            // Tab bar 页面
            {
                path: '/',
                component: '@/pages/Home/Home',
                meta: {
                    title: '首页',
                    icon: 'home',
                    keepAlive: true,
                },
            },
            // 混合开发/设备调试页面（隐藏，用于原生容器内验证桥接能力）
            {
                path: '/network-test',
                component: '@/pages/NetworkTest',
                meta: {
                    title: '网络/桥接测试',
                    requireAuth: false,
                    hidden: true,
                },
            },
            {
                path: '/device-test',
                component: '@/pages/DeviceTest',
                meta: {
                    title: '设备能力测试',
                    requireAuth: false,
                    hidden: true,
                },
            },
            {
                path: '/bridge-test',
                component: '@/pages/BridgeTest',
                meta: {
                    title: '桥接能力演示',
                    requireAuth: false,
                    hidden: true,
                },
            },
            {
                path: '/apps',
                component: '@/pages/Apps/Apps',
                meta: {
                    title: '应用',
                    icon: 'apps',
                    keepAlive: true,
                },
            },
            {
                path: '/message',
                component: '@/pages/Message/Message',
                meta: {
                    title: '消息',
                    icon: 'message',
                    keepAlive: true,
                },
            },
            {
                path: '/profile',
                component: '@/pages/Profile/Profile',
                meta: {
                    title: '我的',
                    icon: 'profile',
                    keepAlive: true,
                },
            },

            // 二级页面
            {
                path: '/settings',
                component: '@/pages/Settings/Settings',
                meta: {
                    title: '设置',
                    requireAuth: true,
                },
            },
            {
                path: '/notifications',
                component: '@/pages/Notifications/Notifications',
                meta: {
                    title: '通知',
                    requireAuth: true,
                },
            },
            {
                path: '/documents',
                component: '@/pages/Documents/Documents',
                meta: {
                    title: '文档',
                    requireAuth: true,
                },
            },
            {
                path: '/checkin',
                component: '@/pages/Checkin/Checkin',
                meta: {
                    title: '打卡',
                    requireAuth: true,
                },
            },
            {
                path: '/task-process',
                component: '@/pages/TaskProcess/TaskList',
                meta: {
                    title: '任务处理',
                    requireAuth: true,
                },
            },
            // 详情页
            {
                path: '/apps/:id',
                component: '@/pages/Apps/AppDetail',
                meta: {
                    title: '应用详情',
                    requireAuth: true,
                    hidden: true,
                },
            },
            {
                path: '/task-process/detail/:id',
                component: '@/pages/TaskProcess/TaskDetail',
                meta: {
                    title: '任务详情',
                    requireAuth: true,
                    hidden: true,
                },
            },
            {
                path: '/task-process/file-list',
                component: '@/pages/TaskProcess/FileList',
                meta: {
                    title: '文件列表',
                    requireAuth: true,
                    hidden: true,
                },
            },
            {
                path: '/message/:id',
                component: '@/pages/Message/MessageDetail',
                meta: {
                    title: '消息详情',
                    requireAuth: true,
                    hidden: true,
                },
            },
            {
                path: '/profile/edit',
                component: '@/pages/Profile/EditProfile',
                meta: {
                    title: '编辑资料',
                    requireAuth: true,
                    hidden: true,
                },
            },
        ],
    },

    // 错误页面
    {
        path: '/404',
        component: '@/pages/NotFound/NotFound',
        layout: false,
        meta: {
            title: '页面不存在',
            requireAuth: false,
            hidden: true,
        },
    },
    {
        path: '/403',
        component: '@/pages/Error/Forbidden',
        layout: false,
        meta: {
            title: '访问被拒绝',
            requireAuth: false,
            hidden: true,
        },
    },
    {
        path: '/500',
        component: '@/pages/Error/ServerError',
        layout: false,
        meta: {
            title: '服务器错误',
            requireAuth: false,
            hidden: true,
        },
    },

    // 通配符路由 - 必须放在最后
    {
        path: '*',
        redirect: '/404',
    },
]

// 获取Tab bar路由
export const getTabRoutes = () => {
    return routeConfig.tabRoutes
}

// 检查路由是否需要认证
export const isAuthRequired = (pathname: string): boolean => {
    return !routeConfig.publicRoutes.includes(pathname)
}

// 获取路由元信息
export const getRouteMeta = (pathname: string) => {
    const findRouteMeta = (routes: RouteConfig[]): any => {
        for (const route of routes) {
            if (route.path === pathname) {
                return route.meta
            }
            if (route.routes) {
                const meta = findRouteMeta(route.routes)
                if (meta) return meta
            }
        }
        return null
    }

    return findRouteMeta(routes)
}

// 获取页面标题
export const getPageTitle = (pathname: string): string => {
    const meta = getRouteMeta(pathname)
    return meta?.title || routeConfig.tabRoutes.find(tab => tab.path === pathname)?.title || '移动端工作台'
}

export default routes
