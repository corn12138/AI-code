import { useTaskProcessStore } from '@/stores/taskProcessStore'
import {
    Button,
    List,
    Popup,
    SearchBar,
    TextArea,
    Toast
} from 'antd-mobile'
import {
    CloseOutline,
    RightOutline
} from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { history } from 'umi'
import './ProcessPanel.css'

interface ProcessPanelProps {
    task?: any
    onSubmit?: (data: any) => void
}

// 模拟数据
const mockProcessSteps = [
    { id: '1', name: '审核（会办）', description: '部门会办审核' },
    { id: '2', name: '审核（交办）', description: '部门交办审核' },
    { id: '3', name: '复审', description: '复审流程' },
    { id: '4', name: '终审', description: '终审流程' }
]

const mockOrganizations = [
    { id: '1', name: '技术部', description: '技术开发部门' },
    { id: '2', name: '财务部', description: '财务管理部门' },
    { id: '3', name: '人事部', description: '人力资源部门' },
    { id: '4', name: '行政部', description: '行政管理部门' }
]

const mockUsers = [
    { id: '1', name: '张三', department: '技术部' },
    { id: '2', name: '李四', department: '财务部' },
    { id: '3', name: '王五', department: '人事部' },
    { id: '4', name: '赵六', department: '行政部' },
    { id: '5', name: '孙七', department: '技术部' },
    { id: '6', name: '周八', department: '财务部' }
]

const ProcessPanel: React.FC<ProcessPanelProps> = ({ task, onSubmit }) => {
    const { submitProcess } = useTaskProcessStore()

    const [selectedNextStep, setSelectedNextStep] = useState<string>('')
    const [selectedNextOrg, setSelectedNextOrg] = useState<string[]>([]) // 改为多选数组
    const [selectedNotifyUsers, setSelectedNotifyUsers] = useState<string[]>([])
    const [processOpinion, setProcessOpinion] = useState<string>('')

    // 控制弹窗显示
    const [showStepSelector, setShowStepSelector] = useState(false)
    const [showOrgSelector, setShowOrgSelector] = useState(false)
    const [showUserSelector, setShowUserSelector] = useState(false)
    const [userSearchText, setUserSearchText] = useState('')

    // 控制下一处理机构和知悉人的显示
    const [showNextOrgAndUsers, setShowNextOrgAndUsers] = useState(false)

    // 当选择了下一处理步骤时，显示下一处理机构和知悉人
    useEffect(() => {
        setShowNextOrgAndUsers(!!selectedNextStep)
    }, [selectedNextStep])

    const handleCancel = () => {
        history.push('/task-process')
    }

    const handleSubmit = async () => {
        // 必填字段验证
        if (!selectedNextStep) {
            Toast.show('请选择下一处理步骤')
            return
        }

        if (selectedNextOrg.length === 0) {
            Toast.show('请选择下一处理机构')
            return
        }

        if (!processOpinion.trim()) {
            Toast.show('请输入处理意见')
            return
        }

        try {
            await submitProcess({
                taskId: task?.id || '',
                nextStep: selectedNextStep,
                nextOrg: selectedNextOrg.join(','), // 多选机构用逗号分隔
                notifyUsers: selectedNotifyUsers,
                comment: processOpinion,
                attachments: []
            })

            Toast.show('提交成功')
            setTimeout(() => {
                history.push('/task-process')
            }, 1000)
        } catch (error) {
            Toast.show('提交失败，请重试')
        }
    }

    const getStepName = (stepId: string) => {
        const step = mockProcessSteps.find(s => s.id === stepId)
        return step?.name || ''
    }

    const getOrgName = (orgId: string) => {
        const org = mockOrganizations.find(o => o.id === orgId)
        return org?.name || ''
    }

    const getUserName = (userId: string) => {
        const user = mockUsers.find(u => u.id === userId)
        return user?.name || ''
    }

    const getOrgNames = (orgIds: string[]) => {
        return orgIds.map(id => {
            const org = mockOrganizations.find(o => o.id === id)
            return org?.name || ''
        }).join(', ')
    }

    // 快速填入处理意见
    const handleQuickOpinion = (opinion: string) => {
        setProcessOpinion(opinion)
    }

    const filteredUsers = mockUsers.filter(user =>
        user.name.includes(userSearchText) ||
        user.department.includes(userSearchText)
    )

    const renderUserSelector = () => (
        <Popup
            visible={showUserSelector}
            onMaskClick={() => setShowUserSelector(false)}
            bodyStyle={{ height: '80vh' }}
        >
            <div className="process-popup-container">
                <div className="popup-header">
                    <span>选择知悉人</span>
                    <CloseOutline
                        className="close-btn"
                        onClick={() => setShowUserSelector(false)}
                    />
                </div>
                <div className="popup-search-bar">
                    <SearchBar
                        placeholder="搜索用户姓名或部门"
                        value={userSearchText}
                        onChange={setUserSearchText}
                    />
                </div>
                <div className="popup-content">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            className="user-list-item"
                            onClick={() => {
                                const isSelected = selectedNotifyUsers.includes(user.id)
                                if (isSelected) {
                                    setSelectedNotifyUsers(prev => prev.filter(id => id !== user.id))
                                } else {
                                    setSelectedNotifyUsers(prev => [...prev, user.id])
                                }
                            }}
                        >
                            <div className="user-avatar">
                                {user.name.charAt(0)}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-department">{user.department}</div>
                            </div>
                            <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                border: `2px solid ${selectedNotifyUsers.includes(user.id) ? '#1890ff' : '#d9d9d9'}`,
                                backgroundColor: selectedNotifyUsers.includes(user.id) ? '#1890ff' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {selectedNotifyUsers.includes(user.id) && (
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        backgroundColor: 'white',
                                        borderRadius: '50%'
                                    }} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="popup-footer">
                    <Button
                        color="default"
                        onClick={() => setShowUserSelector(false)}
                    >
                        取消
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => setShowUserSelector(false)}
                    >
                        确定
                    </Button>
                </div>
            </div>
        </Popup>
    )

    return (
        <div className="process-panel">
            {/* 当前处理步骤信息 - 参考ui16.jpg顶部，左右布局 */}
            <div className="current-step-info">
                <div className="current-step-row">
                    <span className="step-label">当前处理步骤</span>
                    <span className="step-value">部门审核</span>
                </div>
            </div>

            {/* 处理表单 - 参考ui16.jpg样式 */}
            <div className="process-form-container">
                <div className="form-section">
                    {/* 下一处理步骤 - 单行，左标签右选择 */}
                    <div className="form-item">
                        <div className="form-row-layout">
                            <div className="form-label">下一处理步骤 <span className="required-mark">*</span></div>
                            <div
                                className="form-select-container"
                                onClick={() => setShowStepSelector(true)}
                            >
                                <span className={selectedNextStep ? 'select-text' : 'select-placeholder'}>
                                    {selectedNextStep ? getStepName(selectedNextStep) : '审核（会办）'}
                                </span>
                                <RightOutline className="select-arrow" />
                            </div>
                        </div>
                    </div>

                    {/* 下一处理机构 - 条件显示 */}
                    {showNextOrgAndUsers && (
                        <div className="form-item">
                            <div className="form-row-layout">
                                <div className="form-label">下一处理机构 <span className="required-mark">*</span></div>
                                <div
                                    className="form-select-container"
                                    onClick={() => setShowOrgSelector(true)}
                                >
                                    <div className="select-content">
                                        {selectedNextOrg.length > 0 ? (
                                            <div className="selected-items">
                                                {selectedNextOrg.map(orgId => (
                                                    <span key={orgId} className="selected-item">
                                                        {getOrgName(orgId)}
                                                        <span
                                                            className="remove-item"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedNextOrg(prev =>
                                                                    prev.filter(id => id !== orgId)
                                                                )
                                                            }}
                                                        >
                                                            ×
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="select-placeholder">请选择</span>
                                        )}
                                    </div>
                                    <RightOutline className="select-arrow" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 知悉人 - 条件显示 */}
                    {showNextOrgAndUsers && (
                        <div className="form-item">
                            <div className="form-row-layout">
                                <div className="form-label">知悉人</div>
                                <div
                                    className="form-select-container"
                                    onClick={() => setShowUserSelector(true)}
                                >
                                    <div className="select-content">
                                        {selectedNotifyUsers.length > 0 ? (
                                            <div className="selected-items">
                                                {selectedNotifyUsers.map(userId => (
                                                    <span key={userId} className="selected-item">
                                                        {getUserName(userId)}
                                                        <span
                                                            className="remove-item"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedNotifyUsers(prev =>
                                                                    prev.filter(id => id !== userId)
                                                                )
                                                            }}
                                                        >
                                                            ×
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="select-placeholder">请选择</span>
                                        )}
                                    </div>
                                    <RightOutline className="select-arrow" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 处理意见 - 永远显示 */}
                    <div className="form-item">
                        <div className="form-label">处理意见 <span className="required-mark">*</span></div>
                        <div className="opinion-input-container">
                            <div className="opinion-actions">
                                <Button size="mini" color="primary" onClick={() => handleQuickOpinion('同意')}>同意</Button>
                                <Button size="mini" onClick={() => handleQuickOpinion('请办理')}>请办理</Button>
                                <Button size="mini" onClick={() => handleQuickOpinion('请审核')}>请审核</Button>
                            </div>
                            <TextArea
                                className="opinion-textarea"
                                placeholder="请输入"
                                value={processOpinion}
                                onChange={setProcessOpinion}
                                rows={4}
                                maxLength={500}
                            />
                            <div className="char-count">{processOpinion.length}/500</div>
                        </div>
                    </div>
                </div>

                {/* 底部按钮 - 只保留提交和取消 */}
                <div className="form-actions">
                    <Button
                        className="action-btn secondary-btn"
                        onClick={handleCancel}
                    >
                        取消
                    </Button>
                    <Button
                        className="action-btn primary-btn"
                        onClick={handleSubmit}
                    >
                        提交
                    </Button>
                </div>
            </div>

            {/* 下一处理步骤选择弹窗 */}
            <Popup
                visible={showStepSelector}
                onMaskClick={() => setShowStepSelector(false)}
                bodyStyle={{ height: '50vh' }}
            >
                <div className="process-popup-container">
                    <div className="popup-header">
                        <span>选择下一处理步骤</span>
                        <CloseOutline
                            className="close-btn"
                            onClick={() => setShowStepSelector(false)}
                        />
                    </div>
                    <div className="popup-content">
                        <List>
                            {mockProcessSteps.map(step => (
                                <List.Item
                                    key={step.id}
                                    className={`popup-list-item ${selectedNextStep === step.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedNextStep(step.id)
                                        setShowStepSelector(false)
                                    }}
                                    extra={step.description}
                                >
                                    {step.name}
                                </List.Item>
                            ))}
                        </List>
                    </div>
                </div>
            </Popup>

            {/* 机构选择弹窗 */}
            <Popup
                visible={showOrgSelector}
                onMaskClick={() => setShowOrgSelector(false)}
                bodyStyle={{ height: '50vh' }}
            >
                <div className="process-popup-container">
                    <div className="popup-header">
                        <span>选择下一处理机构</span>
                        <CloseOutline
                            className="close-btn"
                            onClick={() => setShowOrgSelector(false)}
                        />
                    </div>
                    <div className="popup-content">
                        <List>
                            {mockOrganizations.map(org => (
                                <List.Item
                                    key={org.id}
                                    className={`popup-list-item ${selectedNextOrg.includes(org.id) ? 'selected' : ''}`}
                                    onClick={() => {
                                        const isSelected = selectedNextOrg.includes(org.id)
                                        if (isSelected) {
                                            setSelectedNextOrg(prev => prev.filter(id => id !== org.id))
                                        } else {
                                            setSelectedNextOrg(prev => [...prev, org.id])
                                        }
                                    }}
                                    extra={org.description}
                                >
                                    {org.name}
                                </List.Item>
                            ))}
                        </List>
                    </div>
                    <div className="popup-footer">
                        <Button
                            color="default"
                            onClick={() => setShowOrgSelector(false)}
                        >
                            取消
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => setShowOrgSelector(false)}
                        >
                            确定
                        </Button>
                    </div>
                </div>
            </Popup>

            {/* 知悉人选择弹窗 */}
            {renderUserSelector()}
        </div>
    )
}

export default ProcessPanel