/**
 * 流程记录组件
 * 展示任务的历史处理记录，以时间线形式呈现
 */

import { ProcessRecord as ProcessRecordType } from '@/stores/taskProcess/types'
import {
    Button,
    Toast
} from 'antd-mobile'
import {
    CheckCircleOutline,
    ClockCircleOutline,
    CloseCircleOutline,
    ExclamationCircleOutline,
    FileOutline,
    RightOutline,
    UserOutline
} from 'antd-mobile-icons'
import React, { useState } from 'react'
import './ProcessRecord.css'

interface ProcessRecordProps {
    records: ProcessRecordType[]
}

// 操作类型配置
const actionConfig = {
    '提交申请': { color: '#1890ff', icon: <CheckCircleOutline /> },
    '初审通过': { color: '#52c41a', icon: <CheckCircleOutline /> },
    '复审通过': { color: '#52c41a', icon: <CheckCircleOutline /> },
    '终审通过': { color: '#52c41a', icon: <CheckCircleOutline /> },
    '驳回': { color: '#ff4d4f', icon: <CloseCircleOutline /> },
    '转办': { color: '#faad14', icon: <ExclamationCircleOutline /> },
    '知悉': { color: '#722ed1', icon: <ExclamationCircleOutline /> },
    '撤回': { color: '#8c8c8c', icon: <ExclamationCircleOutline /> }
}

const ProcessRecord: React.FC<ProcessRecordProps> = ({ records }) => {
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())


    // 切换用户列表展开状态
    const toggleUsersExpand = (recordId: string) => {
        const newExpanded = new Set(expandedUsers)
        if (newExpanded.has(recordId)) {
            newExpanded.delete(recordId)
        } else {
            newExpanded.add(recordId)
        }
        setExpandedUsers(newExpanded)
    }

    // 复制意见内容
    const copyOpinion = async (opinion: string) => {
        try {
            await navigator.clipboard.writeText(opinion)
            Toast.show({
                content: '复制成功',
                icon: 'success',
                duration: 1000
            })
        } catch (error) {
            console.error('复制失败:', error)
            Toast.show({
                content: '复制失败',
                icon: 'fail',
                duration: 1000
            })
        }
    }

    // 截断文本
    const truncateText = (text: string, maxLength: number = 30) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    // 渲染用户列表（支持折叠展开）
    const renderUserList = (users: string[], recordId: string, label: string, maxVisible: number = 2) => {
        if (!users || users.length === 0) return null

        const isExpanded = expandedUsers.has(recordId + label)
        const displayUsers = isExpanded ? users : users.slice(0, maxVisible)
        const hasMore = users.length > maxVisible

        return (
            <div className="user-list-container">
                <div className="user-list-header">
                    <span className="user-list-label">{label}：</span>
                    {hasMore && (
                        <span
                            className="expand-toggle"
                            onClick={() => toggleUsersExpand(recordId + label)}
                        >
                            {isExpanded ? '收起' : `展开${users.length}位`}
                            <RightOutline className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                        </span>
                    )}
                </div>
                <div className="user-list">
                    {displayUsers.map((user, index) => (
                        <div key={index} className="user-item">
                            <UserOutline className="user-icon" />
                            <span className="user-name">{user}</span>
                            <span className="user-id">123456</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }





    // 如果没有记录数据，使用模拟数据展示效果
    const mockRecords = !records || records.length === 0 ? [
        {
            id: '1',
            taskId: 'task-1',
            action: '审核',
            step: '部门审核',
            handler: '章某某',
            handlerName: '章某某',
            department: '兴业数金技术服务中心/数字化设计团队',
            createdAt: '2023-12-15T16:39:20Z',
            comment: '请审核',
            attachments: ['附件1.pdf', '附件2.docx'],
            status: 'processing' as const // 当前正在处理的节点
        },
        {
            id: '2',
            taskId: 'task-1',
            action: '审核',
            step: '初步审核',
            handler: '章某某',
            handlerName: '章某某',
            department: '兴业数金技术服务中心/数字化设计团队',
            createdAt: '2023-12-15T15:30:15Z',
            comment: '同意通过，材料齐全，符合要求。',
            attachments: [],
            status: 'completed' as const // 已完成的节点
        },
        {
            id: '3',
            taskId: 'task-1',
            action: '拟稿',
            step: '起草文件',
            handler: '章某某',
            handlerName: '章某某',
            department: '兴业数金技术服务中心/数字化设计团队',
            createdAt: '2023-12-15T14:25:10Z',
            comment: '请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核',
            attachments: ['相关材料.xlsx'],
            status: 'completed' as const // 已完成的节点
        }
    ] as ProcessRecordType[] : records

    if (mockRecords.length === 0) {
        return (
            <div className="process-record-container">
                <div className="empty-records">
                    <ClockCircleOutline style={{ fontSize: 48, color: '#ccc' }} />
                    <p>暂无流程记录</p>
                </div>
            </div>
        )
    }

    // 按时间倒序排列
    const sortedRecords = [...mockRecords].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return (
        <div className="process-record-container">
            {/* 当前处理信息 */}
            <div className="current-process-info">
                <div className="current-step">
                    <span className="step-label">当前处理步骤：</span>
                    <span className="step-value">部门审核</span>
                </div>
                <div className="current-handlers">
                    {renderUserList([
                        '张某某', '李某某', '王某某', '赵某某', '孙某某', '陈某某', '刘某某'
                    ], 'current', '当前处理人')}
                </div>
                <div className="notify-users">
                    {renderUserList([
                        '周某某', '吴某某', '郑某某', '王某某', '冯某某'
                    ], 'notify', '知悉人')}
                </div>
            </div>

            {/* 流程记录列表 */}
            <div className="process-timeline">
                {sortedRecords.map((record, index) => {
                    const config = actionConfig[record.action as keyof typeof actionConfig] || actionConfig['提交申请']
                    const isProcessing = record.status === 'processing' // 当前正在处理的节点
                    const isCompleted = record.status === 'completed' // 已完成的节点

                    return (
                        <div key={record.id} className={`timeline-item ${isProcessing ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}>
                            {/* 时间线左侧 */}
                            <div className="timeline-left">
                                <div className={`timeline-dot ${isProcessing ? 'processing' : ''} ${isCompleted ? 'completed' : ''}`} style={{ backgroundColor: config.color }}>
                                    {config.icon}
                                </div>
                                {index < sortedRecords.length - 1 && <div className="timeline-line" />}
                            </div>

                            {/* 时间线内容 */}
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className="timeline-action" style={{ color: config.color }}>
                                        {record.action}
                                        {isProcessing && <span className="current-badge">（会办）</span>}
                                        {isCompleted && <span className="completed-badge">（交办）</span>}
                                    </span>
                                    <span className="timeline-time">
                                        {isProcessing && <span className="meeting-record">会办记录</span>}
                                    </span>
                                </div>

                                <div className="timeline-body">
                                    <div className="handler-info">
                                        <div className="handler-header">
                                            <div className="handler-left">
                                                <UserOutline className="handler-icon" />
                                                <span className="handler-name">{record.handler}</span>
                                                <span className="handler-id">123456</span>
                                            </div>
                                            <div className="handler-right">
                                                <span className="handler-time">
                                                    {new Date(record.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="handler-department">
                                            兴业数金技术服务中心/数字化设计团队
                                        </div>
                                    </div>

                                    {/* 处理意见 */}
                                    {record.comment && (
                                        <div className="opinion-container">
                                            <div className="opinion-content">
                                                <span className="opinion-text">
                                                    {truncateText(record.comment)}
                                                </span>
                                                <Button
                                                    className="copy-btn"
                                                    fill="none"
                                                    size="mini"
                                                    onClick={() => copyOpinion(record.comment || '')}
                                                >
                                                    📋
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 附件 */}
                                    {record.attachments && record.attachments.length > 0 && (
                                        <div className="attachments-container">
                                            <FileOutline className="attachment-icon" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ProcessRecord
