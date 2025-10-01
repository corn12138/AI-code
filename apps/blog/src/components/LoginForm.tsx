'use client';

import { useAuth } from '@corn12138/hooks';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import AuthPageWrapper from './AuthPageWrapper';

type LoginMode = 'password' | 'email-code';

export default function LoginForm() {
    const router = useRouter();
    const { login, refreshToken, isLoading } = useAuth();
    const [loginMode, setLoginMode] = useState<LoginMode>('password');
    const [email, setEmail] = useState('user1@example.com'); // 预填充测试邮箱
    const [password, setPassword] = useState('password123'); // 预填充测试密码
    const [verificationCode, setVerificationCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // 倒计时
    const startCountdown = () => {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // 密码登录
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const success = await login({ email, password });
            if (success) {
                toast.success('登录成功');
                await refreshToken();
                router.push('/');
                router.refresh();
            } else {
                toast.error('登录失败，请检查您的凭据');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '登录过程中出现错误';
            toast.error(errorMessage);
            console.error('登录错误:', error);
        }
    };

    // 发送验证码
    const handleSendCode = async () => {
        if (!email) {
            toast.error('请输入邮箱地址');
            return;
        }

        setIsSendingCode(true);

        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {}),
                },
                body: JSON.stringify({
                    email,
                    type: 'email_login'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsCodeSent(true);
                startCountdown();

                // 开发环境显示验证码
                if (data.code) {
                    toast.success(`开发环境验证码: ${data.code}`);
                }
            } else {
                toast.error(data.error || '发送验证码失败');
            }
        } catch (error) {
            console.error('发送验证码失败:', error);
            toast.error('发送验证码失败，请稍后重试');
        } finally {
            setIsSendingCode(false);
        }
    };

    // 验证码登录
    const handleEmailCodeLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !verificationCode) {
            toast.error('请填写完整信息');
            return;
        }

        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch('/api/auth/email-login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { [getCsrfHeaderName()]: csrfToken } : {}),
                },
                body: JSON.stringify({
                    email,
                    code: verificationCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('登录成功');
                await refreshToken();
                router.push('/');
                router.refresh();
            } else {
                toast.error(data.error || '登录失败');
            }
        } catch (error) {
            console.error('邮箱验证码登录失败:', error);
            toast.error('登录失败，请稍后重试');
        }
    };

    const handleSubmit = loginMode === 'password' ? handlePasswordLogin : handleEmailCodeLogin;

    return (
        <AuthPageWrapper>
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-space-200">
                            登录账户
                        </h2>
                        <p className="mt-2 text-sm text-space-400">
                            没有账户?{" "}
                            <Link href="/register" className="font-medium text-cosmic-400 hover:text-cosmic-300 transition-colors duration-300">
                                立即注册
                            </Link>
                        </p>
                        <div className="mt-4 p-4 bg-cosmic-600/10 backdrop-blur-sm border border-cosmic-500/20 rounded-xl text-sm text-cosmic-300">
                            <p>测试账户: test@example.com</p>
                            <p>测试密码: Password123!</p>
                        </div>
                    </div>

                    {/* 登录方式切换 */}
                    <div className="flex rounded-xl bg-space-800/60 p-1 backdrop-blur-sm border border-cosmic-500/20">
                        <button
                            type="button"
                            onClick={() => setLoginMode('password')}
                            className={`flex-1 rounded-lg py-2 px-3 text-sm font-medium transition-all duration-300 ${loginMode === 'password'
                                ? 'bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white shadow-cosmic'
                                : 'text-space-400 hover:text-cosmic-300'
                                }`}
                        >
                            密码登录
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMode('email-code')}
                            className={`flex-1 rounded-lg py-2 px-3 text-sm font-medium transition-all duration-300 ${loginMode === 'email-code'
                                ? 'bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white shadow-cosmic'
                                : 'text-space-400 hover:text-cosmic-300'
                                }`}
                        >
                            验证码登录
                        </button>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="relative block w-full appearance-none rounded-xl border border-cosmic-500/30 px-4 py-3 text-space-200 placeholder-space-500 focus:z-10 focus:border-cosmic-400/50 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 bg-space-800/60 backdrop-blur-sm transition-all duration-300 sm:text-sm"
                                    placeholder="邮箱地址"
                                />
                            </div>

                            {loginMode === 'password' ? (
                                <div>
                                    <label htmlFor="password" className="sr-only">
                                        密码
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="relative block w-full appearance-none rounded-xl border border-cosmic-500/30 px-4 py-3 pr-10 text-space-200 placeholder-space-500 focus:z-10 focus:border-cosmic-400/50 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 bg-space-800/60 backdrop-blur-sm transition-all duration-300 sm:text-sm"
                                            placeholder="密码"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-4"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5 text-space-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464 9.878 9.878zM14.12 14.12l1.415 1.415L14.12 14.12zM14.12 14.12L9.88 9.88 14.12 14.12z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-space-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="verification-code" className="sr-only">
                                        验证码
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            id="verification-code"
                                            name="verification-code"
                                            type="text"
                                            required
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="flex-1 appearance-none rounded-xl border border-cosmic-500/30 px-4 py-3 text-space-200 placeholder-space-500 focus:border-cosmic-400/50 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 bg-space-800/60 backdrop-blur-sm transition-all duration-300 sm:text-sm"
                                            placeholder="请输入6位验证码"
                                            maxLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={isSendingCode || countdown > 0}
                                            className="whitespace-nowrap rounded-xl border border-cosmic-600 bg-gradient-to-r from-cosmic-600 to-nebula-600 px-4 py-3 text-sm font-medium text-white hover:from-cosmic-700 hover:to-nebula-700 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-cosmic"
                                        >
                                            {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {loginMode === 'password' && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-cosmic-500/30 text-cosmic-600 focus:ring-cosmic-500/20 bg-space-800/60"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-space-300">
                                        记住我
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-cosmic-400 hover:text-cosmic-300 transition-colors duration-300">
                                        忘记密码?
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || (loginMode === 'email-code' && !isCodeSent)}
                                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-gradient-to-r from-cosmic-600 to-nebula-600 py-3 px-4 text-sm font-medium text-white hover:from-cosmic-700 hover:to-nebula-700 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-cosmic"
                            >
                                {isLoading ? '登录中...' : loginMode === 'password' ? '登录' : '验证码登录'}
                            </button>
                        </div>

                        {loginMode === 'email-code' && !isCodeSent && (
                            <p className="text-center text-sm text-space-500">
                                请先获取验证码
                            </p>
                        )}
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-space-700/50" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-space-900 px-2 text-space-500">快捷操作</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link
                                href="/forgot-password"
                                className="inline-flex w-full justify-center rounded-xl border border-cosmic-500/30 bg-space-800/60 backdrop-blur-sm py-2 px-4 text-sm font-medium text-space-400 shadow-sm hover:bg-space-700/60 hover:text-cosmic-300 transition-all duration-300"
                            >
                                忘记密码
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex w-full justify-center rounded-xl border border-cosmic-500/30 bg-space-800/60 backdrop-blur-sm py-2 px-4 text-sm font-medium text-space-400 shadow-sm hover:bg-space-700/60 hover:text-cosmic-300 transition-all duration-300"
                            >
                                注册账户
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthPageWrapper>
    );
}
