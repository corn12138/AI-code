/**
 * 报告信息组件
 * 展示报告的详细信息，参考pc.jpg和ui1.jpg的设计
 */

import { TaskDetail } from '@/stores/taskProcess/types'
import {
    Button,
    Card,
    List
} from 'antd-mobile'
import {
    CalendarOutline,
    FileOutline,
    RightOutline,
    TeamOutline,
    UserOutline
} from 'antd-mobile-icons'
import React from 'react'
import { history } from 'umi'
import './TaskInfo.css'

interface TaskInfoProps {
    task: TaskDetail | null
}

// 模拟报告信息数据
const mockReportData = {
    reportNumber: '20250107/10',
    reportName: '测试123',
    reportType: '定期报告',
    reportLevel: '普通密级',
    classifyBasis: '测试1',
    reportInitiator: '010080 (010080)',
    reportDescription: '111',
    officialTemplate: [
        '60b93085a6b448a982',
        '20250107/10_175671294297_G00800001.docx'
    ],
    directory: 'abb3a3e86e8b42d9af5c1433e8d8f01',
    attachments: [
        '兴业银行2024年年度报告正文报告.docx'
    ],
    knowledgeLink: 'https://www.financialreports.com/trends-in-corporate-financial-reporting'
}

const TaskInfo: React.FC<TaskInfoProps> = ({ task }) => {
    // 导航到文件列表页面
    const navigateToFileList = (fileType: 'template' | 'attachment', files: string[]) => {
        // 构建文件列表页面URL
        const params = new URLSearchParams({
            type: fileType,
            files: JSON.stringify(files)
        })

        // 使用umi的history进行路由跳转
        history.push(`/task-process/file-list?${params.toString()}`)
    }

    // 渲染基本信息部分
    const renderBasicInfo = () => (
        <Card className="info-section" title="基本信息">
            <List>
                <List.Item
                    prefix={<FileOutline />}
                    extra={task?.type || '投诉申请'}
                >
                    任务类型
                </List.Item>
                <List.Item
                    prefix={<UserOutline />}
                    extra={task?.applicant || '张三'}
                >
                    申请人
                </List.Item>
                <List.Item
                    prefix={<TeamOutline />}
                    extra={task?.applicantDept || '技术部'}
                >
                    申请部门
                </List.Item>
                <List.Item
                    prefix={<CalendarOutline />}
                    extra={task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : '2024/12/1 17:00:00'}
                >
                    创建时间
                </List.Item>
                <List.Item
                    prefix={<CalendarOutline />}
                    extra={task?.deadline ? new Date(task.deadline).toLocaleDateString() : '2024/12/11 02:00:00'}
                >
                    截止时间
                </List.Item>
                <List.Item
                    prefix={<FileOutline />}
                    extra={task?.currentStep || '复审'}
                >
                    当前步骤
                </List.Item>
            </List>
        </Card>
    )

    // 渲染报告信息部分 - 参考pc.jpg的字段，ui1.jpg的布局
    const renderReportInfo = () => (
        <Card className="info-section" /* title="报告信息" */>
            <List>
                <List.Item extra="请输入报告编号">
                    披露报告编号
                </List.Item>
                <List.Item extra={mockReportData.reportNumber}>
                    报告编号
                </List.Item>
                <List.Item extra={mockReportData.reportName}>
                    披露报告名称
                </List.Item>
                <List.Item extra={mockReportData.reportType}>
                    披露报告类型
                </List.Item>
                <List.Item extra={mockReportData.reportLevel}>
                    披露报告密级
                </List.Item>
                <List.Item extra={mockReportData.classifyBasis}>
                    定密依据
                </List.Item>
                <List.Item extra={mockReportData.reportInitiator}>
                    披露报告发起人
                </List.Item>
                <List.Item extra={mockReportData.reportDescription}>
                    披露报告说明
                </List.Item>
                {/* 公务模板 - 参考ui1.jpg用印文本的样式 */}
                <List.Item
                    extra={
                        <Button
                            fill="none"
                            color="primary"
                            size="small"
                            onClick={() => navigateToFileList('template', mockReportData.officialTemplate)}
                        >
                            查看{mockReportData.officialTemplate.length}个文件
                        </Button>
                    }
                    arrow={<RightOutline />}
                    onClick={() => navigateToFileList('template', mockReportData.officialTemplate)}
                >
                    公务模板
                </List.Item>
                <List.Item extra={mockReportData.directory}>
                    目录
                </List.Item>
                {/* 附件 - 参考ui1.jpg用印文本的样式 */}
                <List.Item
                    extra={
                        <Button
                            fill="none"
                            color="primary"
                            size="small"
                            onClick={() => navigateToFileList('attachment', mockReportData.attachments)}
                        >
                            查看{mockReportData.attachments.length}个文件
                        </Button>
                    }
                    arrow={<RightOutline />}
                    onClick={() => navigateToFileList('attachment', mockReportData.attachments)}
                >
                    附件
                </List.Item>
                <List.Item extra={mockReportData.knowledgeLink}>
                    知识库连接
                </List.Item>
            </List>
        </Card>
    )

    if (!task) {
        return (
            <div className="task-info-empty">
                <FileOutline style={{ fontSize: 48, color: '#ccc' }} />
                <p>暂无报告信息</p>
            </div>
        )
    }

    return (
        <div className="task-info-container">
            {/* {renderBasicInfo()}
            <Divider style={{ margin: '16px 0' }} /> */}
            {renderReportInfo()}
        </div>
    )
}

export default TaskInfo
