import { TaskItem } from '@/stores/taskProcessStore'
import {
    RightOutline
} from 'antd-mobile-icons'
import React from 'react'
import { history } from 'umi'
import './TaskInfo.css'

interface TaskInfoProps {
    task?: TaskItem | null
}

// 模拟报告数据 - 参考pc.jpg中的字段
const mockReportData = {
    reportNumber: 'SLCM202501071017567129429',
    reportName: '报告申请 - 差旅费用报销',
    reportType: '费用报销',
    reportLevel: '内部',
    classifyBasis: '——',
    reportInitiator: '张三',
    reportDescription: '出差北京参加会议产生的差旅费用报销申请',
    templates: ['公务模板1.docx', '公务模板2.pdf'],
    directory: '目录1',
    attachments: ['60b93085a6b448a982', '20250107/10_175671294297_G00800001.docx'],
    knowledgeBase: 'https://your.financial.reports'
}

// 文件类型判断
const getFileTypeFromName = (fileName: string): 'word' | 'excel' | 'pdf' | 'image' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
        case 'doc':
        case 'docx':
            return 'word'
        case 'xls':
        case 'xlsx':
            return 'excel'
        case 'pdf':
            return 'pdf'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'image'
        default:
            return 'other'
    }
}

// 随机状态生成
const getRandomStatus = (): 'pending' | 'electronic' | 'archive' | 'manual' | 'marked' => {
    const statuses: ('pending' | 'electronic' | 'archive' | 'manual' | 'marked')[] =
        ['pending', 'electronic', 'archive', 'manual', 'marked']
    return statuses[Math.floor(Math.random() * statuses.length)]
}

const TaskInfo: React.FC<TaskInfoProps> = ({ task }) => {
    // 跳转到文件列表页面
    const navigateToFileList = (fileType: 'template' | 'attachment', files: string[]) => {
        console.log('🗂️ 跳转到文件列表页面:', { fileType, files, task })

        // 构造文件列表数据
        const fileList = files.map((fileName, index) => ({
            id: `${fileType}_${index + 1}`,
            name: fileName,
            type: getFileTypeFromName(fileName),
            size: Math.floor(Math.random() * 20 + 5).toString(), // 模拟文件大小
            status: getRandomStatus(),
            modifyTime: new Date().toLocaleString(),
            serialNumber: `SLCM${Date.now()}${index}`,
            legalId: '取消编号',
            documentNumber: '——',
            printCount: Math.floor(Math.random() * 20 + 1)
        }))

        // 使用路由状态传递数据
        history.push('/task-process/file-list', {
            fileType,
            files: fileList,
            taskId: task?.id,
            taskTitle: task?.title
        })
    }

    // 渲染报告信息部分 - 参考ui1.jpg的左右模式布局
    const renderReportInfo = () => (
        <div className="report-info-container">
            <div className="info-grid">
                <div className="info-row">
                    <span className="info-label">披露报告编号</span>
                    <span className="info-value">请输入报告编号</span>
                </div>

                <div className="info-row">
                    <span className="info-label">报告编号</span>
                    <span className="info-value">{mockReportData.reportNumber}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">披露报告名称</span>
                    <span className="info-value">{mockReportData.reportName}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">披露报告类型</span>
                    <span className="info-value">{mockReportData.reportType}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">披露报告密级</span>
                    <span className="info-value">{mockReportData.reportLevel}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">定密依据</span>
                    <span className="info-value">{mockReportData.classifyBasis}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">披露报告发起人</span>
                    <span className="info-value">{mockReportData.reportInitiator}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">披露报告说明</span>
                    <span className="info-value">{mockReportData.reportDescription}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">公务模板</span>
                    <div className="info-value-clickable" onClick={() => navigateToFileList('template', mockReportData.templates)}>
                        <span>查看{mockReportData.templates.length}个文件</span>
                        <RightOutline />
                    </div>
                </div>

                <div className="info-row">
                    <span className="info-label">目录</span>
                    <span className="info-value">{mockReportData.directory}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">附件</span>
                    <div className="info-value-clickable" onClick={() => navigateToFileList('attachment', mockReportData.attachments)}>
                        <span>查看{mockReportData.attachments.length}个文件</span>
                        <RightOutline />
                    </div>
                </div>

                <div className="info-row">
                    <span className="info-label">知识库连接</span>
                    <span className="info-value">{mockReportData.knowledgeBase}</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className="task-info-container">
            {renderReportInfo()}
        </div>
    )
}

export default TaskInfo