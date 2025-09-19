'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';
import MarkdownEditor from './MarkdownEditor';
import dynamic from 'next/dynamic';

// 动态导入写作助手组件
const WritingAssistant = dynamic(
    () => import('@/modules/chat/components/WritingAssistant'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }
);

export default function EditorClient() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showAIChat, setShowAIChat] = useState(true); // AI Chat 显示状态

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('请输入文章标题');
            return;
        }

        if (!content.trim()) {
            toast.error('请输入文章内容');
            return;
        }

        setIsSaving(true);
        try {
            // 假设API调用在这里
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('文章保存成功！');
            router.push('/');
        } catch (error) {
            console.error('保存文章失败:', error);
            toast.error('保存文章失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            // 假设API调用在这里
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('草稿保存成功！');
        } catch (error) {
            console.error('保存草稿失败:', error);
            toast.error('保存草稿失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ClientPageWrapper>
            <div className="h-screen flex flex-col">
                {/* 顶部工具栏 */}
                <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
                    <h1 className="text-2xl font-bold">创建新文章</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowAIChat(!showAIChat)}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                showAIChat 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {showAIChat ? '隐藏AI助手' : '显示AI助手'}
                        </button>
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            保存草稿
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${isSaving ? 'animate-pulse' : ''}`}
                        >
                            {isSaving ? '发布中...' : '发布文章'}
                        </button>
                    </div>
                </div>

                {/* 主要内容区域 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 左侧编辑区域 */}
                    <div className={`flex flex-col transition-all duration-300 ${showAIChat ? 'w-2/3' : 'w-full'}`}>
                        <div className="p-6 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="文章标题"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        
                        <div className="flex-1 p-6 overflow-hidden">
                            <MarkdownEditor value={content} onChange={setContent} />
                        </div>
                    </div>

                    {/* 右侧AI Chat区域 */}
                    {showAIChat && (
                        <div className="w-1/3 border-l border-gray-200 bg-gray-50">
                            <div className="h-full flex flex-col">
                                <div className="px-4 py-3 bg-white border-b border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <h3 className="font-semibold text-gray-800">AI 写作助手</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">获取写作灵感和技术建议</p>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <WritingAssistant />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClientPageWrapper>
    );
}
