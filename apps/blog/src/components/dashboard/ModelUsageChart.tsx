'use client';

interface ModelUsageChartProps {
    modelStats: any;
}

export function ModelUsageChart({ modelStats }: ModelUsageChartProps) {
    const models = modelStats?.models || [];

    // 计算总使用量
    const totalUsage = models.reduce((sum: number, model: any) => sum + (model.totalRequests || 0), 0);

    return (
        <div className="bg-white overflow-hidden rounded-lg shadow">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">AI模型使用排行</h3>
                    <span className="text-sm text-gray-500">本月数据</span>
                </div>

                <div className="mt-6">
                    {models.length > 0 ? (
                        <div className="space-y-4">
                            {models.map((model: any, index: number) => {
                                const percentage = totalUsage > 0 ? (model.totalRequests / totalUsage) * 100 : 0;
                                const colors = [
                                    'bg-blue-500',
                                    'bg-green-500',
                                    'bg-yellow-500',
                                    'bg-purple-500',
                                    'bg-pink-500'
                                ];

                                return (
                                    <div key={model.modelName} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {model.modelName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {model.provider || 'Unknown Provider'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {model.totalRequests?.toLocaleString() || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {percentage.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* 进度条 */}
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        {/* 详细信息 */}
                                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                                            <div>
                                                <span className="font-medium">平均响应: </span>
                                                {model.avgResponseTime?.toFixed(2) || 0}s
                                            </div>
                                            <div>
                                                <span className="font-medium">Token数: </span>
                                                {model.totalTokens?.toLocaleString() || 0}
                                            </div>
                                            <div>
                                                <span className="font-medium">费用: </span>
                                                ${model.totalCost?.toFixed(4) || '0.0000'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* 总计信息 */}
                            <div className="border-t pt-4 mt-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {totalUsage.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500">总请求数</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {models.reduce((sum: number, model: any) => sum + (model.totalTokens || 0), 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500">总Token数</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">
                                            ${models.reduce((sum: number, model: any) => sum + (model.totalCost || 0), 0).toFixed(4)}
                                        </div>
                                        <div className="text-sm text-gray-500">总费用</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">暂无模型使用数据</div>
                            <p className="text-gray-500 text-sm mt-2">开始使用AI功能后，这里将显示各个模型的使用统计</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 