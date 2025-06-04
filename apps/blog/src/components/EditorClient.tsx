'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';
import MarkdownEditor from './MarkdownEditor';

export default function EditorClient() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">创建新文章</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleSaveDraft}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="文章标题"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <MarkdownEditor value={content} onChange={setContent} />
            </div>
        </ClientPageWrapper>
    );
}
