'use client';

import { useAuth } from '@corn12138/hooks';
import {
    CalendarIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    Cog6ToothIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: 'usage' | 'performance' | 'content' | 'financial' | 'custom';
    format: 'pdf' | 'excel' | 'csv' | 'json';
    fields: string[];
    schedule?: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
        dayOfWeek?: number;
        dayOfMonth?: number;
        time: string;
    };
}

interface ReportExecution {
    id: string;
    templateId: string;
    templateName: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    createdAt: string;
    completedAt?: string;
    downloadUrl?: string;
    error?: string;
    size?: number;
}

export default function ReportGenerator() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [executions, setExecutions] = useState<ReportExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);

    // 预定义报告模板
    const defaultTemplates: ReportTemplate[] = [
        {
            id: 'usage-summary',
            name: 'AI使用情况汇总',
            description: '包含AI请求数、Token使用量、费用等核心指标',
            type: 'usage',
            format: 'pdf',
            fields: ['requests', 'tokens', 'cost', 'responseTime', 'models'],
        },
        {
            id: 'performance-report',
            name: '系统性能报告',
            description: '系统性能指标、错误率、响应时间分析',
            type: 'performance',
            format: 'excel',
            fields: ['cpuUsage', 'memoryUsage', 'errorRate', 'uptime', 'latency'],
        },
        {
            id: 'content-analytics',
            name: '内容创作分析',
            description: '文章发布情况、分类统计、创作效率分析',
            type: 'content',
            format: 'csv',
            fields: ['articles', 'drafts', 'categories', 'wordCount', 'publishRate'],
        },
        {
            id: 'financial-summary',
            name: '费用分析报告',
            description: '详细的费用分析、成本分布、预算对比',
            type: 'financial',
            format: 'pdf',
            fields: ['totalCost', 'modelCosts', 'trends', 'projections'],
        }
    ];

    useEffect(() => {
        loadTemplates();
        loadExecutions();
    }, []);

    const loadTemplates = async () => {
        try {
            // 在实际环境中，这里应该从API加载用户的自定义模板
            // 现在使用默认模板
            setTemplates(defaultTemplates);
        } catch (error) {
            console.error('加载报告模板失败:', error);
            toast.error('加载报告模板失败');
        }
    };

    const loadExecutions = async () => {
        try {
            // 模拟加载历史执行记录
            const mockExecutions: ReportExecution[] = [
                {
                    id: 'exec-1',
                    templateId: 'usage-summary',
                    templateName: 'AI使用情况汇总',
                    status: 'completed',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    completedAt: new Date(Date.now() - 86400000 + 30000).toISOString(),
                    downloadUrl: '/api/reports/download/exec-1',
                    size: 2048576 // 2MB
                },
                {
                    id: 'exec-2',
                    templateId: 'performance-report',
                    templateName: '系统性能报告',
                    status: 'completed',
                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                    completedAt: new Date(Date.now() - 172800000 + 45000).toISOString(),
                    downloadUrl: '/api/reports/download/exec-2',
                    size: 5242880 // 5MB
                },
                {
                    id: 'exec-3',
                    templateId: 'content-analytics',
                    templateName: '内容创作分析',
                    status: 'failed',
                    createdAt: new Date(Date.now() - 259200000).toISOString(),
                    error: '数据源连接超时'
                }
            ];

            setExecutions(mockExecutions);
        } catch (error) {
            console.error('加载执行记录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (template: ReportTemplate, customOptions?: any) => {
        try {
            setGenerating(template.id);

            // 创建新的执行记录
            const newExecution: ReportExecution = {
                id: `exec-${Date.now()}`,
                templateId: template.id,
                templateName: template.name,
                status: 'generating',
                createdAt: new Date().toISOString(),
            };

            setExecutions(prev => [newExecution, ...prev]);

            // 模拟报告生成过程
            await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

            // 模拟成功/失败
            const success = Math.random() > 0.1; // 90% 成功率

            if (success) {
                const completedExecution: ReportExecution = {
                    ...newExecution,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    downloadUrl: `/api/reports/download/${newExecution.id}`,
                    size: Math.floor(Math.random() * 10000000) + 1000000 // 1-10MB
                };

                setExecutions(prev =>
                    prev.map(exec => exec.id === newExecution.id ? completedExecution : exec)
                );

                toast.success(`报告生成成功：${template.name}`);

                // 自动下载（在实际环境中）
                // window.open(completedExecution.downloadUrl, '_blank');
            } else {
                const failedExecution: ReportExecution = {
                    ...newExecution,
                    status: 'failed',
                    error: '数据处理过程中出现错误'
                };

                setExecutions(prev =>
                    prev.map(exec => exec.id === newExecution.id ? failedExecution : exec)
                );

                toast.error(`报告生成失败：${template.name}`);
            }

        } catch (error) {
            console.error('生成报告失败:', error);
            toast.error('生成报告失败');
        } finally {
            setGenerating(null);
        }
    };

    const downloadReport = (execution: ReportExecution) => {
        if (execution.downloadUrl) {
            // 在实际环境中，这里会下载真实的文件
            toast.success(`开始下载：${execution.templateName}`);
            console.log('下载URL:', execution.downloadUrl);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'pdf': return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
            case 'excel': return <TableCellsIcon className="h-5 w-5 text-green-500" />;
            case 'csv': return <TableCellsIcon className="h-5 w-5 text-blue-500" />;
            case 'json': return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
            default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        已完成
                    </span>
                );
            case 'generating':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <ClockIcon className="w-3 h-3 mr-1 animate-spin" />
                        生成中
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        已失败
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        等待中
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">报告生成器</h2>
                    <p className="text-gray-600">生成和下载各种数据分析报告</p>
                </div>
                <button
                    onClick={() => setShowTemplateEditor(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    自定义模板
                </button>
            </div>

            {/* 报告模板 */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">报告模板</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <ChartBarIcon className="h-5 w-5 text-blue-500" />
                                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                                        {getFormatIcon(template.format)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {template.fields.slice(0, 3).map((field, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                {field}
                                            </span>
                                        ))}
                                        {template.fields.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                +{template.fields.length - 3} 更多
                                            </span>
                                        )}
                                    </div>

                                    {template.schedule?.enabled && (
                                        <div className="flex items-center space-x-2 text-xs text-blue-600 mb-4">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>定时报告：{template.schedule.frequency}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-1 rounded-full ${template.type === 'usage' ? 'bg-blue-100 text-blue-700' :
                                    template.type === 'performance' ? 'bg-green-100 text-green-700' :
                                        template.type === 'content' ? 'bg-purple-100 text-purple-700' :
                                            template.type === 'financial' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                    {template.type}
                                </span>

                                <button
                                    onClick={() => generateReport(template)}
                                    disabled={generating === template.id}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${generating === template.id
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {generating === template.id ? (
                                        <div className="flex items-center space-x-2">
                                            <ClockIcon className="h-4 w-4 animate-spin" />
                                            <span>生成中...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <DocumentArrowDownIcon className="h-4 w-4" />
                                            <span>生成报告</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 执行历史 */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">执行历史</h3>
                    <button
                        onClick={loadExecutions}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        刷新
                    </button>
                </div>

                {executions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        报告名称
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状态
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        创建时间
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        文件大小
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {executions.map((execution) => (
                                    <tr key={execution.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {execution.templateName}
                                            </div>
                                            {execution.error && (
                                                <div className="text-sm text-red-600">
                                                    {execution.error}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(execution.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(execution.createdAt).toLocaleString('zh-CN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {execution.size ? formatFileSize(execution.size) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {execution.status === 'completed' && execution.downloadUrl ? (
                                                <button
                                                    onClick={() => downloadReport(execution)}
                                                    className="text-blue-600 hover:text-blue-500"
                                                >
                                                    下载
                                                </button>
                                            ) : execution.status === 'failed' ? (
                                                <button
                                                    onClick={() => {
                                                        const template = templates.find(t => t.id === execution.templateId);
                                                        if (template) generateReport(template);
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-500"
                                                >
                                                    重试
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无执行记录</h3>
                        <p className="mt-1 text-sm text-gray-500">选择模板生成您的第一份报告</p>
                    </div>
                )}
            </div>

            {/* 快速操作 */}
            <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">快速操作</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => {
                            const template = templates.find(t => t.id === 'usage-summary');
                            if (template) generateReport(template);
                        }}
                        className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ChartBarIcon className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">生成本月使用报告</span>
                    </button>

                    <button
                        onClick={() => {
                            const template = templates.find(t => t.id === 'performance-report');
                            if (template) generateReport(template);
                        }}
                        className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ClockIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">系统性能分析</span>
                    </button>

                    <button
                        onClick={() => {
                            const template = templates.find(t => t.id === 'financial-summary');
                            if (template) generateReport(template);
                        }}
                        className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">费用明细报告</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 