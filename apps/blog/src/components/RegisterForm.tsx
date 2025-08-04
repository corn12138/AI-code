'use client';

import { useAuth } from '@corn12138/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import AuthPageWrapper from './AuthPageWrapper';

export default function RegisterForm() {
    const router = useRouter();
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateUsername = (username: string) => {
        if (username.length < 3) {
            return '用户名至少需要3个字符';
        }
        if (username.length > 20) {
            return '用户名不能超过20个字符';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return '用户名只能包含字母、数字和下划线';
        }
        return '';
    };

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return '密码至少需要8个字符';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return '密码必须包含大小写字母和数字';
        }
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // 实时验证
        let error = '';
        if (name === 'username') {
            error = validateUsername(value);
        } else if (name === 'password') {
            error = validatePassword(value);
        } else if (name === 'confirmPassword') {
            error = value !== newFormData.password ? '两次输入的密码不一致' : '';
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // 如果修改了password，也要重新验证confirmPassword
        if (name === 'password' && formData.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: value !== formData.confirmPassword ? '两次输入的密码不一致' : ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 前端验证
        const usernameError = validateUsername(formData.username);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = formData.password !== formData.confirmPassword ? '两次输入的密码不一致' : '';

        if (usernameError || passwordError || confirmPasswordError) {
            setErrors({
                username: usernameError,
                email: '',
                password: passwordError,
                confirmPassword: confirmPasswordError,
            });
            toast.error('请修正表单中的错误');
            return;
        }

        try {
            // 假设register函数返回成功状态
            const success = await (register as any)(formData);
            if (success) {
                toast.success('注册成功，请登录');
                router.push('/login');
            } else {
                toast.error('注册失败，请稍后重试');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '注册过程中出现错误';
            toast.error(errorMessage);
            console.error('注册错误:', error);
        }
    };

    return (
        <AuthPageWrapper>
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
                                    className={`relative block w-full appearance-none rounded-md border ${errors.username ? 'border-red-300' : 'border-gray-300'
                                        } px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                                    placeholder="用户名"
                                />
                                {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
                                {!errors.username && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        3-20个字符，只能包含字母、数字和下划线
                                    </p>
                                )}
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
                                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="sr-only">
                                    密码
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`relative block w-full appearance-none rounded-md border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                                        placeholder="密码"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464 9.878 9.878zM14.12 14.12l1.415 1.415L14.12 14.12zM14.12 14.12L9.88 9.88 14.12 14.12z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                                {!errors.password && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        至少8个字符，包含大小写字母和数字
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">
                                    确认密码
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`relative block w-full appearance-none rounded-md border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                                        placeholder="确认密码"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464 9.878 9.878zM14.12 14.12l1.415 1.415L14.12 14.12zM14.12 14.12L9.88 9.88 14.12 14.12z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
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
        </AuthPageWrapper>
    );
}
