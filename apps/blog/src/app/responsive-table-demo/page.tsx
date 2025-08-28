import Header from '@/components/common/Header';
import CSSResponsiveTable from '@/components/ui/CSSResponsiveTable';
import ResponsiveTable from '@/components/ui/ResponsiveTable';

export default function ResponsiveTableDemo() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        📱 移动端表格自适应方案演示
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        探索不同的表格响应式设计方案，找到最适合您项目的解决方案
                    </p>
                </div>

                {/* JavaScript 驱动的方案 */}
                <div className="mb-12">
                    <ResponsiveTable />
                </div>

                {/* CSS-only 方案 */}
                <div className="mb-12">
                    <CSSResponsiveTable />
                </div>

                {/* 总结建议 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold mb-4">🎯 选择指南</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">📊 数据展示型</h3>
                            <p className="text-sm text-blue-700 mb-3">适合只读数据，用户主要浏览信息</p>
                            <ul className="text-xs text-blue-600 space-y-1">
                                <li>• CSS转卡片</li>
                                <li>• 渐进式隐藏</li>
                                <li>• 堆叠布局</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-900 mb-2">⚡ 交互操作型</h3>
                            <p className="text-sm text-green-700 mb-3">需要用户进行编辑、选择等操作</p>
                            <ul className="text-xs text-green-600 space-y-1">
                                <li>• 横向滚动</li>
                                <li>• 固定列+滚动</li>
                                <li>• 卡片布局</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h3 className="font-semibold text-purple-900 mb-2">🔄 动态内容型</h3>
                            <p className="text-sm text-purple-700 mb-3">内容经常变化，需要实时更新</p>
                            <ul className="text-xs text-purple-600 space-y-1">
                                <li>• JavaScript切换</li>
                                <li>• 响应式组件</li>
                                <li>• 状态管理</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">💡 最佳实践</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <h4 className="font-medium mb-1">性能优化</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• 优先使用CSS-only方案</li>
                                    <li>• 虚拟滚动处理大数据</li>
                                    <li>• 懒加载非关键列</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">用户体验</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• 保持关键信息始终可见</li>
                                    <li>• 提供明确的滚动提示</li>
                                    <li>• 合理的触摸目标尺寸</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 代码示例 */}
                <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">🛠️ 快速实现 - CSS转卡片</h3>
                    <pre className="text-sm overflow-x-auto">
                        {`/* 关键CSS */
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
  
  .responsive-table td:before {
    content: attr(data-label) ": ";
    font-weight: bold;
  }
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}