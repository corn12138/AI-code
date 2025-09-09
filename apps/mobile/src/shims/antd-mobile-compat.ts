// 兼容 antd-mobile 历史导出（直连 ES 构建，避免 alias 自引用）
export * from 'antd-mobile/es'

// 为历史代码提供别名：Spin -> SpinLoading
export { SpinLoading as Spin } from 'antd-mobile/es'
