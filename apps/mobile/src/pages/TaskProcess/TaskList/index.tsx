/**
 * 任务列表页面
 * 展示所有待处理任务，支持筛选、搜索和分页
 */

import { TaskItem, TaskPriority, TaskStatus } from '@/stores/taskProcess/types'
import { useTaskProcessStore } from '@/stores/taskProcessStore'
import {
    Badge,
    Button,
    Card,
    DotLoading,
    Empty,
    InfiniteScroll,
    PullToRefresh,
    SearchBar,
    Space,
    SpinLoading,
    Tabs,
    Tag
} from 'antd-mobile'
import {
    CheckCircleOutline,
    ClockCircleOutline,
    ExclamationCircleOutline,
    FilterOutline,
    RightOutline
} from 'antd-mobile-icons'
import React, { useEffect, useMemo, useState } from 'react'
import { history } from 'umi'
import './index.css'

// 状态Tab配置
const statusTabs = [
    { key: 'all', title: '全部', badge: 0 },
    { key: TaskStatus.PENDING, title: '待处理', badge: 0 },
    { key: TaskStatus.PROCESSING, title: '处理中', badge: 0 },
    { key: TaskStatus.COMPLETED, title: '已完成', badge: 0 }
]

// 优先级配置
const priorityConfig = {
    [TaskPriority.LOW]: { text: '低', color: '#52c41a' },
    [TaskPriority.NORMAL]: { text: '一般', color: '#1890ff' },
    [TaskPriority.HIGH]: { text: '高', color: '#faad14' },
    [TaskPriority.URGENT]: { text: '紧急', color: '#f5222d' }
}

// 状态配置
const statusConfig = {
    [TaskStatus.PENDING]: { text: '待处理', color: '#faad14', icon: <ClockCircleOutline /> },
    [TaskStatus.PROCESSING]: { text: '处理中', color: '#1890ff', icon: <ExclamationCircleOutline /> },
    [TaskStatus.COMPLETED]: { text: '已完成', color: '#52c41a', icon: <CheckCircleOutline /> },
    [TaskStatus.REJECTED]: { text: '已驳回', color: '#f5222d', icon: <ExclamationCircleOutline /> },
    [TaskStatus.CANCELLED]: { text: '已取消', color: '#999', icon: <ExclamationCircleOutline /> }
}

const TaskList: React.FC = () => {
    console.log('🔧 TaskList组件开始渲染...')
    const {
        state: {
            tasks,
            taskFilter: filter,
            taskPagination: pagination,
            taskLoading: loading
        },
        loadTaskList,
        updateTaskFilter,
        resetTaskList,
        setSelectedTaskInfo
    } = useTaskProcessStore()
    console.log('✅ TaskList成功获取Context:', { tasks, filter, pagination, loading })

    const [activeTab, setActiveTab] = useState('all')
    const [searchKeyword, setSearchKeyword] = useState('')
    const [showFilter, setShowFilter] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [tabBadges, setTabBadges] = useState<Record<string, number>>({})

    // 初始化加载数据
    useEffect(() => {
        console.log('🚀 TaskList组件初始化，开始加载数据...')
        loadTaskList()
        updateTabBadges()
    }, [])

    // 监听筛选条件变化
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab as TaskStatus
        updateTaskFilter({ status })
        loadTaskList()
    }, [activeTab])

    // 更新Tab角标
    const updateTabBadges = () => {
        const badges: Record<string, number> = {
            all: tasks.length,
            [TaskStatus.PENDING]: tasks.filter(t => t.status === TaskStatus.PENDING).length,
            [TaskStatus.PROCESSING]: tasks.filter(t => t.status === TaskStatus.PROCESSING).length,
            [TaskStatus.COMPLETED]: tasks.filter(t => t.status === TaskStatus.COMPLETED).length
        }
        setTabBadges(badges)
    }

    // 加载任务列表
    const loadTaskListData = async (reset = false) => {
        if (loading) return

        try {
            await loadTaskList(reset)
            setHasMore(tasks.length < pagination.total)
            updateTabBadges()
        } catch (error) {
            console.error('加载任务列表失败:', error)
        } finally {
            setRefreshing(false)
        }
    }

    // 下拉刷新
    const handleRefresh = async () => {
        setRefreshing(true)
        await loadTaskListData(true)
    }

    // 加载更多
    const loadMore = async () => {
        if (!hasMore || loading) return
        // 直接调用loadTaskList，它会自动处理分页
        await loadTaskList()
    }

    // 搜索
    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        updateTaskFilter({ keyword: value })
        loadTaskList()
    }

    // 跳转到详情页 - 使用状态管理传递任务完整信息
    const handleTaskClick = (task: TaskItem) => {
        // 将完整的任务信息设置到状态管理中
        setSelectedTaskInfo(task)

        console.log('📋 列表页选中任务:', task)

        // 使用umi的history进行路由跳转
        history.push(`/task-process/detail/${task.id}`)
    }

    // 获取过滤后的任务列表
    const filteredTasks = useMemo(() => {
        console.log('🔍 过滤任务列表:', { tasks, filter, activeTab })
        return tasks.filter(task => {
            // 状态筛选
            if (filter.status && filter.status !== 'all' && task.status !== filter.status) {
                return false
            }

            // 优先级筛选
            if (filter.priority && filter.priority !== 'all' && task.priority !== filter.priority) {
                return false
            }

            // 关键词搜索
            if (searchKeyword) {
                const keyword = searchKeyword.toLowerCase()
                return task.title.toLowerCase().includes(keyword) ||
                    task.processNumber?.toLowerCase().includes(keyword)
            }

            return true
        })
    }, [tasks, filter, searchKeyword])

    // 渲染任务卡片
    const renderTaskCard = (task: TaskItem) => {
        const statusInfo = statusConfig[task.status]
        const priorityInfo = priorityConfig[task.priority]
        const isOverdue = task.deadline && new Date(task.deadline) < new Date()

        return (
            <Card
                key={task.id}
                className="task-card"
                onClick={() => handleTaskClick(task)}
            >
                <div className="task-card-header">
                    <div className="task-title-row">
                        <span className="task-type-tag">{task.type}</span>
                        <h3 className="task-title">{task.title}</h3>
                    </div>
                    <Space>
                        <Tag
                            color={priorityInfo.color}
                            className="priority-tag"
                        >
                            {priorityInfo.text}
                        </Tag>
                        {isOverdue && (
                            <Tag color="#ff4d4f" className="overdue-tag">
                                已超期
                            </Tag>
                        )}
                    </Space>
                </div>

                <div className="task-card-content">
                    <div className="task-info-row">
                        <div className="task-info-item">
                            <span className="info-label">流程编号：</span>
                            <span className="info-value">{task.processCode}</span>
                        </div>
                        <div className="task-info-item">
                            <span className="info-label">申请人：</span>
                            <span className="info-value">{task.applicant}</span>
                        </div>
                    </div>

                    <div className="task-info-row">
                        <div className="task-info-item">
                            <span className="info-label">申请部门：</span>
                            <span className="info-value">{task.applicantDept}</span>
                        </div>
                        <div className="task-info-item">
                            <span className="info-label">当前步骤：</span>
                            <span className="info-value">{task.currentStep}</span>
                        </div>
                    </div>

                    {task.deadline && (
                        <div className="task-info-row">
                            <div className="task-info-item">
                                <span className="info-label">截止时间：</span>
                                <span className={`info-value ${isOverdue ? 'text-danger' : ''}`}>
                                    {new Date(task.deadline).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="task-card-footer">
                    <div className="status-badge" style={{ color: statusInfo.color }}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                    </div>
                    <div className="task-action">
                        <span className="action-text">查看详情</span>
                        <RightOutline className="action-icon" />
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="task-list-page">
            {/* 搜索栏 */}
            <div className="search-header">
                <SearchBar
                    placeholder="搜索任务标题、流程编号"
                    className="task-search-bar"
                    onSearch={handleSearch}
                    onClear={() => handleSearch('')}
                />
                <Button
                    className="filter-button"
                    onClick={() => setShowFilter(!showFilter)}
                    size="small"
                >
                    <FilterOutline />
                </Button>
            </div>

            {/* 状态Tab栏 */}
            <div className="tabs-container">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="status-tabs"
                >
                    {statusTabs.map(tab => (
                        <Tabs.Tab
                            key={tab.key}
                            title={
                                <Badge content={tabBadges[tab.key] || 0} style={{ '--right': '-10px', '--top': '3px' }}>
                                    <span>{tab.title}</span>
                                </Badge>
                            }
                        />
                    ))}
                </Tabs>
            </div>

            {/* 任务列表 */}
            <div className="task-list-container">
                <PullToRefresh
                    onRefresh={handleRefresh}
                    renderText={status => {
                        if (status === 'pulling') return '下拉刷新'
                        if (status === 'canRelease') return '释放立即刷新'
                        if (status === 'refreshing') return '加载中...'
                        if (status === 'complete') return '刷新完成'
                        return ''
                    }}
                >
                    {loading && tasks.length === 0 ? (
                        <div className="loading-container">
                            <SpinLoading style={{ '--size': '48px' }} />
                            <span className="loading-text">加载中...</span>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <Empty
                            style={{ padding: '64px 0' }}
                            image={<FilterOutline style={{ fontSize: 64, color: '#ccc' }} />}
                            description="暂无任务"
                        />
                    ) : (
                        <>
                            <div className="task-grid">
                                {filteredTasks.map(renderTaskCard)}
                            </div>
                            <InfiniteScroll
                                loadMore={loadMore}
                                hasMore={hasMore}
                                threshold={50}
                            >
                                {hasMore ? (
                                    <div className="loading-more">
                                        <DotLoading />
                                        <span>加载更多</span>
                                    </div>
                                ) : (
                                    <div className="no-more">没有更多了</div>
                                )}
                            </InfiniteScroll>
                        </>
                    )}
                </PullToRefresh>
            </div>
        </div>
    )
}

export default TaskList
