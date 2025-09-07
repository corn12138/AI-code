'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';

type User = {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    roles?: string[];
};

interface ProfileClientProps {
    initialUser: User;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 假设API调用在这里
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUser(prev => ({ ...prev, ...formData }));
            setIsEditing(false);
            toast.success('个人资料已更新');
        } catch (error) {
            console.error('更新个人资料失败:', error);
            toast.error('更新个人资料失败，请重试');
        }
    };

    return (
        <ClientPageWrapper>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div
                    data-testid="profile-client"
                    className="bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 shadow-cosmic overflow-hidden"
                >
                    <div
                        data-testid="profile-header"
                        className="bg-gradient-to-r from-cosmic-600 to-nebula-600 h-32 relative"
                    >
                        {/* 头像区域 */}
                        <div className="absolute -bottom-16 left-6">
                            <div className="relative h-32 w-32 rounded-full border-4 border-space-900 overflow-hidden shadow-cosmic">
                                <Image
                                    src={user?.avatar || "/default-avatar.svg"}
                                    alt={user?.username || "用户头像"}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-6">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-space-200">用户名</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        aria-label="用户名输入框"
                                        className="mt-1 block w-full rounded-xl border border-cosmic-500/30 bg-space-800/60 text-space-200 placeholder-space-500 focus:border-cosmic-400/50 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 backdrop-blur-sm transition-all duration-300 px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-space-200">个人简介</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={3}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        aria-label="个人简介输入框"
                                        className="mt-1 block w-full rounded-xl border border-cosmic-500/30 bg-space-800/60 text-space-200 placeholder-space-500 focus:border-cosmic-400/50 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 backdrop-blur-sm transition-all duration-300 px-4 py-3"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        aria-label="保存个人资料"
                                        className="px-4 py-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-lg hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 shadow-cosmic"
                                    >
                                        保存
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        aria-label="取消编辑"
                                        className="px-4 py-2 border border-cosmic-500/30 text-space-300 rounded-lg hover:bg-space-800/60 transition-all duration-300 backdrop-blur-sm"
                                    >
                                        取消
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold text-space-200">{user?.username || '用户'}</h1>
                                        <p className="text-space-400">{user?.email || '未设置邮箱'}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        aria-label="编辑个人资料"
                                        className="px-4 py-2 border border-cosmic-500/30 text-space-300 rounded-lg hover:bg-space-800/60 hover:text-cosmic-300 transition-all duration-300 backdrop-blur-sm"
                                    >
                                        编辑资料
                                    </button>
                                </div>

                                <div className="mt-6">
                                    <h2 className="text-lg font-semibold text-space-200">个人简介</h2>
                                    <p className="mt-2 text-space-400">
                                        {user?.bio || "用户还没有添加个人简介"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ClientPageWrapper>
    );
}
