'use client';

import { useState } from 'react';

// 示例数据类型
interface TableData {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    role: string;
    joinDate: string;
    posts: number;
}

const sampleData: TableData[] = [
    {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        status: 'active',
        role: '管理员',
        joinDate: '2024-01-15',
        posts: 25
    },
    {
        id: 2,
        name: '李四',
        email: 'lisi@example.com',
        status: 'inactive',
        role: '编辑',
        joinDate: '2024-02-20',
        posts: 12
    },
    {
        id: 3,
        name: '王五',
        email: 'wangwu@example.com',
        status: 'active',
        role: '作者',
        joinDate: '2024-03-10',
        posts: 8
    }
];

export default function ResponsiveTable() {
    const [viewMode, setViewMode] = useState<'table' | 'cards' | 'stack'>('table');

    // 方案1: 横向滚动表格
    const ScrollableTable = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">加入日期</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文章数</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sampleData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{item.email}</div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {item.status === 'active' ? '活跃' : '停用'}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{item.role}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{item.joinDate}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{item.posts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 text-center md:hidden">
                ← 左右滑动查看更多信息 →
            </div>
        </div>
    );

    // 方案2: 卡片式布局
    const CardLayout = () => (
        <div className="space-y-4">
            {sampleData.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {item.status === 'active' ? '活跃' : '停用'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">邮箱:</span>
                            <span className="text-sm text-gray-900">{item.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">角色:</span>
                            <span className="text-sm text-gray-900">{item.role}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">加入日期:</span>
                            <span className="text-sm text-gray-900">{item.joinDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">文章数:</span>
                            <span className="text-sm font-medium text-gray-900">{item.posts}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // 方案3: 堆叠布局
    const StackLayout = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {sampleData.map((item, index) => (
                <div key={item.id} className={`p-4 ${index !== sampleData.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="space-y-3">
                        {/* 主要信息 */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {item.status === 'active' ? '活跃' : '停用'}
                            </span>
                        </div>

                        {/* 详细信息网格 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">邮箱: </span>
                                <span className="text-gray-900">{item.email}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">角色: </span>
                                <span className="text-gray-900">{item.role}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">加入日期: </span>
                                <span className="text-gray-900">{item.joinDate}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">文章数: </span>
                                <span className="font-medium text-gray-900">{item.posts}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">移动端表格自适应方案</h2>

                {/* 切换按钮 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'table'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        横向滚动表格
                    </button>
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'cards'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        卡片布局
                    </button>
                    <button
                        onClick={() => setViewMode('stack')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'stack'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        堆叠布局
                    </button>
                </div>
            </div>

            {/* 根据选择的模式渲染不同组件 */}
            {viewMode === 'table' && <ScrollableTable />}
            {viewMode === 'cards' && <CardLayout />}
            {viewMode === 'stack' && <StackLayout />}

            {/* 方案说明 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">方案说明:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li><strong>横向滚动:</strong> 保持表格结构，用户可以左右滑动查看所有列</li>
                    <li><strong>卡片布局:</strong> 每行数据转换为独立卡片，信息更清晰</li>
                    <li><strong>堆叠布局:</strong> 紧凑的列表形式，适合快速浏览</li>
                </ul>
            </div>
        </div>
    );
}