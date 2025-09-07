import { useTaskProcessStore } from '@/stores/taskProcessStore'
import {
    Button,
    Card,
    Empty,
    InfiniteScroll,
    PullToRefresh,
    SearchBar,
    SpinLoading,
    Tabs,
    Tag
} from 'antd-mobile'
import { ClockCircleOutline, FilterOutline } from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { history } from 'umi'
import './index.css'

const TaskList: React.FC = () => {
    const {
        state: { tasks: taskList, taskLoading: loading, taskPagination },
        loadTaskList,
        setSelectedTaskInfo
    } = useTaskProcessStore()

    // 计算是否还有更多数据
    const hasMore = taskList.length < taskPagination.total

    const [activeTab, setActiveTab] = useState('all')
    const [searchText, setSearchText] = useState('')

    useEffect(() => {
        loadTaskList()
    }, [])

    const handleTaskClick = (task: any) => {
        setSelectedTaskInfo(task)
        console.log('📋 列表页选中任务:', task)
        history.push(`/task-process/detail/${task.id}`)
    }

    const loadMore = async () => {
        if (!hasMore || loading) return
        // 直接调用loadTaskList，它会自动处理分页
        await loadTaskList()
    }

    const onRefresh = async () => {
        await loadTaskList()
    }

    const renderTaskCard = (task: any) => (
        <Card
            key={task.id}
            className="task-card"
            onClick={() => handleTaskClick(task)}
        >
            <div className="task-card-header">
                <div className="task-info">
                    <div className="task-id">流程编号：{task.id}</div>
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                        <Tag className="task-type" color="primary">
                            {task.type}
                        </Tag>
                        <Tag className="task-priority" color="warning">
                            {task.priority}
                        </Tag>
                        <Tag className="task-status" color="default">
                            {task.status}
                        </Tag>
                    </div>
                </div>
            </div>
            <div className="task-meta">
                <span>申请人：{task.applicant}</span>
                <span>申请部门：{task.applicantDept}</span>
            </div>
            <div className="task-meta">
                <span>当前步骤：{task.currentStep}</span>
                <span>
                    <ClockCircleOutline style={{ marginRight: 4 }} />
                    截止时间：2024/12/11
                </span>
            </div>
        </Card>
    )

    return (
        <div className="task-list-page">
            {/* 搜索头部 */}
            <div className="search-header">
                <SearchBar
                    className="task-search-bar"
                    placeholder="搜索任务标题、流程编号"
                    value={searchText}
                    onChange={setSearchText}
                />
                <Button className="filter-button">
                    <FilterOutline />
                </Button>
            </div>

            {/* Tab切换 */}
            <div className="tabs-container">
                <Tabs
                    className="task-tabs"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                >
                    <Tabs.Tab title="全部" key="all" />
                    <Tabs.Tab title="待处理" key="pending" />
                    <Tabs.Tab title="处理中" key="processing" />
                    <Tabs.Tab title="已完成" key="completed" />
                </Tabs>
            </div>

            {/* 任务列表 */}
            <div className="task-list-container">
                <PullToRefresh onRefresh={onRefresh}>
                    <div className="task-grid">
                        {loading && taskList.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '50px 0'
                            }}>
                                <SpinLoading size="large" />
                            </div>
                        ) : taskList.length === 0 ? (
                            <Empty
                                description="暂无任务数据"
                                style={{ padding: '50px 0' }}
                            />
                        ) : (
                            taskList.map(renderTaskCard)
                        )}
                    </div>
                    <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                        {hasMore ? (
                            <div className="infinite-scroll-content">
                                <SpinLoading />
                                <span>加载中...</span>
                            </div>
                        ) : (
                            <div className="infinite-scroll-content">
                                没有更多了
                            </div>
                        )}
                    </InfiniteScroll>
                </PullToRefresh>
            </div>
        </div>
    )
}

export default TaskList