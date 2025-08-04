'use client';

import AuthPageWrapper from '@/components/AuthPageWrapper';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('请输入邮箱地址');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsEmailSent(true);
            } else {
                toast.error(data.error || '发送失败，请稍后重试');
            }
        } catch (error) {
            console.error('发送重置链接失败:', error);
            toast.error('发送失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPageWrapper>
            <div className="max-w-md mx-auto">
                {!isEmailSent ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">忘记密码？</h1>
                            <p className="text-gray-600">
                                输入您的邮箱地址，我们将向您发送重置密码的链接
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    邮箱地址
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="请输入您的邮箱地址"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        发送中...
                                    </span>
                                ) : (
                                    '发送重置链接'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="text-indigo-600 hover:text-indigo-500 font-medium transition duration-200"
                            >
                                返回登录
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">邮件已发送</h2>
                        <p className="text-gray-600 mb-6">
                            我们已向 <span className="font-medium text-gray-900">{email}</span> 发送了重置密码的链接。
                            请检查您的邮箱（包括垃圾邮件文件夹）。
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    setIsEmailSent(false);
                                    setEmail('');
                                }}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
                            >
                                重新发送
                            </button>

                            <Link
                                href="/login"
                                className="block w-full text-center text-indigo-600 hover:text-indigo-500 font-medium py-3 transition duration-200"
                            >
                                返回登录
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthPageWrapper>
    );
} 