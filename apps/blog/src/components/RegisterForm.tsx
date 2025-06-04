'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';

export default function RegisterForm() {
    const router = useRouter();
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }

        try {
            // 假设register函数返回成功状态
            const success = await register(formData);
            if (success) {
                toast.success('注册成功，请登录');
                router.push('/login');
            } else {
                toast.error('注册失败，请稍后重试');
            }
        } catch (error) {
            toast.error('注册过程中出现错误');
            console.error('注册错误:', error);
        }
    };

    return (
        <ClientPageWrapper>
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                            创建新账户
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            已有账户?{" "}
                            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                登录
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4 rounded-md shadow-sm">
                            <div>
                                <label htmlFor="username" className="sr-only">
                                    用户名
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                    placeholder="用户名"
                                />
                            </div>

                            <div>
                                <label htmlFor="email-address" className="sr-only">
                                    邮箱地址
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                    placeholder="邮箱地址"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="sr-only">
                                    密码
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                    placeholder="密码"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">
                                    确认密码
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                    placeholder="确认密码"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '注册中...' : '注册'}
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-500">
                            注册即表示您同意我们的{" "}
                            <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                                服务条款
                            </Link>{" "}
                            和{" "}
                            <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
                                隐私政策
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </ClientPageWrapper>
    );
}
