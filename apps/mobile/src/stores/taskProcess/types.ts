/**
 * 任务处理相关的类型定义
 */

// 任务状态枚举
export enum TaskStatus {
    PENDING = 'pending',       // 待处理
    PROCESSING = 'processing', // 处理中
    COMPLETED = 'completed',   // 已完成
    REJECTED = 'rejected',     // 已驳回
    CANCELLED = 'cancelled'    // 已取消
}

// 任务优先级枚举
export enum TaskPriority {
    LOW = 'low',         // 低
    NORMAL = 'normal',   // 普通
    HIGH = 'high',       // 高
    URGENT = 'urgent'    // 紧急
}

// 机构信息
export interface Organization {
    id: string
    name: string
    code: string
    type: string
    parentId?: string
    level: number
    sort: number
    status: 'active' | 'inactive'
    description?: string
    createdAt: string
    updatedAt: string
}

// 处理步骤
export interface ProcessStep {
    id: string
    name: string
    code: string
    orgId: string
    sort: number
    isRequired: boolean
    description?: string
    nextSteps?: string[]
    createdAt: string
}

// 任务项
export interface TaskItem {
    id: string
    title: string
    processNumber: string
    type: string
    status: TaskStatus
    priority: TaskPriority
    applicant: string
    applicantDept: string
    currentStep: string
    currentHandler?: string
    createdAt: string
    updatedAt: string
    deadline?: string
    tags?: string[]
    summary?: string
}

// 任务详情
export interface TaskDetail extends TaskItem {
    description: string
    attachments: string[]
    reportInfo: {
        reportType: string
        reportContent: string
        reportDate: string
        reporter: string
        reporterDept: string
        bindingOrg?: string
        relatedFiles?: string[]
    }
    processFlow: {
        currentStepId: string
        nextStepId?: string
        nextOrgId?: string
        notifyUsers?: string[]
        processOpinion?: string
    }
    history: ProcessRecord[]
}

// 流程记录
export interface ProcessRecord {
    id: string
    taskId: string
    action: string
    step: string
    handler: string
    handlerName: string
    department: string
    comment?: string
    attachments?: string[]
    createdAt: string
    duration?: number
    status: 'success' | 'failed' | 'pending' | 'processing' | 'completed'
}

// 任务筛选条件
export interface TaskFilter {
    status?: TaskStatus | 'all'
    priority?: TaskPriority | 'all'
    keyword?: string
    dateRange?: [string, string] | null
    currentStep?: string
    applicantDept?: string
}

// 分页信息
export interface Pagination {
    current: number
    pageSize: number
    total: number
    totalPages?: number
}
