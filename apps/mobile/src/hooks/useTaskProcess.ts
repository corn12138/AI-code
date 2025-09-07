/**
 * 任务流程处理Hook
 * 封装任务流程相关的业务逻辑，提供统一的接口
 */

import { useTaskProcessStore } from '@/stores/taskProcessStore'
import { Toast } from 'antd-mobile'
import { useCallback, useEffect, useRef, useState } from 'react'
import { history } from 'umi'
import { useTaskDetailCache, useTaskListCache } from './useRouteCache'

export interface UseTaskProcessOptions {
    enableAutoSave?: boolean // 是否启用自动保存草稿
    autoSaveInterval?: number // 自动保存间隔（毫秒）
    enableCache?: boolean // 是否启用缓存
}

/**
 * 任务流程处理Hook
 * 
 * TODO: 数据请求预留接口 - 任务流程业务逻辑封装
 * 
 * 功能说明：
 * 1. 统一的数据加载接口
 * 2. 智能缓存管理
 * 3. 自动保存草稿
 * 4. 错误处理和重试
 * 5. 状态管理集成
 * 
 * 使用场景：
 * - TaskList组件：列表数据加载、筛选、分页
 * - TaskDetail组件：详情数据加载、缓存管理
 * - ProcessPanel组件：表单处理、自动保存、提交
 */
export const useTaskProcess = (options: UseTaskProcessOptions = {}) => {
    const {
        enableAutoSave = true,
        autoSaveInterval = 30000, // 30秒
        enableCache = true
    } = options

    const store = useTaskProcessStore()
    const listCache = useTaskListCache()
    const detailCache = useTaskDetailCache()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const autoSaveTimerRef = useRef<NodeJS.Timeout>()
    const formDataRef = useRef<any>({})

    // 错误处理
    const handleError = useCallback((error: any, context: string) => {
        console.error(`❌ ${context}失败:`, error)

        let errorMessage = '操作失败，请重试'

        // 根据错误类型提供具体的错误信息
        if (error?.response?.status === 401) {
            errorMessage = '登录已过期，请重新登录'
            // TODO: 跳转到登录页面
        } else if (error?.response?.status === 403) {
            errorMessage = '权限不足，无法执行此操作'
        } else if (error?.response?.status === 404) {
            errorMessage = '数据不存在或已被删除'
        } else if (error?.response?.status >= 500) {
            errorMessage = '服务异常，请稍后重试'
        } else if (error?.code === 'NETWORK_ERROR') {
            errorMessage = '网络连接异常，请检查网络'
        }

        setError(errorMessage)
        Toast.show({
            content: errorMessage,
            icon: 'fail'
        })
    }, [])

    // 加载任务列表
    const loadTaskList = useCallback(async (params?: {
        reset?: boolean
        useCache?: boolean
        filters?: any
    }) => {
        const { reset = false, useCache = enableCache } = params || {}

        try {
            setLoading(true)
            setError(null)

            // 尝试使用缓存
            if (useCache && !reset) {
                const cachedData = listCache.getCachedListData()
                if (cachedData) {
                    console.log('🗄️ 使用缓存的任务列表数据')
                    return cachedData
                }
            }

            /**
             * TODO: 数据请求预留接口 - 任务列表加载
             * 
             * 接口调用示例：
             * const response = await taskApi.getTaskList({
             *   page: reset ? 1 : store.state.taskPagination.current + 1,
             *   size: store.state.taskPagination.size,
             *   ...filters,
             *   ...store.state.taskFilter
             * })
             */

            // 调用store方法加载数据
            await store.loadTaskList(reset)

            // 缓存数据
            if (enableCache) {
                listCache.cacheListData({
                    tasks: store.state.tasks,
                    pagination: store.state.taskPagination,
                    filters: store.state.taskFilter,
                    scrollPosition: window.pageYOffset
                })
            }

            return {
                tasks: store.state.tasks,
                pagination: store.state.taskPagination,
                filters: store.state.taskFilter
            }
        } catch (error) {
            handleError(error, '加载任务列表')
            throw error
        } finally {
            setLoading(false)
        }
    }, [store, listCache, enableCache, handleError])

    // 加载任务详情
    const loadTaskDetail = useCallback(async (taskId: string, params?: {
        useCache?: boolean
        includeRecords?: boolean
        additionalParams?: any
    }) => {
        const { useCache = enableCache, includeRecords = true, additionalParams } = params || {}

        try {
            setLoading(true)
            setError(null)

            // 尝试使用缓存
            if (useCache) {
                const cachedData = detailCache.getCachedDetailData(taskId)
                if (cachedData) {
                    console.log('🗄️ 使用缓存的任务详情数据')
                    return cachedData
                }
            }

            /**
             * TODO: 数据请求预留接口 - 任务详情加载
             * 
             * 接口调用示例：
             * const [taskResponse, recordsResponse] = await Promise.all([
             *   taskApi.getTaskDetail(taskId, additionalParams),
             *   includeRecords ? taskApi.getProcessRecords(taskId) : Promise.resolve({ data: [] })
             * ])
             */

            // 调用store方法加载数据
            await Promise.all([
                store.loadTaskDetail(taskId, additionalParams),
                includeRecords ? store.loadProcessRecords(taskId) : Promise.resolve()
            ])

            const result = {
                task: store.state.currentTask,
                processRecords: store.state.processRecords
            }

            // 缓存数据
            if (enableCache) {
                detailCache.cacheDetailData(taskId, result)
            }

            return result
        } catch (error) {
            handleError(error, '加载任务详情')
            throw error
        } finally {
            setLoading(false)
        }
    }, [store, detailCache, enableCache, handleError])

    // 提交流程处理
    const submitProcess = useCallback(async (data: {
        taskId: string
        action?: string
        comment: string
        nextStep?: string
        nextOrg?: string
        notifyUsers?: string[]
        attachments?: string[]
        formData?: any
    }) => {
        try {
            setLoading(true)
            setError(null)

            /**
             * TODO: 数据请求预留接口 - 提交流程处理
             * 
             * 接口调用示例：
             * const response = await processApi.submit({
             *   taskId: data.taskId,
             *   action: data.action || 'approve',
             *   comment: data.comment,
             *   nextStep: data.nextStep,
             *   nextOrg: data.nextOrg,
             *   notifyUsers: data.notifyUsers || [],
             *   attachments: data.attachments || [],
             *   formData: data.formData,
             *   submitTime: new Date().toISOString()
             * })
             */

            // 调用store方法提交处理
            const processData = {
                taskId: data.taskId,
                nextStep: data.nextStep || '',
                nextOrg: data.nextOrg || '',
                notifyUsers: data.notifyUsers || [],
                comment: data.comment,
                attachments: data.attachments || []
            }
            const success = await store.submitProcess(processData)

            if (success) {
                // 清除相关缓存
                detailCache.clearDetailCache(data.taskId)
                listCache.clearListCache()

                // 清除自动保存的草稿
                if (enableAutoSave) {
                    localStorage.removeItem(`draft_${data.taskId}`)
                }

                Toast.show({
                    content: '提交成功',
                    icon: 'success'
                })

                // 延迟跳转，让用户看到成功提示
                setTimeout(() => {
                    history.push('/task-process')
                }, 1000)
            }

            return success
        } catch (error) {
            handleError(error, '提交流程处理')
            throw error
        } finally {
            setLoading(false)
        }
    }, [store, detailCache, listCache, enableAutoSave, handleError])

    // 保存草稿
    const saveDraft = useCallback(async (data: {
        taskId: string
        comment?: string
        formData?: any
        attachments?: string[]
    }) => {
        try {
            /**
             * TODO: 数据请求预留接口 - 保存草稿
             * 
             * 接口调用示例：
             * const response = await processApi.saveDraft({
             *   taskId: data.taskId,
             *   comment: data.comment || '',
             *   formData: data.formData || {},
             *   attachments: data.attachments || [],
             *   savedAt: new Date().toISOString()
             * })
             */

            // 本地保存草稿
            const localDraftData = {
                taskId: data.taskId,
                comment: data.comment || '',
                formData: data.formData || {},
                attachments: data.attachments || [],
                savedAt: new Date().toISOString()
            }

            localStorage.setItem(`draft_${data.taskId}`, JSON.stringify(localDraftData))

            // 调用store方法保存草稿
            const storeDraftData = {
                taskId: data.taskId,
                comment: data.comment || '',
                attachments: data.attachments || []
            }
            const success = await store.saveDraft(storeDraftData)

            if (success) {
                Toast.show({
                    content: '草稿保存成功',
                    icon: 'success',
                    duration: 1000
                })
            }

            return success
        } catch (error) {
            // 草稿保存失败不影响用户操作，只记录错误
            console.error('保存草稿失败:', error)
            return false
        }
    }, [store])

    // 获取草稿
    const getDraft = useCallback((taskId: string) => {
        try {
            const draftStr = localStorage.getItem(`draft_${taskId}`)
            if (draftStr) {
                const draft = JSON.parse(draftStr)
                console.log('📝 获取草稿数据:', draft)
                return draft
            }
        } catch (error) {
            console.error('获取草稿失败:', error)
        }
        return null
    }, [])

    // 自动保存表单数据
    const autoSaveFormData = useCallback((taskId: string, formData: any) => {
        formDataRef.current = formData

        if (enableAutoSave) {
            // 清除之前的定时器
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }

            // 设置新的定时器
            autoSaveTimerRef.current = setTimeout(() => {
                saveDraft({
                    taskId,
                    formData: formDataRef.current
                })
            }, autoSaveInterval)
        }
    }, [enableAutoSave, autoSaveInterval, saveDraft])

    // 搜索任务
    const searchTasks = useCallback(async (keyword: string, filters?: any) => {
        try {
            setLoading(true)
            setError(null)

            /**
             * TODO: 数据请求预留接口 - 搜索任务
             * 
             * 接口调用示例：
             * const response = await taskApi.searchTasks({
             *   keyword,
             *   ...filters,
             *   page: 1,
             *   size: 20
             * })
             */

            // 更新筛选条件
            store.updateTaskFilter({ keyword, ...filters })

            // 加载搜索结果
            await loadTaskList({ reset: true, useCache: false })

            return store.state.tasks
        } catch (error) {
            handleError(error, '搜索任务')
            throw error
        } finally {
            setLoading(false)
        }
    }, [store, loadTaskList, handleError])

    // 清理定时器
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [])

    return {
        // 数据加载
        loadTaskList: loadTaskList,
        loadTaskDetail: loadTaskDetail,
        searchTasks,

        // 流程处理
        submitProcess: submitProcess,
        saveDraft: saveDraft,
        getDraft,
        autoSaveFormData,

        // 状态
        loading,
        error,

        // 缓存管理
        clearCache: useCallback(() => {
            listCache.clearAllCache()
            detailCache.clearAllCache()
        }, [listCache, detailCache]),

        // Store状态和方法
        state: store.state,
        updateTaskFilter: store.updateTaskFilter,
        resetTaskList: store.resetTaskList,
        setSelectedTaskInfo: store.setSelectedTaskInfo,
        loadProcessRecords: store.loadProcessRecords,
        loadNextStepsByOrg: store.loadNextStepsByOrg,
        loadNextOrgsByStep: store.loadNextOrgsByStep,
        loadNotifyUsers: store.loadNotifyUsers
    }
}

export default useTaskProcess
