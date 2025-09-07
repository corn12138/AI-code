/**
 * 任务处理状态管理
 * 使用React Context + useReducer实现，不依赖外部库
 */

import { organizationApi, processApi, taskApi } from '@/api/taskProcess'
import type {
    Organization,
    Pagination,
    ProcessRecord,
    ProcessStep,
    TaskDetail,
    TaskFilter,
    TaskItem,
    TaskStatus
} from '@/stores/taskProcess/types'
import React, { createContext, ReactNode, useCallback, useContext, useReducer } from 'react'

// 状态类型定义
interface TaskProcessState {
    // 任务列表相关
    tasks: TaskItem[]
    taskFilter: TaskFilter
    taskPagination: Pagination
    taskLoading: boolean

    // 任务详情相关
    currentTask: TaskDetail | null
    taskDetailLoading: boolean

    // 当前选中的任务基础信息（从列表页传递）
    selectedTaskInfo: TaskItem | null

    // 流程记录
    processRecords: ProcessRecord[]
    recordsLoading: boolean

    // 组织机构
    organizations: Organization[]
    orgLoading: boolean

    // 流程步骤
    processSteps: ProcessStep[]
    stepsLoading: boolean

    // 处理机构
    nextOrganizations: Organization[]
    nextOrgLoading: boolean

    // 知悉人
    notifyUsers: Array<{ id: string; name: string; avatar?: string }>
    usersLoading: boolean
}

// Action类型定义
type TaskProcessAction =
    | { type: 'SET_TASKS'; payload: TaskItem[] }
    | { type: 'SET_TASK_FILTER'; payload: Partial<TaskFilter> }
    | { type: 'SET_TASK_PAGINATION'; payload: Partial<Pagination> }
    | { type: 'SET_TASK_LOADING'; payload: boolean }
    | { type: 'SET_CURRENT_TASK'; payload: TaskDetail | null }
    | { type: 'SET_TASK_DETAIL_LOADING'; payload: boolean }
    | { type: 'SET_SELECTED_TASK_INFO'; payload: TaskItem | null }
    | { type: 'SET_PROCESS_RECORDS'; payload: ProcessRecord[] }
    | { type: 'SET_RECORDS_LOADING'; payload: boolean }
    | { type: 'SET_ORGANIZATIONS'; payload: Organization[] }
    | { type: 'SET_ORG_LOADING'; payload: boolean }
    | { type: 'SET_PROCESS_STEPS'; payload: ProcessStep[] }
    | { type: 'SET_STEPS_LOADING'; payload: boolean }
    | { type: 'SET_NEXT_ORGANIZATIONS'; payload: Organization[] }
    | { type: 'SET_NEXT_ORG_LOADING'; payload: boolean }
    | { type: 'SET_NOTIFY_USERS'; payload: Array<{ id: string; name: string; avatar?: string }> }
    | { type: 'SET_USERS_LOADING'; payload: boolean }

// 初始状态
const initialState: TaskProcessState = {
    tasks: [],
    taskFilter: {
        status: 'all',
        priority: 'all',
        keyword: '',
        dateRange: null
    },
    taskPagination: {
        current: 1,
        pageSize: 20,
        total: 0
    },
    taskLoading: false,
    currentTask: null,
    taskDetailLoading: false,
    selectedTaskInfo: null,
    processRecords: [],
    recordsLoading: false,
    organizations: [],
    orgLoading: false,
    processSteps: [],
    stepsLoading: false,
    nextOrganizations: [],
    nextOrgLoading: false,
    notifyUsers: [],
    usersLoading: false
}

// Reducer函数
const taskProcessReducer = (state: TaskProcessState, action: TaskProcessAction): TaskProcessState => {
    switch (action.type) {
        case 'SET_TASKS':
            return { ...state, tasks: action.payload }
        case 'SET_TASK_FILTER':
            return { ...state, taskFilter: { ...state.taskFilter, ...action.payload } }
        case 'SET_TASK_PAGINATION':
            return { ...state, taskPagination: { ...state.taskPagination, ...action.payload } }
        case 'SET_TASK_LOADING':
            return { ...state, taskLoading: action.payload }
        case 'SET_CURRENT_TASK':
            return { ...state, currentTask: action.payload }
        case 'SET_TASK_DETAIL_LOADING':
            return { ...state, taskDetailLoading: action.payload }
        case 'SET_SELECTED_TASK_INFO':
            return { ...state, selectedTaskInfo: action.payload }
        case 'SET_PROCESS_RECORDS':
            return { ...state, processRecords: action.payload }
        case 'SET_RECORDS_LOADING':
            return { ...state, recordsLoading: action.payload }
        case 'SET_ORGANIZATIONS':
            return { ...state, organizations: action.payload }
        case 'SET_ORG_LOADING':
            return { ...state, orgLoading: action.payload }
        case 'SET_PROCESS_STEPS':
            return { ...state, processSteps: action.payload }
        case 'SET_STEPS_LOADING':
            return { ...state, stepsLoading: action.payload }
        case 'SET_NEXT_ORGANIZATIONS':
            return { ...state, nextOrganizations: action.payload }
        case 'SET_NEXT_ORG_LOADING':
            return { ...state, nextOrgLoading: action.payload }
        case 'SET_NOTIFY_USERS':
            return { ...state, notifyUsers: action.payload }
        case 'SET_USERS_LOADING':
            return { ...state, usersLoading: action.payload }
        default:
            return state
    }
}

// Context定义
interface TaskProcessContextType {
    state: TaskProcessState
    dispatch: React.Dispatch<TaskProcessAction>
    // Actions
    loadTaskList: (reset?: boolean) => Promise<void>
    setSelectedTaskInfo: (taskInfo: TaskItem | null) => void
    loadTaskDetail: (taskId: string, contextData?: {
        currentStepId?: string;
        currentOrgId?: string;
        processTypeId?: string;
    }) => Promise<void>
    loadProcessRecords: (taskId: string) => Promise<void>
    loadOrganizations: () => Promise<void>
    loadNextStepsByOrg: (orgId: string) => Promise<void>
    loadNextOrgsByStep: (stepId: string) => Promise<void>
    loadNotifyUsers: (orgId: string) => Promise<void>
    submitProcess: (params: {
        taskId: string
        nextStep: string
        nextOrg: string
        notifyUsers: string[]
        comment: string
        attachments?: string[]
        urgentLevel?: number
    }) => Promise<any>
    saveDraft: (params: {
        taskId: string
        comment: string
        attachments?: string[]
    }) => Promise<any>
    updateTaskFilter: (filter: Partial<TaskFilter>) => void
    resetTaskList: () => void
    resetTaskDetail: () => void
}

const TaskProcessContext = createContext<TaskProcessContextType | undefined>(undefined)

// Provider组件
interface TaskProcessProviderProps {
    children: ReactNode
}

export const TaskProcessProvider: React.FC<TaskProcessProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(taskProcessReducer, initialState)

    // Actions
    const loadTaskList = useCallback(async (reset = false) => {
        try {
            console.log('🔄 开始加载任务列表...', { reset, filter: state.taskFilter, pagination: state.taskPagination })
            dispatch({ type: 'SET_TASK_LOADING', payload: true })
            const pagination = reset ? { ...state.taskPagination, current: 1 } : state.taskPagination

            const response = await taskApi.getTaskList({
                filter: state.taskFilter,
                page: pagination.current,
                pageSize: pagination.pageSize
            })

            console.log('📦 API响应数据:', response)
            const tasks = response.list || []
            console.log('📋 解析后的任务列表:', tasks)

            if (reset) {
                dispatch({ type: 'SET_TASKS', payload: tasks })
            } else {
                dispatch({ type: 'SET_TASKS', payload: [...state.tasks, ...tasks] })
            }

            dispatch({
                type: 'SET_TASK_PAGINATION',
                payload: {
                    total: response.pagination.total,
                    current: response.pagination.current,
                    pageSize: response.pagination.pageSize
                }
            })
        } catch (error) {
            console.error('加载任务列表失败:', error)
        } finally {
            dispatch({ type: 'SET_TASK_LOADING', payload: false })
        }
    }, [state.taskFilter, state.taskPagination, state.tasks])

    // 设置选中的任务基础信息
    const setSelectedTaskInfo = useCallback((taskInfo: TaskItem | null) => {
        dispatch({ type: 'SET_SELECTED_TASK_INFO', payload: taskInfo })
        console.log('📋 设置选中任务信息:', taskInfo)
    }, [])

    const loadTaskDetail = useCallback(async (taskId: string, contextData?: {
        currentStepId?: string;
        currentOrgId?: string;
        processTypeId?: string;
    }) => {
        try {
            dispatch({ type: 'SET_TASK_DETAIL_LOADING', payload: true })

            // 根据上下文数据请求详情，这些数据来自selectedTaskInfo
            console.log('🔍 加载任务详情，上下文数据:', contextData)

            const response = await taskApi.getTaskDetail(taskId, contextData)
            dispatch({ type: 'SET_CURRENT_TASK', payload: response })

            console.log('✅ 任务详情加载完成:', response)
        } catch (error) {
            console.error('❌ 加载任务详情失败:', error)
            dispatch({ type: 'SET_CURRENT_TASK', payload: null })
        } finally {
            dispatch({ type: 'SET_TASK_DETAIL_LOADING', payload: false })
        }
    }, [])

    const loadProcessRecords = useCallback(async (taskId: string) => {
        try {
            dispatch({ type: 'SET_RECORDS_LOADING', payload: true })
            const response = await processApi.getProcessRecords(taskId)
            dispatch({ type: 'SET_PROCESS_RECORDS', payload: response })
        } catch (error) {
            console.error('加载流程记录失败:', error)
            dispatch({ type: 'SET_PROCESS_RECORDS', payload: [] })
        } finally {
            dispatch({ type: 'SET_RECORDS_LOADING', payload: false })
        }
    }, [])

    const loadOrganizations = useCallback(async () => {
        try {
            dispatch({ type: 'SET_ORG_LOADING', payload: true })
            const response = await organizationApi.getOrganizations()
            dispatch({ type: 'SET_ORGANIZATIONS', payload: response })
        } catch (error) {
            console.error('加载组织机构失败:', error)
            dispatch({ type: 'SET_ORGANIZATIONS', payload: [] })
        } finally {
            dispatch({ type: 'SET_ORG_LOADING', payload: false })
        }
    }, [])

    const loadNextStepsByOrg = useCallback(async (orgId: string) => {
        try {
            dispatch({ type: 'SET_STEPS_LOADING', payload: true })
            const response = await organizationApi.getNextStepsByOrg(orgId)
            dispatch({ type: 'SET_PROCESS_STEPS', payload: response })
        } catch (error) {
            console.error('加载处理步骤失败:', error)
            dispatch({ type: 'SET_PROCESS_STEPS', payload: [] })
        } finally {
            dispatch({ type: 'SET_STEPS_LOADING', payload: false })
        }
    }, [])

    const loadNextOrgsByStep = useCallback(async (stepId: string) => {
        try {
            dispatch({ type: 'SET_NEXT_ORG_LOADING', payload: true })
            const response = await organizationApi.getNextOrgsByStep(stepId)
            dispatch({ type: 'SET_NEXT_ORGANIZATIONS', payload: response })
        } catch (error) {
            console.error('加载处理机构失败:', error)
            dispatch({ type: 'SET_NEXT_ORGANIZATIONS', payload: [] })
        } finally {
            dispatch({ type: 'SET_NEXT_ORG_LOADING', payload: false })
        }
    }, [])

    const loadNotifyUsers = useCallback(async (orgId: string) => {
        try {
            dispatch({ type: 'SET_USERS_LOADING', payload: true })
            const response = await organizationApi.getNotifyUsers(orgId)
            dispatch({ type: 'SET_NOTIFY_USERS', payload: response })
        } catch (error) {
            console.error('加载知悉人失败:', error)
            dispatch({ type: 'SET_NOTIFY_USERS', payload: [] })
        } finally {
            dispatch({ type: 'SET_USERS_LOADING', payload: false })
        }
    }, [])

    const submitProcess = useCallback(async (params: {
        taskId: string
        nextStep: string
        nextOrg: string
        notifyUsers: string[]
        comment: string
        attachments?: string[]
        urgentLevel?: number
    }) => {
        try {
            const response = await processApi.submitProcess({
                ...params,
                action: 'submit',
                opinion: params.comment
            })

            // 更新当前任务状态
            if (state.currentTask && state.currentTask.id === params.taskId) {
                const updatedTask: TaskDetail = {
                    ...state.currentTask!,
                    status: 'processing' as TaskStatus
                }
                dispatch({
                    type: 'SET_CURRENT_TASK',
                    payload: updatedTask
                })
            }

            // 重新加载流程记录
            await loadProcessRecords(params.taskId)

            return response
        } catch (error) {
            console.error('提交处理失败:', error)
            throw error
        }
    }, [state.currentTask, loadProcessRecords])

    const saveDraft = useCallback(async (params: {
        taskId: string
        comment: string
        attachments?: string[]
    }) => {
        try {
            const response = await processApi.saveDraft({
                taskId: params.taskId,
                opinion: params.comment,
                attachments: params.attachments
            })
            return response
        } catch (error) {
            console.error('保存草稿失败:', error)
            throw error
        }
    }, [])

    const updateTaskFilter = useCallback((filter: Partial<TaskFilter>) => {
        dispatch({ type: 'SET_TASK_FILTER', payload: filter })
    }, [])

    const resetTaskList = useCallback(() => {
        dispatch({ type: 'SET_TASKS', payload: [] })
        dispatch({ type: 'SET_TASK_PAGINATION', payload: { current: 1, pageSize: 20, total: 0 } })
    }, [])

    const resetTaskDetail = useCallback(() => {
        dispatch({ type: 'SET_CURRENT_TASK', payload: null })
        dispatch({ type: 'SET_PROCESS_RECORDS', payload: [] })
    }, [])

    const contextValue: TaskProcessContextType = {
        state,
        dispatch,
        loadTaskList,
        setSelectedTaskInfo,
        loadTaskDetail,
        loadProcessRecords,
        loadOrganizations,
        loadNextStepsByOrg,
        loadNextOrgsByStep,
        loadNotifyUsers,
        submitProcess,
        saveDraft,
        updateTaskFilter,
        resetTaskList,
        resetTaskDetail
    }

    return React.createElement(TaskProcessContext.Provider, { value: contextValue }, children)
}

// Hook
export const useTaskProcessStore = (): TaskProcessContextType => {
    const context = useContext(TaskProcessContext)
    if (context === undefined) {
        throw new Error('useTaskProcessStore must be used within a TaskProcessProvider')
    }
    return context
}
