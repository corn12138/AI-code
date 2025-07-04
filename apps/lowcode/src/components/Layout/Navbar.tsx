import { useAuth, useClientSide } from '@ai-code/hooks';
import React from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const isClient = useClientSide();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('已成功退出登录');
            navigate('/login');
        } catch (error) {
            console.error('退出登录失败:', error);
            toast.error('退出登录时出现错误');
        }
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-primary-600">
                                低代码平台
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                首页
                            </Link>
                            <Link
                                to="/projects"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                我的项目
                            </Link>
                            <Link
                                to="/templates"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                模板
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {isClient && (
                            <div className="flex items-center space-x-4">
                                {isAuthenticated ? (
                                    <>
                                        <span className="text-gray-700">欢迎, {user?.username}</span>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            登出
                                        </button>
                                    </>
                                ) : (
                                    <a
                                        href="/login"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        登录
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
