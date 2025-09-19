import React, { ReactNode } from 'react'
import { TaskProcessProvider } from './taskProcessStore'
import { UserProvider } from './userStore'

interface AppStoreProviderProps {
    children: ReactNode
}

// 统一的应用级 Provider 入口
// 未来如新增其它模块（如 AuthStoreProvider / SettingsStoreProvider ...）
// 只需在此处按顺序包裹一次即可
const AppStoreProvider: React.FC<AppStoreProviderProps> = ({ children }) => {
    return (
        <UserProvider>
            <TaskProcessProvider>
                {children}
            </TaskProcessProvider>
        </UserProvider>
    )
}

export default AppStoreProvider


