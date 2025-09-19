/**
 * 状态管理架构演示组件
 * 展示统一状态管理架构的效果
 */

import { useTaskProcessStore } from '@/stores/taskProcessStore'
import { useUserStore } from '@/stores/userStore'
import { Button, Card, Space, Toast } from 'antd-mobile'
import React, { useEffect } from 'react'

const StoreDemo: React.FC = () => {
    const taskStore = useTaskProcessStore()
    const userStore = useUserStore()

    useEffect(() => {
        // 演示：同时使用两个不同的状态管理
        console.log('🎯 演示统一状态管理架构')
        console.log('📋 TaskProcess Store:', taskStore.state)
        console.log('👤 User Store:', userStore.state)
    }, [])

    const handleLoadUser = async () => {
        try {
            await userStore.loadCurrentUser()
            Toast.show('用户信息加载成功')
        } catch (error) {
            Toast.show('用户信息加载失败')
        }
    }

    const handleLoadUserProfile = async () => {
        try {
            await userStore.loadUserProfile('1')
            Toast.show('用户档案加载成功')
        } catch (error) {
            Toast.show('用户档案加载失败')
        }
    }

    const handleUpdateTheme = () => {
        const newTheme = userStore.state.userPreferences.theme === 'light' ? 'dark' : 'light'
        userStore.updatePreferences({ theme: newTheme })
        Toast.show(`主题已切换为: ${newTheme}`)
    }

    const handleLoadTaskList = async () => {
        try {
            await taskStore.loadTaskList(true)
            Toast.show('任务列表加载成功')
        } catch (error) {
            Toast.show('任务列表加载失败')
        }
    }

    const handleLoadOrganizations = async () => {
        try {
            await taskStore.loadOrganizations()
            Toast.show('组织机构加载成功')
        } catch (error) {
            Toast.show('组织机构加载失败')
        }
    }

    return (
        <div style={{ padding: '16px' }}>
            <h2>🎯 统一状态管理架构演示</h2>

            <Card title="👤 用户状态管理 (UserStore)" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <strong>当前用户:</strong> {userStore.state.currentUser?.name || '未登录'}
                    </div>
                    <div>
                        <strong>主题:</strong> {userStore.state.userPreferences.theme}
                    </div>
                    <div>
                        <strong>语言:</strong> {userStore.state.userPreferences.language}
                    </div>
                    <div>
                        <strong>通知:</strong> {userStore.state.userPreferences.notifications ? '开启' : '关闭'}
                    </div>

                    <Space wrap>
                        <Button
                            size="small"
                            onClick={handleLoadUser}
                            loading={userStore.state.userLoading}
                        >
                            加载用户信息
                        </Button>
                        <Button
                            size="small"
                            onClick={handleLoadUserProfile}
                            loading={userStore.state.profileLoading}
                        >
                            加载用户档案
                        </Button>
                        <Button size="small" onClick={handleUpdateTheme}>
                            切换主题
                        </Button>
                        <Button size="small" onClick={userStore.logout}>
                            登出
                        </Button>
                    </Space>
                </Space>
            </Card>

            <Card title="📋 任务处理状态管理 (TaskProcessStore)" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <strong>任务数量:</strong> {taskStore.state.tasks.length}
                    </div>
                    <div>
                        <strong>当前任务:</strong> {taskStore.state.currentTask?.title || '无'}
                    </div>
                    <div>
                        <strong>组织机构数量:</strong> {taskStore.state.organizations.length}
                    </div>
                    <div>
                        <strong>流程记录数量:</strong> {taskStore.state.processRecords.length}
                    </div>

                    <Space wrap>
                        <Button
                            size="small"
                            onClick={handleLoadTaskList}
                            loading={taskStore.state.taskLoading}
                        >
                            加载任务列表
                        </Button>
                        <Button
                            size="small"
                            onClick={handleLoadOrganizations}
                            loading={taskStore.state.orgLoading}
                        >
                            加载组织机构
                        </Button>
                        <Button
                            size="small"
                            onClick={() => taskStore.resetTaskList()}
                        >
                            重置任务列表
                        </Button>
                    </Space>
                </Space>
            </Card>

            <Card title="🏗️ 架构优势">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>✅ <strong>统一入口:</strong> 只需在 AppStoreProvider 中包裹一次</div>
                    <div>✅ <strong>模块化:</strong> 每个业务模块独立的状态管理</div>
                    <div>✅ <strong>可扩展:</strong> 新增模块只需在 AppStoreProvider 中添加</div>
                    <div>✅ <strong>类型安全:</strong> 完整的 TypeScript 支持</div>
                    <div>✅ <strong>测试友好:</strong> 每个模块都有独立的测试</div>
                    <div>✅ <strong>无依赖:</strong> 不依赖外部状态管理库</div>
                </Space>
            </Card>
        </div>
    )
}

export default StoreDemo
