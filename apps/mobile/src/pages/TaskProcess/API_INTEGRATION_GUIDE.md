# TaskProcess 模块接口集成指南

## 📋 接口请求位置清单

根据您描述的业务流程，以下是所有需要接口请求的位置和预留的接口调用点：

## 🔄 **1. 任务列表页面 (TaskList/index.tsx)**

### 📍 **接口调用位置**：
- **文件**：`/src/pages/TaskProcess/TaskList/index.tsx`
- **函数**：`loadTaskList()` (第32行)
- **触发时机**：页面初始化、下拉刷新、上拉加载更多

### 🔌 **接口预留点**：
```typescript
// 位置：src/stores/taskProcessStore.ts 第XX行
const loadTaskList = useCallback(async (reset: boolean = false) => {
    dispatch({ type: 'SET_TASK_LOADING', payload: true })
    
    try {
        // 🔥 【接口调用点1】获取任务列表
        const response = await taskApi.getTaskList({
            page: reset ? 1 : state.taskPagination.current + 1,
            pageSize: state.taskPagination.pageSize,
            status: state.taskFilter.status,
            keyword: state.taskFilter.keyword
        })
        
        // 处理返回数据...
    } catch (error) {
        console.error('获取任务列表失败:', error)
    } finally {
        dispatch({ type: 'SET_TASK_LOADING', payload: false })
    }
}, [state])
```

### 📊 **接口参数**：
- `page`: 页码
- `pageSize`: 每页数量  
- `status`: 任务状态 ('all', 'pending', 'processing', 'completed')
- `keyword`: 搜索关键词

### 📨 **返回数据格式**：
```typescript
{
    code: 200,
    data: {
        list: TaskItem[],
        pagination: {
            current: number,
            pageSize: number,
            total: number
        }
    }
}
```

---

## 🔍 **2. 任务详情页面 (TaskDetail/index.tsx)**

### 📍 **接口调用位置**：
- **文件**：`/src/pages/TaskProcess/TaskDetail/index.tsx`
- **函数**：`loadTaskDetailData()` (第42行)
- **触发时机**：进入详情页时

### 🔌 **接口预留点**：
```typescript
// 位置：src/stores/taskProcessStore.ts 第XX行
const loadTaskDetail = useCallback(async (taskId: string, context?: any) => {
    dispatch({ type: 'SET_TASK_DETAIL_LOADING', payload: true })
    
    try {
        // 🔥 【接口调用点2】获取任务详情（包含报告信息、流程记录、公务模板、附件）
        const response = await taskApi.getTaskDetail(taskId, {
            currentStepId: context?.currentStepId,
            currentOrgId: context?.currentOrgId,
            processTypeId: context?.processTypeId
        })
        
        dispatch({ type: 'SET_CURRENT_TASK', payload: response.data.taskDetail })
        dispatch({ type: 'SET_PROCESS_RECORDS', payload: response.data.processRecords })
        
        // 存储文件信息到状态管理（用于后续文件列表页面）
        // response.data.templates 和 response.data.attachments
        
    } catch (error) {
        console.error('获取任务详情失败:', error)
    } finally {
        dispatch({ type: 'SET_TASK_DETAIL_LOADING', payload: false })
    }
}, [])
```

### 📊 **接口参数**：
- `taskId`: 任务ID
- `currentStepId`: 当前步骤ID (可选)
- `currentOrgId`: 当前机构ID (可选)  
- `processTypeId`: 流程类型ID (可选)

### 📨 **返回数据格式**：
```typescript
{
    code: 200,
    data: {
        taskDetail: TaskDetail,
        processRecords: ProcessRecord[],
        templates: FileItem[],    // 公务模板文件
        attachments: FileItem[]   // 附件文件
    }
}
```

---

## ⚙️ **3. 流程处理面板 (ProcessPanel.tsx)**

### 📍 **接口调用位置1 - 获取下一处理机构**：
- **文件**：`/src/pages/TaskProcess/TaskDetail/components/ProcessPanel.tsx`
- **触发时机**：选择"下一处理步骤"后

### 🔌 **接口预留点1**：
```typescript
// 位置：ProcessPanel.tsx 第XX行 (需要添加)
const handleStepChange = async (stepId: string) => {
    setSelectedNextStep(stepId)
    
    if (stepId) {
        try {
            // 🔥 【接口调用点3】根据步骤获取下一处理机构
            const orgResponse = await processApi.getNextOrganizations(stepId, {
                taskId: task?.id,
                currentOrgId: task?.applicantDept
            })
            
            setAvailableOrganizations(orgResponse.data)
            
        } catch (error) {
            console.error('获取下一处理机构失败:', error)
        }
    }
}
```

### 📍 **接口调用位置2 - 获取知悉人**：
- **触发时机**：选择"下一处理步骤"后

### 🔌 **接口预留点2**：
```typescript
// 继续上面的函数
try {
    // 🔥 【接口调用点4】根据步骤获取知悉人列表
    const userResponse = await processApi.getNotifyUsers(stepId, {
        taskId: task?.id,
        orgIds: selectedNextOrg // 如果选择了机构，可以进一步筛选
    })
    
    setAvailableUsers(userResponse.data)
    
} catch (error) {
    console.error('获取知悉人失败:', error)
}
```

### 📍 **接口调用位置3 - 提交处理**：
- **文件**：`/src/pages/TaskProcess/TaskDetail/components/ProcessPanel.tsx`
- **函数**：`handleSubmit()` (第73行)
- **触发时机**：点击"提交"按钮

### 🔌 **接口预留点3**：
```typescript
// 位置：src/stores/taskProcessStore.ts 第XX行
const submitProcess = useCallback(async (data: {
    taskId: string
    nextStep: string
    nextOrg: string
    notifyUsers: string[]
    comment: string
    attachments: any[]
}) => {
    try {
        // 🔥 【接口调用点5】提交流程处理
        const response = await processApi.submitProcess({
            taskId: data.taskId,
            nextStepId: data.nextStep,
            nextOrgIds: data.nextOrg.split(','), // 多个机构用逗号分隔
            notifyUserIds: data.notifyUsers,
            processComment: data.comment,
            attachments: data.attachments
        })
        
        // 提交成功后可能需要刷新任务详情
        if (response.code === 200) {
            await loadTaskDetail(data.taskId)
        }
        
        return response
        
    } catch (error) {
        console.error('提交流程处理失败:', error)
        throw error
    }
}, [loadTaskDetail])
```

---

## 📁 **4. 文件列表页面 (FileList/index.tsx)**

### 📍 **数据来源**：
- **来源**：任务详情接口返回的文件数据
- **存储位置**：状态管理中的文件信息
- **触发方式**：点击"公务模板"或"附件"时存储并跳转

### 🔌 **数据传递预留点**：
```typescript
// 位置：TaskInfo.tsx 中（需要添加点击事件）
const handleTemplateClick = () => {
    // 🔥 【数据传递点1】存储公务模板文件到状态管理
    setFileList({
        type: 'template',
        files: taskDetail.templates || [],
        title: '公务模板'
    })
    
    history.push('/task-process/files')
}

const handleAttachmentClick = () => {
    // 🔥 【数据传递点2】存储附件文件到状态管理  
    setFileList({
        type: 'attachment',
        files: taskDetail.attachments || [],
        title: '附件列表'
    })
    
    history.push('/task-process/files')
}
```

### 📍 **文件下载接口**：
```typescript
// 位置：FileList/index.tsx 中
const handleDownload = async (fileId: string, fileName: string) => {
    try {
        // 🔥 【接口调用点6】文件下载
        const response = await fileApi.downloadFile(fileId)
        
        // 处理文件下载...
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        
    } catch (error) {
        console.error('文件下载失败:', error)
    }
}
```

---

## 🛠️ **接口配置文件**

### 📁 **API配置位置**：
- **文件**：`/src/api/taskProcess/index.ts`

### 🔌 **接口定义预留**：
```typescript
// 需要在 src/api/taskProcess/index.ts 中添加以下接口定义：

export const taskApi = {
    // 获取任务列表
    getTaskList: (params: TaskListParams) => request.get('/api/tasks', { params }),
    
    // 获取任务详情
    getTaskDetail: (taskId: string, context?: any) => 
        request.get(`/api/tasks/${taskId}`, { params: context })
}

export const processApi = {
    // 获取下一处理机构
    getNextOrganizations: (stepId: string, params: any) => 
        request.get(`/api/process/next-organizations/${stepId}`, { params }),
    
    // 获取知悉人
    getNotifyUsers: (stepId: string, params: any) => 
        request.get(`/api/process/notify-users/${stepId}`, { params }),
    
    // 提交流程处理
    submitProcess: (data: ProcessSubmitData) => 
        request.post('/api/process/submit', data)
}

export const fileApi = {
    // 文件下载
    downloadFile: (fileId: string) => 
        request.get(`/api/files/download/${fileId}`, { responseType: 'blob' })
}
```

---

## 🚀 **集成步骤**

1. **配置接口地址**：在 `src/api/taskProcess/index.ts` 中配置实际的接口地址
2. **替换模拟数据**：将各个组件中的 `mock` 数据替换为实际接口调用
3. **调整数据格式**：根据后端实际返回格式调整前端数据处理逻辑
4. **错误处理**：完善各个接口的错误处理和用户提示
5. **测试验证**：逐个测试各个接口调用点的功能

## ⚠️ **注意事项**

- 所有接口调用都已集中在状态管理中，便于统一管理和维护
- 文件数据通过状态管理传递，避免重复接口调用
- 级联选择逻辑已预留，可根据实际业务需求调整
- 错误处理和Loading状态已完善，提升用户体验

