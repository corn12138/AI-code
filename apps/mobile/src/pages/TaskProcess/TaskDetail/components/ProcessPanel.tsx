/**
 * 流程处理组件
 * 实现任务流程处理的核心功能，包括联动选择逻辑
 */

import { TaskDetail } from '@/stores/taskProcess/types'
import { useTaskProcessStore } from '@/stores/taskProcessStore'
import {
    ActionSheet,
    Button,
    Card,
    Form,
    Popup,
    SearchBar,
    Space,
    Tag,
    TextArea,
    Toast
} from 'antd-mobile'
import {
    CheckCircleOutline,
    CloseCircleOutline,
    CloseOutline,
    ExclamationCircleOutline,
    RightOutline,
    TeamOutline
} from 'antd-mobile-icons'
// import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'
import React, { useEffect, useState } from 'react'
import { history } from 'umi'
import './ProcessPanel.css'

interface ProcessPanelProps {
    task: TaskDetail | null
}

// 处理动作配置
const actionConfig = {
    approve: {
        text: '同意',
        color: 'primary',
        icon: <CheckCircleOutline />,
        description: '同意此申请，流程继续'
    },
    reject: {
        text: '驳回',
        color: 'danger',
        icon: <CloseCircleOutline />,
        description: '驳回此申请，退回申请人'
    },
    transfer: {
        text: '转办',
        color: 'warning',
        icon: <ExclamationCircleOutline />,
        description: '转给其他人或部门处理'
    },
    complete: {
        text: '完成',
        color: 'success',
        icon: <CheckCircleOutline />,
        description: '流程结束，完成处理'
    }
}

const ProcessPanel: React.FC<ProcessPanelProps> = ({ task }) => {
    console.log('🔧 ProcessPanel组件开始渲染...', { task })
    const {
        state: {
            processSteps,
            nextOrganizations: organizations,
            notifyUsers
        },
        loadNextStepsByOrg,
        loadNextOrgsByStep,
        loadNotifyUsers,
        submitProcess,
        saveDraft
    } = useTaskProcessStore()
    console.log('✅ ProcessPanel成功获取Context:', { processSteps, organizations, notifyUsers })

    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [showActionSheet, setShowActionSheet] = useState(false)
    const [selectedAction, setSelectedAction] = useState<string>('')

    // 本地表单状态
    const [selectedNextStep, setSelectedNextStep] = useState<string>('')
    const [selectedNextOrg, setSelectedNextOrg] = useState<string>('')
    const [selectedNotifyUsers, setSelectedNotifyUsers] = useState<string[]>([])
    const [processOpinion, setProcessOpinion] = useState<string>('')

    // 控制联动显示
    const [showNextOrgAndUsers, setShowNextOrgAndUsers] = useState<boolean>(false)

    // 控制弹出选择器
    const [showStepSelector, setShowStepSelector] = useState<boolean>(false)
    const [showOrgSelector, setShowOrgSelector] = useState<boolean>(false)
    const [showUserSelector, setShowUserSelector] = useState<boolean>(false)

    // 知悉人搜索
    const [userSearchQuery, setUserSearchQuery] = useState<string>('')

    // 可选项状态
    const [nextStepOptions, setNextStepOptions] = useState<Array<{ label: string; value: string; disabled?: boolean }>>([])
    const [nextOrgOptions, setNextOrgOptions] = useState<Array<{ label: string; value: string; disabled?: boolean }>>([])
    const [notifyUserOptions, setNotifyUserOptions] = useState<Array<{ label: string; value: string }>>([])

    // 表单状态（注释掉业务中不需要的字段）
    // const [urgentLevel, setUrgentLevel] = useState<number>(1)
    // const [isUrgent, setIsUrgent] = useState(false)
    // const [attachments, setAttachments] = useState<ImageUploadItem[]>([])

    // 监听任务变化，初始化数据
    useEffect(() => {
        if (task) {
            loadInitialData()
        }
    }, [task])

    // 监听处理步骤变化，触发联动逻辑
    useEffect(() => {
        if (selectedNextStep) {
            loadNextOrgs()
            loadNotifyUsersData()
        } else {
            // 清空后续选项
            setNextOrgOptions([])
            setNotifyUserOptions([])
            setSelectedNextOrg('')
            setSelectedNotifyUsers([])
        }
    }, [selectedNextStep])

    // 初始化数据加载
    const loadInitialData = async () => {
        try {
            setLoading(true)

            // 添加静态处理步骤数据
            const mockSteps = [
                { label: '部门审核', value: 'dept_review', disabled: false },
                { label: '领导审批', value: 'leader_approve', disabled: false },
                { label: '财务审核', value: 'finance_review', disabled: false },
                { label: '总经理审批', value: 'gm_approve', disabled: false },
                { label: '归档', value: 'archive', disabled: false }
            ]
            setNextStepOptions(mockSteps)

            console.log('ProcessPanel 初始化数据加载完成:', mockSteps)
        } catch (error) {
            console.error('初始化数据失败:', error)
        } finally {
            setLoading(false)
        }
    }

    // 加载下一处理步骤
    const loadNextSteps = async () => {
        // if (!selectedOrg) return // 移除对selectedOrg的依赖

        try {
            setLoading(true)
            // 这里可以根据实际业务逻辑来决定如何获取机构ID
            // await loadNextStepsByOrg('default') // 使用默认机构或从task中获取

            const options = processSteps.map(step => ({
                label: step.name,
                value: step.id,
                disabled: false
            }))
            setNextStepOptions(options)
        } catch (error) {
            console.error('加载处理步骤失败:', error)
            Toast.show({
                content: '加载处理步骤失败',
                icon: 'fail'
            })
        } finally {
            setLoading(false)
        }
    }

    // 加载下一处理机构
    const loadNextOrgs = async () => {
        if (!selectedNextStep) return

        try {
            setLoading(true)

            // 添加静态处理机构数据
            const mockOrgs = [
                { label: '人事部', value: 'hr_dept', disabled: false },
                { label: '财务部', value: 'finance_dept', disabled: false },
                { label: '技术部', value: 'tech_dept', disabled: false },
                { label: '市场部', value: 'market_dept', disabled: false },
                { label: '总经理办公室', value: 'gm_office', disabled: false }
            ]
            setNextOrgOptions(mockOrgs)

            console.log('ProcessPanel 加载处理机构:', mockOrgs)
        } catch (error) {
            console.error('加载处理机构失败:', error)
            Toast.show({
                content: '加载处理机构失败',
                icon: 'fail'
            })
        } finally {
            setLoading(false)
        }
    }

    // 加载知悉人列表
    const loadNotifyUsersData = async () => {
        if (!selectedNextStep) return

        try {
            setLoading(true)

            // 添加静态知悉人数据
            const mockUsers = [
                { label: '张三', value: 'user_001' },
                { label: '李四', value: 'user_002' },
                { label: '王五', value: 'user_003' },
                { label: '赵六', value: 'user_004' },
                { label: '孙七', value: 'user_005' },
                { label: '周八', value: 'user_006' },
                { label: '吴九', value: 'user_007' },
                { label: '郑十', value: 'user_008' },
                { label: '兴小智', value: 'user_009' },
                { label: '刘某某', value: 'user_010' }
            ]
            setNotifyUserOptions(mockUsers)

            console.log('ProcessPanel 加载知悉人:', mockUsers)
        } catch (error) {
            console.error('加载知悉人列表失败:', error)
            Toast.show({
                content: '加载知悉人列表失败',
                icon: 'fail'
            })
        } finally {
            setLoading(false)
        }
    }

    // 处理步骤选择 - 新的弹出选择器方式
    const handleStepSelectorOpen = () => {
        setShowStepSelector(true)
    }

    const handleStepSelect = (stepId: string) => {
        setSelectedNextStep(stepId || '')
        setShowStepSelector(false)

        if (stepId) {
            // 显示下一处理机构和知悉人选择器
            setShowNextOrgAndUsers(true)
        } else {
            // 隐藏下一处理机构和知悉人选择器
            setShowNextOrgAndUsers(false)
            setSelectedNextOrg('')
            setSelectedNotifyUsers([])
        }
    }

    // 处理机构选择 - 新的弹出选择器方式
    const handleOrgSelectorOpen = () => {
        setShowOrgSelector(true)
    }

    const handleOrgSelect = (orgId: string) => {
        setSelectedNextOrg(orgId || '')
        setShowOrgSelector(false)
    }

    // 知悉人选择 - 新的搜索选择器方式
    const handleUserSelectorOpen = () => {
        setShowUserSelector(true)
        setUserSearchQuery('')
    }

    const handleUserSelect = (userId: string) => {
        if (selectedNotifyUsers.includes(userId)) {
            // 取消选择
            setSelectedNotifyUsers(selectedNotifyUsers.filter(id => id !== userId))
        } else {
            // 添加选择
            setSelectedNotifyUsers([...selectedNotifyUsers, userId])
        }
    }

    const handleUserSelectorConfirm = () => {
        setShowUserSelector(false)
    }

    // 移除已选择的知悉人
    const handleRemoveNotifyUser = (userId: string) => {
        setSelectedNotifyUsers(selectedNotifyUsers.filter(id => id !== userId))
    }

    // 获取选中项的显示文本
    const getSelectedStepText = () => {
        if (!selectedNextStep) return '请选择'
        const step = nextStepOptions.find(option => option.value === selectedNextStep)
        return step ? step.label : '请选择'
    }

    const getSelectedOrgText = () => {
        if (!selectedNextOrg) return '请选择'
        const org = nextOrgOptions.find(option => option.value === selectedNextOrg)
        return org ? org.label : '请选择'
    }

    const getSelectedUsersText = () => {
        if (selectedNotifyUsers.length === 0) return '请选择'
        return `已选择 ${selectedNotifyUsers.length} 人`
    }

    // 过滤知悉人列表
    const filteredNotifyUsers = notifyUserOptions.filter(user =>
        user.label.toLowerCase().includes(userSearchQuery.toLowerCase())
    )

    // 处理机构选择
    const handleNextOrgChange = (values: string[]) => {
        const orgId = values[0] || ''
        setSelectedNextOrg(orgId)

        // 重新加载知悉人
        if (orgId) {
            loadNotifyUsersData()
        } else {
            setNotifyUserOptions([])
            setSelectedNotifyUsers([])
        }
    }

    // 知悉人选择
    const handleNotifyUsersChange = (values: string[]) => {
        setSelectedNotifyUsers(values)
    }

    // 文件上传
    // 文件上传处理（注释掉，业务中不需要附件功能）
    // const handleFileUpload = async (file: File) => {
    //     try {
    //         const result = await fileApi.upload(file)
    //         return {
    //             url: result.url,
    //             extra: {
    //                 name: result.name || file.name,
    //                 size: file.size,
    //                 type: file.type
    //             }
    //         }
    //     } catch (error) {
    //         console.error('文件上传失败:', error)
    //         Toast.show({
    //             content: '文件上传失败',
    //             icon: 'fail'
    //         })
    //         throw error
    //     }
    // }

    // 提交处理
    // const handleSubmit = async (action: 'approve' | 'reject' | 'transfer' | 'complete') => {
    //     if (!task) return

    //     // 表单验证
    //     if (!processOpinion.trim()) {
    //         Toast.show({
    //             content: '请填写处理意见',
    //             icon: 'fail'
    //         })
    //         return
    //     }

    //     if ((action === 'approve' || action === 'transfer') && !selectedNextStep) {
    //         Toast.show({
    //             content: '请选择下一处理步骤',
    //             icon: 'fail'
    //         })
    //         return
    //     }

    //     if ((action === 'approve' || action === 'transfer') && !selectedNextOrg) {
    //         Toast.show({
    //             content: '请选择下一处理机构',
    //             icon: 'fail'
    //         })
    //         return
    //     }

    //     const result = await Dialog.confirm({
    //         content: `确定要${actionConfig[action].text}吗？`,
    //         cancelText: '取消',
    //         confirmText: '确定'
    //     })

    //     if (!result) return

    //     try {
    //         setSubmitting(true)

    //         const success = await submitProcess({
    //             taskId: task.id,
    //             action,
    //             opinion: processOpinion,
    //             nextStep: selectedNextStep || undefined,
    //             nextOrg: selectedNextOrg || undefined,
    //             notifyUsers: selectedNotifyUsers,
    //             attachments: attachments.map(item => item.url)
    //         })

    //         if (success) {
    //             Toast.show({
    //                 content: `${actionConfig[action].text}成功`,
    //                 icon: 'success'
    //             })

    //             // 清空表单
    //             resetForm()

    //             // 刷新数据
    //             setTimeout(() => {
    //                 window.location.reload()
    //             }, 1000)
    //         }
    //     } catch (error) {
    //         console.error('提交失败:', error)
    //         Toast.show({
    //             content: '提交失败，请重试',
    //             icon: 'fail'
    //         })
    //     } finally {
    //         setSubmitting(false)
    //         setShowActionSheet(false)
    //     }
    // }

    // 取消操作 - 直接返回列表页
    const handleCancel = () => {
        // 使用umi的history返回任务列表页
        history.push('/task-process')
    }

    // 提交处理 - 调用接口成功后返回列表页
    const handleSubmit = async () => {
        if (!selectedNextStep || !processOpinion.trim()) {
            Toast.show({
                content: '请填写必要信息',
                icon: 'fail'
            })
            return
        }

        try {
            setSubmitting(true)

            const success = await submitProcess({
                taskId: task?.id || '',
                comment: processOpinion,
                nextStep: selectedNextStep || '',
                nextOrg: selectedNextOrg || '',
                notifyUsers: selectedNotifyUsers,
                // 注释掉附件相关字段，因为业务中不需要
                attachments: [] // attachments.map(item => item.url)
            })

            if (success) {
                Toast.show({
                    content: '提交成功',
                    icon: 'success'
                })

                // 延迟返回列表页，让用户看到成功提示
                setTimeout(() => {
                    history.push('/task-process')
                }, 1000)
            }
        } catch (error) {
            console.error('提交失败:', error)
            Toast.show({
                content: '提交失败，请重试',
                icon: 'fail'
            })
        } finally {
            setSubmitting(false)
        }
    }

    // 保存草稿
    const handleSaveDraft = async () => {
        if (!task) return

        try {
            setSubmitting(true)

            const success = await saveDraft({
                taskId: task?.id || '',
                comment: processOpinion,
                // 注释掉附件相关字段，因为业务中不需要
                attachments: [] // attachments.map(item => item.url)
            })

            if (success) {
                Toast.show({
                    content: '保存成功',
                    icon: 'success'
                })
            }
        } catch (error) {
            console.error('保存失败:', error)
            Toast.show({
                content: '保存失败，请重试',
                icon: 'fail'
            })
        } finally {
            setSubmitting(false)
        }
    }

    // 重置表单（注释掉业务中不需要的字段）
    // const resetForm = () => {
    //     setSelectedNextStep('')
    //     setSelectedNextOrg('')
    //     setSelectedNotifyUsers([])
    //     setProcessOpinion('')
    //     // setUrgentLevel(1)
    //     // setIsUrgent(false)
    //     // setAttachments([])
    //     setShowNextOrgAndUsers(false)
    // }

    // 操作按钮菜单
    const actionSheetActions = [
        {
            key: 'approve',
            text: actionConfig.approve.text,
            color: 'primary',
            disabled: !task || task.status !== 'pending'
        },
        {
            key: 'reject',
            text: actionConfig.reject.text,
            color: 'danger',
            disabled: !task || task.status !== 'pending'
        },
        {
            key: 'transfer',
            text: actionConfig.transfer.text,
            color: 'warning',
            disabled: !task || task.status === 'completed'
        }
    ]

    if (!task) {
        return (
            <div className="process-panel-empty">
                <ExclamationCircleOutline style={{ fontSize: 48, color: '#ccc' }} />
                <p>无法处理任务</p>
            </div>
        )
    }

    return (
        <div className="process-panel-container">
            <Card className="process-form-card">
                <Form layout="vertical" className="process-form">
                    <div className="form-section">
                        <div className="section-title">
                            <TeamOutline />
                            <span>流程处理</span>
                        </div>

                        {/* 默认显示：下一处理步骤 */}
                        <Form.Item
                            label="下一处理步骤"
                            name="nextStep"
                            required
                        >
                            <div className="selector-input" onClick={handleStepSelectorOpen}>
                                <span className={selectedNextStep ? 'selected-text' : 'placeholder-text'}>
                                    {getSelectedStepText()}
                                </span>
                                <RightOutline />
                            </div>
                        </Form.Item>

                        {/* 联动显示：下一处理机构和知悉人 */}
                        {showNextOrgAndUsers && (
                            <>
                                <Form.Item
                                    label="下一处理机构"
                                    name="nextOrg"
                                >
                                    <div className="selector-input" onClick={handleOrgSelectorOpen}>
                                        <span className={selectedNextOrg ? 'selected-text' : 'placeholder-text'}>
                                            {getSelectedOrgText()}
                                        </span>
                                        <RightOutline />
                                    </div>
                                </Form.Item>

                                <Form.Item
                                    label="知悉人"
                                    name="notifyUsers"
                                    extra="可选择多个知悉人"
                                >
                                    <div className="user-selector-container">
                                        <div className="selector-input" onClick={handleUserSelectorOpen}>
                                            <span className={selectedNotifyUsers.length > 0 ? 'selected-text' : 'placeholder-text'}>
                                                {getSelectedUsersText()}
                                            </span>
                                            <RightOutline />
                                        </div>

                                        {/* 显示已选择的知悉人标签 */}
                                        {selectedNotifyUsers.length > 0 && (
                                            <div className="selected-users-tags">
                                                {selectedNotifyUsers.map(userId => {
                                                    const user = notifyUserOptions.find(u => u.value === userId)
                                                    return user ? (
                                                        <Tag
                                                            key={userId}
                                                            color="primary"
                                                            onClick={() => handleRemoveNotifyUser(userId)}
                                                        >
                                                            {user.label} ×
                                                        </Tag>
                                                    ) : null
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </Form.Item>
                            </>
                        )}

                        {/* 默认显示：处理意见 */}
                        <Form.Item
                            label="处理意见"
                            name="opinion"
                            required
                        >
                            <TextArea
                                placeholder="请填写处理意见..."
                                value={processOpinion}
                                onChange={setProcessOpinion}
                                rows={4}
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </div>

                    {/* 注释掉处理设置、紧急程度、附件等实际业务中不需要的字段 */}
                    {/* <Divider style={{ margin: '24px 0' }} />

                    <div className="form-section">
                        <div className="section-title">
                            <FileOutline />
                            <span>处理设置</span>
                        </div>

                        <Form.Item label="紧急程度" name="urgentLevel">
                            <div className="urgent-controls">
                                <Switch
                                    checked={isUrgent}
                                    onChange={setIsUrgent}
                                />
                                <span className="urgent-label">
                                    {isUrgent ? '紧急处理' : '正常处理'}
                                </span>
                                {isUrgent && (
                                    <Stepper
                                        value={urgentLevel}
                                        onChange={setUrgentLevel}
                                        min={1}
                                        max={5}
                                        step={1}
                                    />
                                )}
                            </div>
                        </Form.Item>

                        <Form.Item label="附件" name="attachments">
                            <ImageUploader
                                value={attachments}
                                onChange={setAttachments}
                                upload={handleFileUpload}
                                multiple
                                maxCount={5}
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                        </Form.Item>
                    </div> */}
                </Form>
            </Card>

            {/* 流程处理操作按钮 */}
            <div className="panel-actions">
                <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button
                        size="large"
                        fill="outline"
                        onClick={handleCancel}
                        disabled={submitting}
                        style={{ flex: 1, marginRight: '12px' }}
                    >
                        取消
                    </Button>

                    <Button
                        size="large"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedNextStep || !processOpinion.trim()}
                        loading={submitting}
                        style={{ flex: 1 }}
                    >
                        提交
                    </Button>
                </Space>
            </div>

            {/* 操作选择菜单 */}
            <ActionSheet
                visible={showActionSheet}
                actions={actionSheetActions}
                onClose={() => setShowActionSheet(false)}
                onAction={() => {
                    // 使用新的按钮逻辑，不再使用ActionSheet进行处理
                    setShowActionSheet(false)
                }}
                cancelText="取消"
                extra={
                    <div className="action-sheet-extra">
                        <div className="extra-title">选择处理动作</div>
                        <div className="extra-desc">请根据实际情况选择合适的处理方式</div>
                    </div>
                }
            />

            {/* 下一处理步骤选择器 */}
            <Popup
                visible={showStepSelector}
                onMaskClick={() => setShowStepSelector(false)}
                position="bottom"
                bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
            >
                <div className="selector-popup">
                    <div className="popup-header">
                        <span className="popup-title">请选择</span>
                        <CloseOutline onClick={() => setShowStepSelector(false)} />
                    </div>
                    <div className="popup-content">
                        {nextStepOptions.map(option => (
                            <div
                                key={option.value}
                                className={`popup-option ${selectedNextStep === option.value ? 'selected' : ''}`}
                                onClick={() => handleStepSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                {selectedNextStep === option.value && <CheckCircleOutline />}
                            </div>
                        ))}
                    </div>
                    <div className="popup-footer">
                        <Button
                            block
                            color="primary"
                            onClick={() => setShowStepSelector(false)}
                        >
                            确认
                        </Button>
                    </div>
                </div>
            </Popup>

            {/* 下一处理机构选择器 */}
            <Popup
                visible={showOrgSelector}
                onMaskClick={() => setShowOrgSelector(false)}
                position="bottom"
                bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
            >
                <div className="selector-popup">
                    <div className="popup-header">
                        <span className="popup-title">请选择</span>
                        <CloseOutline onClick={() => setShowOrgSelector(false)} />
                    </div>
                    <div className="popup-content">
                        {nextOrgOptions.map(option => (
                            <div
                                key={option.value}
                                className={`popup-option ${selectedNextOrg === option.value ? 'selected' : ''}`}
                                onClick={() => handleOrgSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                {selectedNextOrg === option.value && <CheckCircleOutline />}
                            </div>
                        ))}
                    </div>
                    <div className="popup-footer">
                        <Button
                            block
                            color="primary"
                            onClick={() => setShowOrgSelector(false)}
                        >
                            确认
                        </Button>
                    </div>
                </div>
            </Popup>

            {/* 知悉人选择器 */}
            <Popup
                visible={showUserSelector}
                onMaskClick={() => setShowUserSelector(false)}
                position="bottom"
                bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', height: '70vh' }}
            >
                <div className="user-selector-popup">
                    <div className="popup-header">
                        <span className="popup-title">下一处理人</span>
                        <span className="cancel-text" onClick={() => setShowUserSelector(false)}>取消</span>
                    </div>

                    {/* 搜索框 */}
                    <div className="search-container">
                        <SearchBar
                            placeholder="兴小智"
                            value={userSearchQuery}
                            onChange={setUserSearchQuery}
                            onSearch={() => { }}
                        />
                    </div>

                    {/* 面包屑导航 - 可选，根据需要显示 */}
                    <div className="breadcrumb">
                        <span>企业结构层级</span>
                        <RightOutline />
                        <span>某某某中心</span>
                        <RightOutline />
                        <span>某某团队</span>
                    </div>

                    {/* 用户列表 */}
                    <div className="user-list">
                        {filteredNotifyUsers.map(user => {
                            const isSelected = selectedNotifyUsers.includes(user.value)
                            return (
                                <div
                                    key={user.value}
                                    className={`user-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleUserSelect(user.value)}
                                >
                                    <div className="user-checkbox">
                                        {isSelected ? (
                                            <CheckCircleOutline style={{ color: '#1890ff' }} />
                                        ) : (
                                            <div className="checkbox-empty" />
                                        )}
                                    </div>
                                    <div className="user-avatar">
                                        <div className="avatar-placeholder" />
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{user.label}</div>
                                        <div className="user-id">123456</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* 底部操作 */}
                    <div className="popup-footer">
                        <div className="selected-count">
                            <span>全选</span>
                            <span>已选择 {selectedNotifyUsers.length} 位</span>
                        </div>
                        <Button
                            color="primary"
                            onClick={handleUserSelectorConfirm}
                        >
                            完成
                        </Button>
                    </div>
                </div>
            </Popup>
        </div>
    )
}

export default ProcessPanel
