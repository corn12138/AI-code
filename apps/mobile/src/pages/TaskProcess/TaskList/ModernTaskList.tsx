/**
 * 现代CSS响应式设计示例
 * 展示如何使用最新的CSS特性替代传统@media查询
 */

import { TaskItem, TaskStatus } from '@/stores/taskProcess/types'
import { Card, Space, Tag } from 'antd-mobile'
import React from 'react'
import './ModernTaskList.css'

interface ModernTaskListProps {
    tasks: TaskItem[]
    onTaskClick: (task: TaskItem) => void
}

const ModernTaskList: React.FC<ModernTaskListProps> = ({ tasks, onTaskClick }) => {
    const getStatusInfo = (status: TaskStatus) => {
        const statusMap = {
            [TaskStatus.PENDING]: { text: '待处理', color: '#fa8c16', icon: '⏳' },
            [TaskStatus.IN_PROGRESS]: { text: '处理中', color: '#1890ff', icon: '🔄' },
            [TaskStatus.COMPLETED]: { text: '已完成', color: '#52c41a', icon: '✅' },
            [TaskStatus.REJECTED]: { text: '已驳回', color: '#ff4d4f', icon: '❌' }
        }
        return statusMap[status] || statusMap[TaskStatus.PENDING]
    }

    const renderTaskCard = (task: TaskItem) => {
        const statusInfo = getStatusInfo(task.status)
        const isOverdue = task.deadline && new Date(task.deadline) < new Date()

        return (
            <Card
                key={task.id}
                className="task-card-modern"
                onClick={() => onTaskClick(task)}
            >
                <div className="task-header-modern">
                    <div className="task-title-row-modern">
                        <Tag className="task-type-tag-modern" color="blue">
                            {task.type}
                        </Tag>
                        <h3 className="task-title-modern">{task.title}</h3>
                    </div>
                    <Space className="task-status-modern">
                        <Tag
                            color={statusInfo.color}
                            className="status-tag-modern"
                        >
                            {statusInfo.icon} {statusInfo.text}
                        </Tag>
                        {task.priority === 'high' && (
                            <Tag color="red" className="priority-tag-modern">
                                🔥 紧急
                            </Tag>
                        )}
                    </Space>
                </div>

                <div className="task-content-modern">
                    <div className="task-info-grid-modern">
                        <div className="task-info-item-modern">
                            <span className="info-label-modern">流程编号</span>
                            <span className="info-value-modern">{task.processCode}</span>
                        </div>
                        <div className="task-info-item-modern">
                            <span className="info-label-modern">申请人</span>
                            <span className="info-value-modern">{task.applicant}</span>
                        </div>
                        <div className="task-info-item-modern">
                            <span className="info-label-modern">申请部门</span>
                            <span className="info-value-modern">{task.applicantDept}</span>
                        </div>
                        <div className="task-info-item-modern">
                            <span className="info-label-modern">当前步骤</span>
                            <span className="info-value-modern">{task.currentStep}</span>
                        </div>
                    </div>

                    {task.deadline && (
                        <div className="task-deadline-modern">
                            <span className="deadline-label-modern">截止时间</span>
                            <span className={`deadline-value-modern ${isOverdue ? 'overdue' : ''}`}>
                                {task.deadline}
                            </span>
                        </div>
                    )}
                </div>

                <div className="task-footer-modern">
                    <div className="status-indicator-modern" style={{ color: statusInfo.color }}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                    </div>
                    <div className="task-action-modern">
                        <span className="action-text-modern">点击查看详情</span>
                        <span className="action-arrow-modern">→</span>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="modern-task-list">
            {/* 使用现代CSS特性的容器 */}
            <div className="task-container">
                {/* 方案1: Container Queries网格 */}
                <div className="task-grid-modern">
                    {tasks.map(renderTaskCard)}
                </div>

                {/* 方案2: 自适应网格（无媒体查询） */}
                {/* <div className="task-grid-auto">
                    {tasks.map(renderTaskCard)}
                </div> */}

                {/* 方案3: 现代Flexbox布局 */}
                {/* <div className="task-layout-modern">
                    {tasks.map(task => (
                        <div key={task.id} className="task-item-modern">
                            {renderTaskCard(task)}
                        </div>
                    ))}
                </div> */}
            </div>
        </div>
    )
}

export default ModernTaskList
