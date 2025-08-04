'use client';

import { FireIcon } from '@heroicons/react/24/outline';
import MainLayout from '../../components/layout/MainLayout';
import TopNavbar from '../../components/layout/TopNavbar';

export default function HotPage() {
    return (
        <div>
            <TopNavbar />
            <MainLayout>
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <FireIcon className="h-6 w-6 text-red-500 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">热门内容</h1>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <FireIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">热门内容正在开发中</h2>
                        <p className="text-gray-600">我们正在为您准备最热门的技术文章和讨论</p>
                    </div>
                </div>
            </MainLayout>
        </div>
    );
} 