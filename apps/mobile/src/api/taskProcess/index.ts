/**
 * 任务处理流程 API 服务
 * 提供任务列表、任务详情、流程处理等接口调用
 * 使用模拟数据，避免@umijs/max依赖问题
 */

import type {
    Organization,
    Pagination,
    ProcessRecord,
    ProcessStep,
    TaskDetail,
    TaskFilter,
    TaskItem
} from '@/stores'
import { TaskPriority, TaskStatus } from '@/stores/taskProcess/types'

// API 基础路径
const BASE_URL = '/api/task-process'

// 响应数据格式
interface ApiResponse<T = any> {
    success: boolean
    code: number
    message: string
    data: T
    timestamp?: number
}

// 列表响应格式
interface ListResponse<T> {
    list: T[]
    pagination: Pagination
}

/**
 * 任务列表相关 API
 */
export const taskListApi = {
    // 获取任务列表
    async getTaskList(params?: {
        filter?: TaskFilter
        page?: number
        pageSize?: number
    }): Promise<ListResponse<TaskItem>> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))

        // 返回模拟数据
        const mockTasks = getMockTaskList()
        const page = params?.page || 1
        const pageSize = params?.pageSize || 10
        const start = (page - 1) * pageSize
        const end = start + pageSize

        return {
            list: mockTasks.slice(start, end),
            pagination: {
                current: page,
                pageSize,
                total: mockTasks.length,
                totalPages: Math.ceil(mockTasks.length / pageSize)
            }
        }
    },

    // 获取任务统计
    async getTaskStatistics(): Promise<{
        total: number
        pending: number
        processing: number
        completed: number
        rejected: number
    }> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 200))

        return {
            total: 128,
            pending: 45,
            processing: 32,
            completed: 38,
            rejected: 13
        }
    }
}

/**
 * 任务详情相关 API
 */
export const taskDetailApi = {
    // 获取任务详情
    async getTaskDetail(taskId: string): Promise<TaskDetail> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        // 返回模拟数据
        return getMockTaskDetail(taskId)
    }
}

/**
 * 流程处理相关 API
 */
export const processApi = {
    // 获取流程记录
    async getProcessRecords(taskId: string): Promise<ProcessRecord[]> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 200))
        return getMockProcessRecords(taskId)
    },

    // 提交流程处理
    async submitProcess(data: {
        taskId: string
        action: string
        opinion?: string
        nextStep?: string
        nextOrg?: string
        notifyUsers?: string[]
        attachments?: string[]
    }): Promise<boolean> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('提交流程处理:', data)
        return true
    },

    // 保存草稿
    async saveDraft(data: {
        taskId: string
        nextStep?: string
        nextOrg?: string
        notifyUsers?: string[]
        opinion?: string
        urgentLevel?: string
        isUrgent?: boolean
        attachments?: string[]
    }): Promise<boolean> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        console.log('保存草稿:', data)
        return true
    }
}

/**
 * 机构相关 API
 */
export const organizationApi = {
    // 获取机构列表
    async getOrganizations(): Promise<Organization[]> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 200))
        return getMockOrganizations()
    },

    // 根据机构获取下一步骤
    async getNextStepsByOrg(orgId: string): Promise<ProcessStep[]> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 200))
        return getMockProcessSteps()
    },

    // 根据步骤获取下一机构
    async getNextOrgsByStep(stepId: string): Promise<Organization[]> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 200))
        return getMockOrganizations()
    },

    // 获取知悉人员
    async getNotifyUsers(orgId: string): Promise<any[]> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 200))
        return getMockUsers()
    }
}

/**
 * 文件相关 API
 */
export const fileApi = {
    // 文件上传
    async upload(file: File): Promise<{ url: string; name: string }> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
            url: `https://example.com/files/${file.name}`,
            name: file.name
        }
    },

    // 文件下载
    async download(url: string, filename: string): Promise<void> {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('下载文件:', url, filename)
    }
}

// ==================== 模拟数据生成函数 ====================

// 生成模拟任务列表
function getMockTaskList(): TaskItem[] {
    return Array.from({ length: 10 }, (_, index) => ({
        id: `task_${Date.now()}_${index}`,
        title: `任务${index + 1} - 流程审批申请`,
        processNumber: `PROC-${Date.now()}-${String(index + 1).padStart(3, '0')}`,
        type: ['报销申请', '请假申请', '采购申请', '项目申请'][index % 4],
        status: [TaskStatus.PENDING, TaskStatus.PROCESSING, TaskStatus.COMPLETED, TaskStatus.REJECTED][index % 4],
        priority: [TaskPriority.LOW, TaskPriority.NORMAL, TaskPriority.HIGH, TaskPriority.URGENT][index % 4],
        applicant: ['张三', '李四', '王五', '赵六'][index % 4],
        applicantDept: ['技术部', '财务部', '人力资源部', '市场部'][index % 4],
        currentStep: ['初审', '复审', '终审', '归档'][index % 4],
        currentHandler: ['张经理', '李主管', '王总监', '赵副总'][index % 4],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        deadline: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        tags: [['紧急'], ['重要'], ['常规'], ['延期']][index % 4],
        summary: `这是任务${index + 1}的简要描述...`
    }))
}

function getMockTaskDetail(taskId: string): TaskDetail {
    return {
        id: taskId,
        title: '报销申请 - 差旅费用报销',
        processNumber: 'PROC-20241205-001',
        type: '报销申请',
        status: TaskStatus.PROCESSING,
        priority: TaskPriority.NORMAL,
        applicant: '张三',
        applicantDept: '技术部',
        currentStep: '复审',
        currentHandler: '李主管',
        createdAt: '2024-12-01T09:00:00Z',
        updatedAt: '2024-12-03T14:30:00Z',
        deadline: '2024-12-10T18:00:00Z',
        tags: ['差旅', '报销'],
        summary: '出差北京产生的交通、住宿费用报销',
        description: '本次出差是为了参加重要客户会议，产生交通费1200元，住宿费800元，餐费400元，总计2400元。',
        attachments: ['发票1.jpg', '发票2.jpg', '行程单.pdf'],
        reportInfo: {
            reportType: '费用报销',
            reportContent: '差旅费用报销申请，包含交通费、住宿费、餐费等',
            reportDate: '2024-12-01',
            reporter: '张三',
            reporterDept: '技术部',
            bindingOrg: 'org_finance',
            relatedFiles: ['发票1.jpg', '发票2.jpg', '行程单.pdf']
        },
        processFlow: {
            currentStepId: 'step_review',
            nextStepId: 'step_final_review',
            nextOrgId: 'org_management',
            notifyUsers: ['user_manager', 'user_finance'],
            processOpinion: ''
        },
        history: getMockProcessRecords(taskId)
    }
}

function getMockProcessRecords(taskId: string): ProcessRecord[] {
    return [
        {
            id: 'record_1',
            taskId,
            action: '提交申请',
            step: '申请提交',
            handler: 'user_001',
            handlerName: '张三',
            department: '技术部',
            comment: '提交差旅费用报销申请',
            attachments: ['发票1.jpg', '发票2.jpg'],
            createdAt: '2024-12-01T09:00:00Z',
            duration: 5,
            status: 'success'
        },
        {
            id: 'record_2',
            taskId,
            action: '初审通过',
            step: '初审',
            handler: 'user_002',
            handlerName: '李经理',
            department: '技术部',
            comment: '费用合理，初审通过',
            createdAt: '2024-12-02T10:30:00Z',
            duration: 15,
            status: 'success'
        }
    ]
}

function getMockOrganizations(): Organization[] {
    return [
        {
            id: 'org_tech',
            name: '技术部',
            code: 'TECH',
            type: 'department',
            level: 2,
            sort: 1,
            status: 'active',
            description: '负责技术研发工作',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'org_finance',
            name: '财务部',
            code: 'FINANCE',
            type: 'department',
            level: 2,
            sort: 2,
            status: 'active',
            description: '负责财务管理工作',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    ]
}

function getMockProcessSteps(): ProcessStep[] {
    return [
        {
            id: 'step_review',
            name: '初审',
            code: 'REVIEW',
            orgId: 'org_tech',
            sort: 1,
            isRequired: true,
            description: '部门初审',
            createdAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'step_final_review',
            name: '终审',
            code: 'FINAL_REVIEW',
            orgId: 'org_finance',
            sort: 2,
            isRequired: true,
            description: '财务终审',
            createdAt: '2024-01-01T00:00:00Z'
        }
    ]
}

// 生成模拟用户列表
function getMockUsers() {
    return [
        { id: 'user_1', name: '张三', department: '技术部', position: '经理' },
        { id: 'user_2', name: '李四', department: '财务部', position: '主管' },
        { id: 'user_3', name: '王五', department: '人力资源部', position: '专员' },
        { id: 'user_4', name: '赵六', department: '市场部', position: '总监' },
        { id: 'user_5', name: '钱七', department: '技术部', position: '工程师' }
    ]
}

// 为了兼容store中的taskApi，创建taskApi别名
export const taskApi = {
    getTaskDetail: taskDetailApi.getTaskDetail,
    getTaskList: taskListApi.getTaskList,
    getTaskStatistics: taskListApi.getTaskStatistics
}