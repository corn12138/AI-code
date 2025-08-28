/**
 * Toast容器组件
 * 使用Zustand状态管理显示全局Toast消息
 */

import { useUIStore } from '@/stores/ui/useUIStore'
import { Toast } from 'antd-mobile'
import React from 'react'

const ToastContainer: React.FC = () => {
    const { toasts, hideToast } = useUIStore()

    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    content={toast.message}
                    position="top"
                    visible={true}
                    onClose={() => hideToast(toast.id)}
                    duration={toast.duration}
                />
            ))}
        </>
    )
}

export default ToastContainer
