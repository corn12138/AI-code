'use client';

import { useState } from 'react';

interface CommentFormProps {
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData(event.currentTarget);
            await onSubmit(formData);
            // 重置表单
            (event.target as HTMLFormElement).reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : '提交评论失败');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                    <label htmlFor="name" className="block mb-1">名称</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block mb-1">邮箱</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="content" className="block mb-1">评论内容</label>
                <textarea
                    id="content"
                    name="content"
                    rows={4}
                    required
                    className="w-full border p-2 rounded"
                />
            </div>

            {error && (
                <div className="text-red-500 mb-4">{error}</div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
            >
                {isSubmitting ? '提交中...' : '提交评论'}
            </button>
        </form>
    );
}
