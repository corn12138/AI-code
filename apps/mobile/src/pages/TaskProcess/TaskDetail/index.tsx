/**
 * 任务详情页面
 * 包含任务信息展示、流程记录、流程处理等功能
 * 支持移动端和平板端的自适应布局
 */

import { TaskPriority, TaskStatus } from '@/stores/taskProcess/types'
import { useTaskProcessStore } from '@/stores/taskProcessStore'
import {
    ActionSheet,
    Button,
    Card,
    FloatingBubble,
    NavBar,
    SpinLoading,
    Tabs,
    Toast
} from 'antd-mobile'
import {
    CheckCircleOutline,
    CloseCircleOutline,
    ExclamationCircleOutline,
    LeftOutline,
    SendOutline
} from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { history, useParams } from 'umi'

import ProcessPanel from './components/ProcessPanel'
import ProcessRecord from './components/ProcessRecord'
import TaskInfo from './components/TaskInfo'
import './index.css'

// 状态配置
const statusConfig = {
    [TaskStatus.PENDING]: { text: '待处理', color: '#faad14', icon: <ExclamationCircleOutline /> },
    [TaskStatus.PROCESSING]: { text: '处理中', color: '#1890ff', icon: <ExclamationCircleOutline /> },
    [TaskStatus.COMPLETED]: { text: '已完成', color: '#52c41a', icon: <CheckCircleOutline /> },
    [TaskStatus.REJECTED]: { text: '已驳回', color: '#f5222d', icon: <CloseCircleOutline /> },
    [TaskStatus.CANCELLED]: { text: '已取消', color: '#999', icon: <ExclamationCircleOutline /> }
}

// 优先级配置
const priorityConfig = {
    [TaskPriority.LOW]: { text: '低', color: '#52c41a' },
    [TaskPriority.NORMAL]: { text: '一般', color: '#1890ff' },
    [TaskPriority.HIGH]: { text: '高', color: '#faad14' },
    [TaskPriority.URGENT]: { text: '紧急', color: '#f5222d' }
}

// Tab配置（暂时保留以备后续使用）
// const tabItems = [
//     { key: 'info', title: '任务信息' },
//     { key: 'record', title: '流程记录' },
//     { key: 'process', title: '流程处理' }
// ]

const TaskDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const {
        state: {
            currentTask,
            processRecords,
            taskDetailLoading: loading,
            selectedTaskInfo
        },
        loadTaskDetail,
        loadProcessRecords,
        submitProcess
    } = useTaskProcessStore()

    const [activeTab, setActiveTab] = useState('info')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showActionSheet, setShowActionSheet] = useState(false)
    const [isTabletView, setIsTabletView] = useState(false)

    // 检测设备尺寸
    useEffect(() => {
        const checkViewport = () => {
            setIsTabletView(window.innerWidth >= 768)
        }

        checkViewport()
        window.addEventListener('resize', checkViewport)
        return () => window.removeEventListener('resize', checkViewport)
    }, [])

    // 加载任务详情
    useEffect(() => {
        if (id) {
            loadTaskDetailData()
        }
    }, [id])

    const loadTaskDetailData = async () => {
        if (!id) return

        try {
            // 从状态管理获取任务基础信息（从列表页传递过来的完整数据）
            const selectedTask = selectedTaskInfo

            console.log('📋 获取选中任务信息:', selectedTask)

            // 根据任务ID和基础信息中的关键字段请求详细数据
            await loadTaskDetail(id, {
                currentStepId: selectedTask?.currentStepId || selectedTask?.currentStep,
                currentOrgId: selectedTask?.currentOrgId || selectedTask?.applicantDept,
                processTypeId: selectedTask?.processTypeId || selectedTask?.type
            })

            console.log('✅ 任务详情加载完成')
        } catch (error) {
            console.error('❌ 加载任务详情失败:', error)
            Toast.show({
                content: '加载失败，请重试',
                icon: 'fail'
            })
        }
    }

    // 保存草稿
    const handleSaveDraft = async () => {
        if (!currentTask) return

        try {
            setIsSubmitting(true)

            // 获取当前表单数据
            const success = await saveDraft({
                taskId: currentTask.id,
                formData: {}, // 这里应该收集表单数据
                opinion: '' // 当前意见
            })

            if (success) {
                Toast.show({
                    content: '草稿保存成功',
                    icon: 'success'
                })
            }
        } catch (error) {
            console.error('保存草稿失败:', error)
            Toast.show({
                content: '保存失败，请重试',
                icon: 'fail'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // 提交处理
    const handleSubmitProcess = async () => {
        if (!currentTask) return

        // 切换到流程处理tab并显示处理表单
        setActiveTab('process')

        Toast.show({
            content: '请在流程处理页面完成相关信息填写',
            icon: 'info'
        })
    }

    // 处理任务操作
    const handleTaskAction = async (action: 'approve' | 'reject' | 'transfer' | 'complete') => {
        if (!currentTask) return

        try {
            setIsSubmitting(true)

            // 这里会打开相应的处理表单
            // 暂时模拟成功
            const success = await submitProcess({
                taskId: currentTask.id,
                action,
                opinion: '处理完成'
            })

            if (success) {
                Toast.show({
                    content: '操作成功',
                    icon: 'success'
                })

                // 刷新数据
                await loadTaskDetail(id!)
            }
        } catch (error) {
            console.error('操作失败:', error)
            Toast.show({
                content: '操作失败，请重试',
                icon: 'fail'
            })
        } finally {
            setIsSubmitting(false)
            setShowActionSheet(false)
        }
    }

    // 操作按钮配置
    const actionSheetActions = [
        {
            key: 'approve',
            text: '同意',
            color: 'primary',
            disabled: currentTask?.status !== TaskStatus.PENDING
        },
        {
            key: 'reject',
            text: '驳回',
            color: 'danger',
            disabled: currentTask?.status !== TaskStatus.PENDING
        },
        {
            key: 'transfer',
            text: '转办',
            disabled: currentTask?.status === TaskStatus.COMPLETED
        },
        {
            key: 'draft',
            text: '保存草稿'
        }
    ]

    // 渲染导航栏
    const renderNavBar = () => (
        <NavBar
            className="task-detail-nav"
            onBack={() => history.back()}
            backIcon={<LeftOutline />}
            right={
                <Button
                    fill="none"
                    className="nav-action-btn"
                    onClick={() => setShowActionSheet(true)}
                >
                    {/* <MoreOutline /> */}
                </Button>
            }
        >
            <div className="nav-title">
                {/* <span className="task-type">{currentTask?.type || '任务详情'}</span> */}
                <span className="task-type">{'任务详情'}</span>
                {currentTask && (
                    <div className="nav-subtitle">
                        {/* {statusConfig[currentTask.status]?.icon} */}
                        {/* <span>{statusConfig[currentTask.status]?.text}</span> */}
                    </div>
                )}
            </div>
        </NavBar>
    )

    // 渲染任务头部信息
    const renderTaskHeader = () => {
        if (!currentTask) return null

        const statusInfo = statusConfig[currentTask.status]
        const priorityInfo = priorityConfig[currentTask.priority]
        const isOverdue = currentTask.deadline && new Date(currentTask.deadline) < new Date()

        return (
            <Card className="task-header-card">
                <div className="task-header-content">
                    <div className="task-main-info">
                        <h1 className="task-title">{currentTask.title}</h1>
                        {/* <div className="task-meta">
                            <Space wrap>
                                <Tag color={statusInfo.color}>
                                    {statusInfo.icon}
                                    {statusInfo.text}
                                </Tag>
                                <Tag color={priorityInfo.color}>
                                    {priorityInfo.text}
                                </Tag>
                                {isOverdue && (
                                    <Tag color="#ff4d4f">已超期</Tag>
                                )}
                            </Space>
                        </div> */}
                        <div className="task-basic-info">
                            <div className="info-item">
                                <span className="label">流程发起人：</span>
                                <span className="value">{currentTask.title}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">所在部门：</span>
                                <span className="value">{currentTask.applicant}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">发起时间：</span>
                                <span className="value">{currentTask.applicantDept}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">当前处理人：</span>
                                <span className="value">{currentTask.currentStep}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">当前步骤：</span>
                                <span className="value">{currentTask.currentStep}</span>
                            </div>
                            {currentTask.deadline && (
                                <div className="info-item">
                                    <span className="label">截止时间：</span>
                                    <span className={`value ${isOverdue ? 'overdue' : ''}`}>
                                        {new Date(currentTask.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    // 渲染移动端Tab内容
    const renderMobileContent = () => (
        <div className="mobile-content">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="detail-tabs"
            >
                <Tabs.Tab title="报告信息" key="info">
                    <TaskInfo task={currentTask} />
                </Tabs.Tab>
                <Tabs.Tab title="流程记录" key="record">
                    <ProcessRecord records={processRecords} />
                </Tabs.Tab>
                <Tabs.Tab title="流程处理" key="process">
                    <ProcessPanel task={currentTask} />
                </Tabs.Tab>
            </Tabs>
        </div>
    )

    // 渲染平板端内容 - 保持Tab一致性
    const renderTabletContent = () => (
        <div className="tablet-content">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="detail-tabs tablet-tabs"
            >
                <Tabs.Tab title="报告信息" key="info">
                    <div className="tablet-tab-content">
                        <div className="main-content">
                            <TaskInfo task={currentTask} />
                        </div>
                        {/* 在任务信息Tab中，平板端可以显示快速操作面板 */}
                        {/* <div className="quick-actions-panel">
                            <Card className="quick-actions-card" title="快速操作">
                                <div className="quick-action-buttons">
                                    <Button
                                        color="primary"
                                        size="small"
                                        onClick={() => setActiveTab('process')}
                                    >
                                        流程处理
                                    </Button>
                                    <Button
                                        fill="outline"
                                        size="small"
                                        onClick={() => setActiveTab('records')}
                                    >
                                        查看记录
                                    </Button>
                                </div>
                            </Card>
                        </div> */}
                    </div>
                </Tabs.Tab>
                <Tabs.Tab title="流程记录" key="records">
                    <div className="tablet-tab-content single-column">
                        <ProcessRecord records={processRecords} />
                    </div>
                </Tabs.Tab>
                <Tabs.Tab title="流程处理" key="process">
                    <div className="tablet-tab-content single-column">
                        <ProcessPanel task={currentTask} />
                    </div>
                </Tabs.Tab>
            </Tabs>
        </div>
    )

    // 渲染底部操作栏 (仅移动端) - 仅在任务信息Tab显示
    const renderBottomActions = () => {
        // 注释掉底部按钮，用户觉得别扭
        return null

        // if (isTabletView || !currentTask || currentTask.status === TaskStatus.COMPLETED || activeTab !== 'info') {
        //     return null
        // }

        // return (
        //     <div className="bottom-actions">
        //         <Space>
        //             <Button
        //                 size="large"
        //                 fill="outline"
        //                 onClick={() => setActiveTab('process')}
        //                 disabled={isSubmitting}
        //             >
        //                 <SendOutline />
        //                 流程处理
        //             </Button>
        //             <Button
        //                 size="large"
        //                 color="primary"
        //                 onClick={() => setActiveTab('records')}
        //                 disabled={isSubmitting}
        //             >
        //                 <TeamOutline />
        //                 查看记录
        //             </Button>
        //         </Space>
        //     </div>
        // )
    }

    // 渲染浮动操作按钮 (平板端) - 不在流程处理Tab显示
    const renderFloatingButton = () => {
        if (!isTabletView || !currentTask || currentTask.status === TaskStatus.COMPLETED || activeTab === 'process') {
            return null
        }

        return (
            <FloatingBubble
                style={{
                    '--initial-position-bottom': '24px',
                    '--initial-position-right': '24px',
                    '--edge-distance': '24px'
                }}
                onClick={() => setShowActionSheet(true)}
            >
                <SendOutline fontSize={24} />
            </FloatingBubble>
        )
    }

    if (loading && !currentTask) {
        return (
            <div className="task-detail-loading">
                <SpinLoading style={{ '--size': '48px' }} />
                <span>加载中...</span>
            </div>
        )
    }

    if (!currentTask) {
        return (
            <div className="task-detail-error">
                <div className="error-content">
                    <ExclamationCircleOutline style={{ fontSize: 48, color: '#ccc' }} />
                    <p>任务不存在或已被删除</p>
                    <Button onClick={() => history.back()}>返回</Button>
                </div>
            </div>
        )
    }

    return (
        <div className={`task-detail-page ${isTabletView ? 'tablet-view' : 'mobile-view'}`}>
            {renderNavBar()}

            <div className="page-content">
                {renderTaskHeader()}
                {isTabletView ? renderTabletContent() : renderMobileContent()}
            </div>

            {renderBottomActions()}
            {renderFloatingButton()}

            {/* 操作菜单 */}
            <ActionSheet
                visible={showActionSheet}
                actions={actionSheetActions}
                onClose={() => setShowActionSheet(false)}
                onAction={(action) => {
                    if (action.key === 'draft') {
                        // TODO: 实现保存草稿功能
                        Toast.show({
                            content: '保存草稿功能待实现',
                            icon: 'success'
                        })
                    } else {
                        handleTaskAction(action.key as 'approve' | 'reject' | 'transfer' | 'complete')
                    }
                }}
                cancelText="取消"
            />
        </div>
    )
}

export default TaskDetail
