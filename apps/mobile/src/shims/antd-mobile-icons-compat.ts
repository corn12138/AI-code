// 兼容导出：补齐历史代码中使用但新版未提供的图标名
// 直连 ES 构建，避免 alias 自引用
export * from 'antd-mobile-icons/es'

// 别名映射（选择相近图标占位，避免构建失败）
export { InformationCircleOutline as InfoCircleOutline } from 'antd-mobile-icons/es'
export { ClockCircleOutline as ClockOutline } from 'antd-mobile-icons/es'
export { FileOutline as DocumentOutline } from 'antd-mobile-icons/es'
export { StarOutline as SpeedOutline } from 'antd-mobile-icons/es'
export { AppOutline as DeviceOutline } from 'antd-mobile-icons/es'
export { StarOutline as MoonOutline } from 'antd-mobile-icons/es'
