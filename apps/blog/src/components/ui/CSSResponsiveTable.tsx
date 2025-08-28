'use client';


export default function CSSResponsiveTable() {
    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">CSS-Only 响应式表格</h2>

            {/* 方案1: CSS 自动隐藏列 */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">方案1: 渐进式隐藏列</h3>
                <div className="overflow-x-auto bg-white rounded-lg shadow border">
                    <table className="w-full min-w-[300px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">邮箱</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">角色</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">加入日期</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">文章数</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">张三</div>
                                    <div className="text-sm text-gray-500 sm:hidden">zhangsan@example.com</div>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell text-gray-500">zhangsan@example.com</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">活跃</span>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-gray-500">管理员</td>
                                <td className="px-4 py-3 hidden lg:table-cell text-gray-500">2024-01-15</td>
                                <td className="px-4 py-3 hidden xl:table-cell text-gray-500">25</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">李四</div>
                                    <div className="text-sm text-gray-500 sm:hidden">lisi@example.com</div>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell text-gray-500">lisi@example.com</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">停用</span>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-gray-500">编辑</td>
                                <td className="px-4 py-3 hidden lg:table-cell text-gray-500">2024-02-20</td>
                                <td className="px-4 py-3 hidden xl:table-cell text-gray-500">12</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    💡 不同屏幕尺寸自动显示/隐藏列，小屏幕时重要信息堆叠显示
                </p>
            </div>

            {/* 方案2: CSS 表格转卡片 */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">方案2: CSS 表格转卡片</h3>
                <style jsx>{`
                    @media (max-width: 640px) {
                        .responsive-table,
                        .responsive-table thead,
                        .responsive-table tbody,
                        .responsive-table th,
                        .responsive-table td,
                        .responsive-table tr {
                            display: block;
                        }
                        
                        .responsive-table thead tr {
                            position: absolute;
                            top: -9999px;
                            left: -9999px;
                        }
                        
                        .responsive-table tr {
                            border: 1px solid #ccc;
                            border-radius: 8px;
                            margin-bottom: 10px;
                            padding: 10px;
                            background: white;
                        }
                        
                        .responsive-table td {
                            border: none;
                            position: relative;
                            padding-left: 50% !important;
                            padding-top: 8px;
                            padding-bottom: 8px;
                        }
                        
                        .responsive-table td:before {
                            content: attr(data-label) ": ";
                            position: absolute;
                            left: 6px;
                            width: 45%;
                            padding-right: 10px;
                            white-space: nowrap;
                            font-weight: 600;
                            color: #374151;
                        }
                    }
                `}</style>

                <div className="overflow-x-auto">
                    <table className="responsive-table w-full bg-white rounded-lg shadow border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户信息</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">联系方式</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数据</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td data-label="用户信息" className="px-4 py-3 font-medium text-gray-900">王五</td>
                                <td data-label="联系方式" className="px-4 py-3 text-gray-500">wangwu@example.com</td>
                                <td data-label="状态" className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">活跃</span>
                                </td>
                                <td data-label="角色" className="px-4 py-3 text-gray-500">作者</td>
                                <td data-label="数据" className="px-4 py-3 text-gray-500">文章: 8篇</td>
                            </tr>
                            <tr>
                                <td data-label="用户信息" className="px-4 py-3 font-medium text-gray-900">赵六</td>
                                <td data-label="联系方式" className="px-4 py-3 text-gray-500">zhaoliu@example.com</td>
                                <td data-label="状态" className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">待审</span>
                                </td>
                                <td data-label="角色" className="px-4 py-3 text-gray-500">访客</td>
                                <td data-label="数据" className="px-4 py-3 text-gray-500">文章: 0篇</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    💡 在小屏幕上自动转换为卡片形式，使用 CSS data-label 显示列标题
                </p>
            </div>

            {/* 方案3: 固定列 + 滚动 */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">方案3: 固定重要列 + 滚动</h3>
                <div className="relative bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="flex">
                        {/* 固定左侧列 */}
                        <div className="flex-shrink-0 bg-gray-50 border-r border-gray-200">
                            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                                <div className="text-xs font-medium text-gray-500 uppercase">用户</div>
                            </div>
                            <div className="px-4 py-3 border-b border-gray-200">
                                <div className="font-medium text-gray-900">张三</div>
                                <div className="text-sm text-gray-500">管理员</div>
                            </div>
                            <div className="px-4 py-3 border-b border-gray-200">
                                <div className="font-medium text-gray-900">李四</div>
                                <div className="text-sm text-gray-500">编辑</div>
                            </div>
                            <div className="px-4 py-3">
                                <div className="font-medium text-gray-900">王五</div>
                                <div className="text-sm text-gray-500">作者</div>
                            </div>
                        </div>

                        {/* 可滚动右侧区域 */}
                        <div className="flex-1 overflow-x-auto">
                            <div className="min-w-[400px]">
                                {/* 表头 */}
                                <div className="flex bg-gray-100 border-b border-gray-200">
                                    <div className="px-4 py-3 w-48 text-xs font-medium text-gray-500 uppercase">邮箱</div>
                                    <div className="px-4 py-3 w-24 text-xs font-medium text-gray-500 uppercase">状态</div>
                                    <div className="px-4 py-3 w-32 text-xs font-medium text-gray-500 uppercase">加入日期</div>
                                    <div className="px-4 py-3 w-24 text-xs font-medium text-gray-500 uppercase">文章数</div>
                                </div>

                                {/* 数据行 */}
                                <div className="flex border-b border-gray-200">
                                    <div className="px-4 py-3 w-48 text-gray-500">zhangsan@example.com</div>
                                    <div className="px-4 py-3 w-24">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">活跃</span>
                                    </div>
                                    <div className="px-4 py-3 w-32 text-gray-500">2024-01-15</div>
                                    <div className="px-4 py-3 w-24 text-gray-500">25</div>
                                </div>

                                <div className="flex border-b border-gray-200">
                                    <div className="px-4 py-3 w-48 text-gray-500">lisi@example.com</div>
                                    <div className="px-4 py-3 w-24">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">停用</span>
                                    </div>
                                    <div className="px-4 py-3 w-32 text-gray-500">2024-02-20</div>
                                    <div className="px-4 py-3 w-24 text-gray-500">12</div>
                                </div>

                                <div className="flex">
                                    <div className="px-4 py-3 w-48 text-gray-500">wangwu@example.com</div>
                                    <div className="px-4 py-3 w-24">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">活跃</span>
                                    </div>
                                    <div className="px-4 py-3 w-32 text-gray-500">2024-03-10</div>
                                    <div className="px-4 py-3 w-24 text-gray-500">8</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    💡 固定重要列，其余列可滚动查看，保持核心信息始终可见
                </p>
            </div>

            {/* 使用建议 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-yellow-800">📋 使用建议:</h3>
                <ul className="space-y-1 text-sm text-yellow-700">
                    <li><strong>数据较少:</strong> 使用渐进式隐藏列</li>
                    <li><strong>重要信息多:</strong> 使用CSS转卡片</li>
                    <li><strong>需要对比:</strong> 使用固定列+滚动</li>
                    <li><strong>复杂表格:</strong> 考虑分页或筛选功能</li>
                </ul>
            </div>
        </div>
    );
}