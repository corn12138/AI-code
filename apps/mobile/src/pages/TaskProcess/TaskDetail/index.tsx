import { useTaskProcessStore } from '@/stores/taskProcessStore'
import {
    Button,
    Card,
    NavBar,
    SpinLoading,
    Tabs
} from 'antd-mobile'
import {
    ClockCircleOutline,
    ExclamationCircleOutline,
    LeftOutline
} from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { history, useParams } from 'umi'
import ProcessPanel from './components/ProcessPanel'
import ProcessRecord from './components/ProcessRecord'
import TaskInfo from './components/TaskInfo'
import './index.css'

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
        submitProcess
    } = useTaskProcessStore()

    const [activeTab, setActiveTab] = useState('info')

    useEffect(() => {
        if (id) {
            loadTaskDetailData()
        }
    }, [id])


    const loadTaskDetailData = async () => {
        if (!id) return

        try {
            // 使用选中的任务信息作为上下文数据
            const selectedTask = selectedTaskInfo
            console.log('📋 获取选中任务信息:', selectedTask)

            await loadTaskDetail(id, {
                currentStepId: selectedTask?.currentStep,
                currentOrgId: selectedTask?.applicantDept,
                processTypeId: selectedTask?.type
            })

            console.log('✅ 任务详情加载完成')
        } catch (error) {
            console.error('❌ 任务详情加载失败:', error)
        }
    }

    const handleSaveDraft = async () => {
        // TODO: 保存草稿逻辑
        console.log('💾 保存草稿')
    }

    const handleSubmitProcess = async () => {
        // TODO: 提交处理逻辑
        console.log('📤 提交处理')
    }

    // 渲染浮动按钮 - 注释掉星星按钮
    // const renderFloatingButton = () => (
    //     <FloatingBubble
    //         className="floating-button"
    //         onClick={() => console.log('🔗 分享任务')}
    //     >
    //         ⭐
    //     </FloatingBubble>
    // )

    // 渲染底部操作按钮
    const renderBottomActions = () => (
        <div className="bottom-actions">
            <Button
                color="default"
                onClick={() => setActiveTab('process')}
            >
                流程处理
            </Button>
            <Button
                color="primary"
                onClick={() => setActiveTab('record')}
            >
                查看记录
            </Button>
        </div>
    )

    // 渲染任务头部卡片
    const renderTaskHeader = () => {
        const task = currentTask || selectedTaskInfo
        if (!task) return null

        return (
            <Card className="task-header-card">
                <div className="task-type">
                    {task.type || '流程审批申请'}
                </div>
                <div className="task-title">
                    {task.title || '报告申请 - 差旅费用报销'}
                </div>
                <div className="task-meta-row">
                    <div className="task-meta-item">
                        <ClockCircleOutline />
                        <span>流程发起人：{task.applicant || '张三'}</span>
                    </div>
                    <div className="task-meta-item">
                        <span>所在部门：{task.applicantDept || '技术部'}</span>
                    </div>
                </div>
                <div className="task-meta-row">
                    <div className="task-meta-item">
                        <span>当前处理人：{task.currentHandler || '李四'}</span>
                    </div>
                    <div className="task-meta-item">
                        <span>当前步骤：{task.currentStep || '复审'}</span>
                    </div>
                </div>
                <div className="task-meta-row">
                    <div className="task-meta-item">
                        <span>发起时间：2025/01/07</span>
                    </div>
                    <div className="task-meta-item">
                        <span>截止时间：2024/12/11</span>
                    </div>
                </div>
            </Card>
        )
    }

    if (loading) {
        return (
            <div className="task-detail-page">
                <NavBar
                    className="task-detail-nav"
                    onBack={() => history.back()}
                    backIcon={<LeftOutline />}
                >
                    任务详情
                </NavBar>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh'
                }}>
                    <SpinLoading />
                </div>
            </div>
        )
    }

    if (!currentTask && !selectedTaskInfo) {
        return (
            <div className="task-detail-page">
                <NavBar
                    className="task-detail-nav"
                    onBack={() => history.back()}
                    backIcon={<LeftOutline />}
                >
                    任务详情
                </NavBar>
                <div className="task-detail-error">
                    <div className="error-content">
                        <ExclamationCircleOutline style={{ fontSize: 48, color: '#999' }} />
                        <p>任务不存在或已被删除</p>
                        <Button onClick={() => history.back()}>返回</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="task-detail-page">
            <NavBar
                className="task-detail-nav"
                onBack={() => history.back()}
                backIcon={<LeftOutline />}
            >
                任务详情
            </NavBar>

            {renderTaskHeader()}

            <Tabs
                className="detail-tabs"
                activeKey={activeTab}
                onChange={setActiveTab}
            >
                <Tabs.Tab title="报告信息" key="info">
                    <TaskInfo task={currentTask || selectedTaskInfo} />
                </Tabs.Tab>
                <Tabs.Tab title="流程记录" key="record">
                    <ProcessRecord
                        taskId={id || ''}
                        records={processRecords || []}
                    />
                </Tabs.Tab>
                <Tabs.Tab title="流程处理" key="process">
                    <ProcessPanel
                        task={currentTask || selectedTaskInfo}
                        onSubmit={submitProcess}
                    />
                </Tabs.Tab>
            </Tabs>

            {activeTab === 'info' && renderBottomActions()}
            {/* {renderFloatingButton()} */}
        </div>
    )
}

export default TaskDetail