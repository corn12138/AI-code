/**
 * Hooks导出文件
 * 统一导出所有自定义hooks
 */

// 设备信息检测
export { default as useDeviceInfo } from './useDeviceInfo'

// 路由缓存管理
export {
    default as useRouteCache, useTaskDetailCache, useTaskListCache
} from './useRouteCache'

// 任务流程处理
export { default as useTaskProcess } from './useTaskProcess'

// 表单验证
export {
    commonRules, default as useFormValidation
} from './useFormValidation'

// 响应式设计
export { default as useResponsiveDesign } from './useResponsiveDesign'

// 导出类型定义
export type {
    // 路由缓存相关类型
    CacheItem,
    RouteCacheOptions
} from './useRouteCache'

export type {
    // 任务流程相关类型
    UseTaskProcessOptions
} from './useTaskProcess'

export type {
    UseFormValidationOptions, ValidationError,
    // 表单验证相关类型
    ValidationRule,
    ValidationRules
} from './useFormValidation'

export type {
    DeviceFeatures, SafeAreaInsets,
    // 响应式设计相关类型
    ViewportInfo
} from './useResponsiveDesign'

