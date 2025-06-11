'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';

export default function LoginForm() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('admin@example.com'); // 预填充测试邮箱
    const [password, setPassword] = useState('123456'); // 预填充测试密码

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const success = await login({ email, password });
            if (success) {
                toast.success('登录成功');
                router.push('/');
            } else {
                toast.error('登录失败，请检查您的凭据');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '登录过程中出现错误';
            toast.error(errorMessage);
            console.error('登录错误:', error);
        }
    };

    return (
        <ClientPageWrapper>
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                            登录账户
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            没有账户?{" "}
                            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                                立即注册
                            </Link>
                        </p>
                        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                            <p>测试账户: admin@example.com</p>
                            <p>测试密码: 123456</p>
                        </div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4 rounded-md shadow-sm">
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
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                    placeholder="密码"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    记住我
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                    忘记密码?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '登录中...' : '登录'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">或通过以下方式登录</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                            >
                                <span className="sr-only">使用GitHub登录</span>
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                            >
                                <span className="sr-only">使用微信登录</span>
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.012.81-.03-.857-2.578.19-4.579 1.603-5.975 1.33-1.319 3.118-2.05 5.032-2.05 2.635 0 4.903 1.273 6.042 3.132 1.424-1.376 2.296-3.289 2.296-5.377 0-4.277-4.262-7.719-9.06-7.719-2.04 0-3.922.677-5.408 1.84-.071.056-.145.103-.217.16-.968.793-1.752 1.71-2.296 2.78z" />
                                    <path d="M5.525 9.616c-.56 0-1.01-.452-1.01-1.01 0-.559.45-1.01 1.01-1.01.558 0 1.009.451 1.009 1.01 0 .558-.45 1.01-1.01 1.01zm6.769 0c-.56 0-1.01-.452-1.01-1.01 0-.559.45-1.01 1.01-1.01.558 0 1.009.451 1.009 1.01 0 .558-.451 1.01-1.01 1.01zm4.106 3.891c-3.28 0-5.908 2.256-5.908 5.033 0 2.777 2.628 5.033 5.908 5.033 1.005 0 1.952-.241 2.794-.666.094-.047.188-.059.281-.059a.682.682 0 01.355.105l1.472.852c.025.012.05.023.073.023.086 0 .154-.068.154-.154a.208.208 0 00-.023-.107l-.308-1.133c-.033-.154.02-.344.111-.463 1.298-1.088 2.072-2.573 2.072-4.431 0-2.777-2.607-5.033-5.888-5.033zm-3.296 2.2c-.343 0-.617-.274-.617-.617 0-.342.274-.617.617-.617.342 0 .617.275.617.617 0 .343-.275.617-.617.617zm6.57 0c-.343 0-.618-.274-.618-.617 0-.342.275-.617.617-.617.343 0 .618.275.618.617 0 .343-.275.617-.618.617z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                            >
                                <span className="sr-only">使用QQ登录</span>
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.003 0C5.376 0 0 5.373 0 12s5.376 12 12.003 12C18.627 24 24 18.627 24 12S18.627 0 12.003 0zM8.847 8.329c-.468-1.621-.214-3.809.486-3.824.869-.02 1.473 1.82.899 3.85-.313 1.089-.337 1.832-.482 3.232-.225-.747-.604-1.921-.903-3.258zm7.256 6.456c-.165.675-.438 1.257-.772 1.712-1.27 1.734-3.072 2.233-3.889 2.355-1.301.194-2.647-.215-3.384-.622-.255-.14-.495-.293-.713-.455-.334-.247-.327-.247-.437-.33a8.188 8.188 0 01-1.464-1.612c-.531-.764-.684-1.296-.417-1.397.401-.15.638.143 1.118.605.096.097.669.786 1.546 1.373.836.559 1.773.822 2.632.822.757 0 1.234-.117 1.39-.339.203-.289.176-1.137.254-1.402.054-.179.174-.344.363-.505.603-.514.868-.292.812.514-.025.378-.05.923-.05.923s.131.875.167 1.094c.089.534.241.879.618.938.122.019.253.03.39.03.174 0 .367-.015.586-.044 1.241-.167 2.9-.888 3.316-3.157.398-2.168-.358-5.022-1.64-6.855-.024-.173.136-.414.277-.561.183-.193.363-.242.52-.239.466.009 1.12.745.371 2.363-1.028 2.22-.747 4.214-.207 6.343z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ClientPageWrapper>
    );
}
