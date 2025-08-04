'use client';

import { toast as customToast } from '@/components/ui/use-toast';
import { toast } from 'react-hot-toast';

export default function TestToast() {
    const testReactHotToast = () => {
        toast.success('React Hot Toast 成功消息！');
        setTimeout(() => {
            toast.error('React Hot Toast 错误消息！');
        }, 1000);
        setTimeout(() => {
            toast('React Hot Toast 普通消息！');
        }, 2000);
    };

    const testCustomToast = () => {
        customToast({
            title: "自定义Toast测试",
            description: "这是一个成功的自定义toast消息",
            variant: "success"
        });

        setTimeout(() => {
            customToast({
                title: "错误提示",
                description: "这是一个错误的自定义toast消息",
                variant: "destructive"
            });
        }, 1000);

        setTimeout(() => {
            customToast({
                title: "普通消息",
                description: "这是一个普通的自定义toast消息",
                variant: "default"
            });
        }, 2000);
    };

    const testBothToasts = () => {
        // 先测试react-hot-toast
        toast.success('🎉 React Hot Toast 工作正常！');

        // 再测试自定义toast
        setTimeout(() => {
            try {
                customToast({
                    title: "✅ 自定义Toast",
                    description: "自定义toast也工作正常！",
                    variant: "success"
                });
            } catch (error) {
                console.error('自定义toast出错:', error);
                toast.error('自定义toast出现问题');
            }
        }, 1500);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Toast 功能测试</h2>

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">React Hot Toast 测试</h3>
                    <button
                        onClick={testReactHotToast}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        测试 React Hot Toast
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">自定义 Toast 测试</h3>
                    <button
                        onClick={testCustomToast}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        测试自定义 Toast
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">综合测试</h3>
                    <button
                        onClick={testBothToasts}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                    >
                        测试所有 Toast
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold text-gray-700 mb-2">使用说明：</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• React Hot Toast: 轻量级，成熟的toast库</li>
                    <li>• 自定义Toast: 基于Context的自制toast组件</li>
                    <li>• 两种toast都已配置在全局Provider中</li>
                    <li>• 点击按钮测试不同类型的toast效果</li>
                </ul>
            </div>
        </div>
    );
} 