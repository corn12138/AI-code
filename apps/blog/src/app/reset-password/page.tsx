'use client';

import AuthPageWrapper from '@/components/AuthPageWrapper';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isResetSuccessful, setIsResetSuccessful] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        const tokenParam = searchParams.get('token');

        if (!emailParam || !tokenParam) {
            toast.error('无效的重置链接');
            router.push('/forgot-password');
            return;
        }

        setEmail(emailParam);
        setToken(tokenParam);

        // 验证令牌
        validateToken(emailParam, tokenParam);
    }, [searchParams, router]);

    const validateToken = async (email: string, token: string) => {
        try {
            const response = await fetch(`/api/auth/verify-reset-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
            const data = await response.json();

            if (response.ok && data.valid) {
                setIsValidToken(true);
            } else {
                toast.error(data.error || '重置链接无效或已过期');
                router.push('/forgot-password');
            }
        } catch (error) {
            console.error('验证令牌失败:', error);
            toast.error('验证失败，请稍后重试');
            router.push('/forgot-password');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('请填写完整信息');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('密码长度至少8位');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            toast.error('密码必须包含大小写字母、数字和特殊字符');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    token,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsResetSuccessful(true);
            } else {
                toast.error(data.error || '重置失败，请稍后重试');
            }
        } catch (error) {
            console.error('重置密码失败:', error);
            toast.error('重置失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <AuthPageWrapper>
                <div className="max-w-md mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在验证重置链接...</p>
                </div>
            </AuthPageWrapper>
        );
    }

    if (!isValidToken) {
        return (
            <AuthPageWrapper>
                <div className="max-w-md mx-auto text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">链接无效</h2>
                    <p className="text-gray-600 mb-6">重置链接无效或已过期，请重新申请。</p>
                    <Link
                        href="/forgot-password"
                        className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
                    >
                        重新申请
                    </Link>
                </div>
            </AuthPageWrapper>
        );
    }

    if (isResetSuccessful) {
        return (
            <AuthPageWrapper>
                <div className="max-w-md mx-auto text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">密码重置成功</h2>
                    <p className="text-gray-600 mb-6">您的密码已成功重置，现在可以使用新密码登录了。</p>
                    <Link
                        href="/login"
                        className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
                    >
                        立即登录
                    </Link>
                </div>
            </AuthPageWrapper>
        );
    }

    return (
        <AuthPageWrapper>
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">重置密码</h1>
                    <p className="text-gray-600">请输入您的新密码</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            新密码
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="请输入新密码"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                disabled={isLoading}
                            >
                                <svg className={`h-5 w-5 ${showPassword ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showPassword ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.757 7.757M9.878 9.878L12 12m0 0l2.122 2.122M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    )}
                                </svg>
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            密码至少8位，包含大小写字母、数字和特殊字符
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            确认新密码
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="请再次输入新密码"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                disabled={isLoading}
                            >
                                <svg className={`h-5 w-5 ${showConfirmPassword ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showConfirmPassword ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.757 7.757M9.878 9.878L12 12m0 0l2.122 2.122M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    )}
                                </svg>
                            </button>
                        </div>
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
                                重置中...
                            </span>
                        ) : (
                            '重置密码'
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
            </div>
        </AuthPageWrapper>
    );
} 