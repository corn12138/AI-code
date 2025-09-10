import { useTaskProcessStore } from '@/stores/taskProcessStore'
import { Button, Toast } from 'antd-mobile'
import {
    RightOutline,
    TeamOutline,
    UserOutline
} from 'antd-mobile-icons'
import React, { useState } from 'react'
import { history } from 'umi'
import './ProcessRecord.css'

interface ProcessRecordProps {
    taskId: string
    records?: any[]
}

// 模拟当前处理信息数据
const mockCurrentProcessInfo = {
    currentStep: '部门审核',
    currentHandlers: [
        { id: '1', name: '张某某', userId: '123456' },
        { id: '2', name: '刘某某', userId: '123456' },
        { id: '3', name: '王某某', userId: '123456' },
        { id: '4', name: '孙某某', userId: '123456' },
        { id: '5', name: '张某某', userId: '123456' }
    ],
    notifyUsers: [
        { id: '1', name: '李某某', userId: '123456' },
        { id: '2', name: '赵某某', userId: '123456' },
        { id: '3', name: '周某某', userId: '123456' }
    ]
}

// 模拟流程记录数据
const mockProcessRecords = [
    {
        id: '1',
        step: '审核（会办）',
        status: 'current',
        handler: {
            name: '章某某',
            userId: '123456',
            department: '兴业数字技术服务中心/数字化设计团队',
            time: '2023-08-15 16:39:20'
        },
        opinion: '请审核',
        hasAttachments: false,
        isCurrent: true,
        // 添加子流程记录
        children: [
            {
                id: '1-1',
                step: '会办（提交会办结果）',
                handler: {
                    name: '章某某',
                    userId: '123456',
                    department: '兴业数字技术服务中心/数字化设计团队',
                    time: '2023-08-15 16:39:20'
                },
                opinion: '请审核请审核'
            },
            {
                id: '1-2',
                step: '会办（提交会办结果）',
                handler: {
                    name: '章某某',
                    userId: '123456',
                    department: '兴业数字技术服务中心/数字化设计团队',
                    time: '2023-08-15 16:39:20'
                },
                opinion: '请审核请审核'
            },
            {
                id: '1-3',
                step: '会办（提交会办结果）',
                handler: {
                    name: '章某某',
                    userId: '123456',
                    department: '兴业数字技术服务中心/数字化设计团队',
                    time: '2023-08-15 16:39:20'
                },
                opinion: '请审核请审核'
            },
            {
                id: '1-4',
                step: '会办（提交会办结果）',
                handler: {
                    name: '章某某',
                    userId: '123456',
                    department: '兴业数字技术服务中心/数字化设计团队',
                    time: '2023-08-15 16:39:20'
                },
                opinion: '请审核请审核'
            },
            {
                id: '1-5',
                step: '会办（提交会办结果）',
                handler: {
                    name: '章某某',
                    userId: '123456',
                    department: '兴业数字技术服务中心/数字化设计团队',
                    time: '2023-08-15 16:39:20'
                },
                opinion: '请审核请审核'
            }
        ]
    },
    {
        id: '2',
        step: '审核（交办）',
        status: 'completed',
        handler: {
            name: '章某某',
            userId: '123456',
            department: '兴业数字技术服务中心/数字化设计团队',
            time: '2023-08-15 16:39:20'
        },
        opinion: '请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核请审核',
        hasAttachments: true,
        isCurrent: false
    },
    {
        id: '3',
        step: '拟稿',
        status: 'completed',
        handler: {
            name: '章某某',
            userId: '123456',
            department: '兴业数字技术服务中心/数字化设计团队',
            time: '2023-08-15 16:39:20'
        },
        opinion: '请审核请审核',
        hasAttachments: false,
        isCurrent: false
    }
]

const ProcessRecord: React.FC<ProcessRecordProps> = ({ taskId }) => {
    const { setSubProcessData } = useTaskProcessStore()
    const [expandedHandlers, setExpandedHandlers] = useState(false)
    const [expandedNotifyUsers, setExpandedNotifyUsers] = useState(false)
    const [expandedOpinions, setExpandedOpinions] = useState<string[]>([])

    const toggleHandlersExpand = () => {
        setExpandedHandlers(!expandedHandlers)
    }

    const toggleNotifyUsersExpand = () => {
        setExpandedNotifyUsers(!expandedNotifyUsers)
    }

    const toggleOpinionExpand = (recordId: string) => {
        setExpandedOpinions(prev =>
            prev.includes(recordId)
                ? prev.filter(id => id !== recordId)
                : [...prev, recordId]
        )
    }

    const handleCopyOpinion = (opinion: string) => {
        navigator.clipboard.writeText(opinion).then(() => {
            Toast.show('复制成功')
        }).catch(() => {
            Toast.show('复制失败')
        })
    }

    // 跳转到子流程记录页面
    const handleViewSubProcess = (record: any) => {
        console.log('🔗 跳转到子流程记录页面:', record)
        // 使用状态管理存储子流程数据
        setSubProcessData(record, record.children || [])
        // 跳转到子流程记录页面
        history.push(`/task-process/sub-records/${record.id}`)
    }

    // 渲染当前处理信息 - 参考ui2.jpg顶部信息
    const renderCurrentProcessInfo = () => (
        <div className="current-process-info">
            <div className="current-step-info">
                <span className="current-step-label">当前处理步骤：</span>
                <span className="current-step-value">{mockCurrentProcessInfo.currentStep}</span>
            </div>

            {/* 当前处理人 */}
            <div className="user-list-section">
                <div className="user-list-header" onClick={toggleHandlersExpand}>
                    <div className="user-list-title">
                        <UserOutline className="user-icon" />
                        <span className="user-list-label">当前处理人：</span>
                        <span className="user-count">
                            {mockCurrentProcessInfo.currentHandlers.slice(0, 2).map(h => h.name).join('、')}
                            {mockCurrentProcessInfo.currentHandlers.length > 2 && ` 等${mockCurrentProcessInfo.currentHandlers.length}人`}
                        </span>
                    </div>
                    <div className="expand-toggle">
                        <span>{expandedHandlers ? '收起' : '展开'}</span>
                        <RightOutline className={`expand-icon ${expandedHandlers ? 'expanded' : ''}`} />
                    </div>
                </div>
                {expandedHandlers && (
                    <div className="user-list">
                        {mockCurrentProcessInfo.currentHandlers.map(handler => (
                            <div key={handler.id} className="user-item">
                                <span className="user-name">{handler.name}</span>
                                <span className="user-id">（{handler.userId}）</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 知悉人 */}
            <div className="user-list-section">
                <div className="user-list-header" onClick={toggleNotifyUsersExpand}>
                    <div className="user-list-title">
                        <TeamOutline className="user-icon" />
                        <span className="user-list-label">知悉人：</span>
                        <span className="user-count">
                            {mockCurrentProcessInfo.notifyUsers.slice(0, 2).map(u => u.name).join('、')}
                            {mockCurrentProcessInfo.notifyUsers.length > 2 && ` 等${mockCurrentProcessInfo.notifyUsers.length}人`}
                        </span>
                    </div>
                    <div className="expand-toggle">
                        <span>{expandedNotifyUsers ? '收起' : '展开'}</span>
                        <RightOutline className={`expand-icon ${expandedNotifyUsers ? 'expanded' : ''}`} />
                    </div>
                </div>
                {expandedNotifyUsers && (
                    <div className="user-list">
                        {mockCurrentProcessInfo.notifyUsers.map(user => (
                            <div key={user.id} className="user-item">
                                <span className="user-name">{user.name}</span>
                                <span className="user-id">（{user.userId}）</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

    // 渲染时间线 - 参考ui3.jpg的流程展示
    const renderTimeline = () => (
        <div className="timeline">
            {mockProcessRecords.map((record, index) => (
                <div key={record.id} className={`timeline-item ${record.isCurrent ? 'current' : 'completed'}`}>
                    <div className="timeline-left">
                        <div className="timeline-dot">
                            {record.isCurrent && <div className="pulse-dot" />}
                        </div>
                        {index < mockProcessRecords.length - 1 && <div className="timeline-line" />}
                    </div>

                    <div className="timeline-content">
                        <div className="timeline-header">
                            <div className="timeline-action">
                                <span>{record.step}</span>
                                {record.isCurrent && <span className="current-badge">会办</span>}
                            </div>
                            {/* 如果有子流程记录，显示跳转按钮 */}
                            {record.children && record.children.length > 0 && (
                                <div className="sub-process-link" onClick={() => handleViewSubProcess(record)}>
                                    <span className="sub-process-text">会办记录</span>
                                    <RightOutline className="sub-process-arrow" />
                                </div>
                            )}
                        </div>

                        <div className="timeline-body">
                            <div className="handler-info">
                                <div className="handler-header">
                                    <div className="handler-left">
                                        <UserOutline className="handler-icon" />
                                        <span className="handler-name">{record.handler.name}</span>
                                        <span className="handler-id">{record.handler.userId}</span>
                                    </div>
                                    <div className="timeline-time">{record.handler.time}</div>
                                </div>
                                <div className="handler-department">{record.handler.department}</div>
                            </div>

                            {record.opinion && (
                                <div className="opinion-container">
                                    <div className="opinion-content">
                                        <div className="opinion-text">
                                            {expandedOpinions.includes(record.id) || record.opinion.length <= 20
                                                ? record.opinion
                                                : `${record.opinion.substring(0, 20)}...`
                                            }
                                        </div>
                                        <Button
                                            className="copy-btn"
                                            onClick={() => handleCopyOpinion(record.opinion)}
                                        >
                                            📋
                                        </Button>
                                    </div>
                                    {record.opinion.length > 20 && (
                                        <Button
                                            className="expand-opinion-btn"
                                            onClick={() => toggleOpinionExpand(record.id)}
                                        >
                                            {expandedOpinions.includes(record.id) ? '收起' : '展开'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {record.hasAttachments && (
                                <div className="attachments-container">
                                    <span className="attachment-icon">📎</span>
                                    <span>附件</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="process-record-container">
            {renderCurrentProcessInfo()}
            {renderTimeline()}
        </div>
    )
}

export default ProcessRecord