import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface EditorLayoutProps {
    children: ReactNode;
    onSave: () => void;
    onSaveDraft: () => void;
    isSaving: boolean;
}

export default function EditorLayout({
    children,
    onSave,
    onSaveDraft,
    isSaving
}: EditorLayoutProps) {
    const router = useRouter();

    const handleCancel = () => {
        if (confirm('确定要离开编辑页面吗？未保存的更改将会丢失。')) {
            router.back();
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar minimal />

            <main className="flex-grow bg-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">创建新文章</h1>
                        <div className="space-x-4">
                            <button
                                onClick={onSaveDraft}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                保存草稿
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${isSaving ? 'animate-pulse' : ''}`}
                            >
                                {isSaving ? '发布中...' : '发布文章'}
                            </button>
                        </div>
                    </div>

                    {children}
                </div>
            </main>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </div>
    );
}
