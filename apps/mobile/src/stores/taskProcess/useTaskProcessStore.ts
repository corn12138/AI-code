/**
 * 任务处理状态管理
 * 使用 Zustand 管理任务列表、任务详情、流程状态等数据
 */

import {
    organizationApi,
    processApi,
    taskApi,
    taskListApi
} from '@/api/taskProcess'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
    Organization,
    Pagination,
    ProcessRecord,
    ProcessStep,
    TaskDetail,
    TaskFilter,
    TaskItem
} from './types'

// 状态接口
interface TaskProcessState {
    // 任务列表相关
    tasks: TaskItem[]
    filter: TaskFilter
    pagination: Pagination
    loading: boolean

    // 任务详情相关
    currentTask: TaskDetail | null
    processRecords: ProcessRecord[]

    // 联动数据
    organizations: Organization[]
    processSteps: ProcessStep[]

    // 表单状态
    selectedOrg: string | null
    selectedNextStep: string | null
    selectedNextOrg: string | null
    selectedNotifyUsers: string[]
    processOpinion: string
    formData: Record<string, any>
}

// 动作接口
interface TaskProcessActions {
    // 基础状态管理
    setTasks: (tasks: TaskItem[]) => void
    setFilter: (filter: Partial<TaskFilter>) => void
    setPagination: (pagination: Partial<Pagination>) => void
    setLoading: (loading: boolean) => void
    setCurrentTask: (task: TaskDetail | null) => void
    setProcessRecords: (records: ProcessRecord[]) => void

    // 联动数据管理
    setOrganizations: (organizations: Organization[]) => void
    setProcessSteps: (steps: ProcessStep[]) => void
    setSelectedOrg: (orgId: string | null) => void
    setSelectedNextStep: (stepId: string | null) => void
    setSelectedNextOrg: (orgId: string | null) => void
    setSelectedNotifyUsers: (userIds: string[]) => void
    setProcessOpinion: (opinion: string) => void
    setFormData: (data: Record<string, any>) => void
    updateFormField: (key: string, value: any) => void

    // API 调用
    loadTaskList: () => Promise<void>
    loadTaskDetail: (id: string) => Promise<void>
    submitProcess: (data: any) => Promise<boolean>
    saveDraft: (data: any) => Promise<boolean>
    loadOrganizations: () => Promise<void>
    loadNextStepsByOrg: (orgId: string) => Promise<void>
    loadNextOrgsByStep: (stepId: string) => Promise<void>
    loadNotifyUsers: (orgId: string) => Promise<void>
}

type TaskProcessStore = TaskProcessState & TaskProcessActions

// 初始状态
const initialState: TaskProcessState = {
    tasks: [],
    filter: {
        status: 'all',
        priority: 'all',
        keyword: '',
        dateRange: null
    },
    pagination: {
        current: 1,
        pageSize: 20,
        total: 0
    },
    loading: false,
    currentTask: null,
    processRecords: [],
    organizations: [],
    processSteps: [],
    selectedOrg: null,
    selectedNextStep: null,
    selectedNextOrg: null,
    selectedNotifyUsers: [],
    processOpinion: '',
    formData: {}
}

export const useTaskProcessStore = create<TaskProcessStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // 基础状态管理
            setTasks: (tasks) => set({ tasks }),
            setFilter: (filter) => set((state) => ({
                filter: { ...state.filter, ...filter }
            })),
            setPagination: (pagination) => set((state) => ({
                pagination: { ...state.pagination, ...pagination }
            })),
            setLoading: (loading) => set({ loading }),
            setCurrentTask: (currentTask) => set({ currentTask }),
            setProcessRecords: (processRecords) => set({ processRecords }),

            // 联动数据管理
            setOrganizations: (organizations) => set({ organizations }),
            setProcessSteps: (processSteps) => set({ processSteps }),
            setSelectedOrg: (selectedOrg) => set({ selectedOrg }),
            setSelectedNextStep: (selectedNextStep) => set({ selectedNextStep }),
            setSelectedNextOrg: (selectedNextOrg) => set({ selectedNextOrg }),
            setSelectedNotifyUsers: (selectedNotifyUsers) => set({ selectedNotifyUsers }),
            setProcessOpinion: (processOpinion) => set({ processOpinion }),
            setFormData: (formData) => set({ formData }),
            updateFormField: (key, value) => set((state) => ({
                formData: { ...state.formData, [key]: value }
            })),

            // API 调用
            loadTaskList: async () => {
                const { filter, pagination } = get()
                set({ loading: true })
                try {
                    const response = await taskListApi.getTaskList({
                        filter,
                        page: pagination.current,
                        pageSize: pagination.pageSize
                    })
                    set({
                        tasks: response.list,
                        pagination: {
                            ...pagination,
                            total: response.pagination.total
                        }
                    })
                } catch (error) {
                    console.error('加载任务列表失败:', error)
                } finally {
                    set({ loading: false })
                }
            },

            loadTaskDetail: async (id) => {
                set({ loading: true })
                try {
                    const [taskResponse, recordsResponse] = await Promise.all([
                        taskApi.getTaskDetail(id),
                        processApi.getProcessRecords(id)
                    ])
                    set({
                        currentTask: taskResponse,
                        processRecords: recordsResponse
                    })
                } catch (error) {
                    console.error('加载任务详情失败:', error)
                } finally {
                    set({ loading: false })
                }
            },

            submitProcess: async (data) => {
                try {
                    await processApi.submitProcess(data)
                    return true
                } catch (error) {
                    console.error('提交流程失败:', error)
                    return false
                }
            },

            saveDraft: async (data) => {
                try {
                    await processApi.saveDraft(data)
                    return true
                } catch (error) {
                    console.error('保存草稿失败:', error)
                    return false
                }
            },

            loadOrganizations: async () => {
                try {
                    const organizations = await organizationApi.getOrganizations()
                    set({ organizations })
                } catch (error) {
                    console.error('加载机构列表失败:', error)
                }
            },

            loadNextStepsByOrg: async (orgId) => {
                try {
                    const processSteps = await organizationApi.getNextStepsByOrg(orgId)
                    set({ processSteps })
                } catch (error) {
                    console.error('加载处理步骤失败:', error)
                }
            },

            loadNextOrgsByStep: async (stepId) => {
                try {
                    const organizations = await organizationApi.getNextOrgsByStep(stepId)
                    set({ organizations })
                } catch (error) {
                    console.error('加载处理机构失败:', error)
                }
            },

            loadNotifyUsers: async (orgId) => {
                try {
                    const users = await organizationApi.getNotifyUsers(orgId)
                    // 这里可以设置知悉人员列表
                    console.log('知悉人员:', users)
                } catch (error) {
                    console.error('加载知悉人员失败:', error)
                }
            }
        }),
        {
            name: 'task-process-store'
        }
    )
)

export type { TaskProcessStore }
