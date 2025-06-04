'use client';

import { User } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ClientPageWrapper from './ClientPageWrapper';

interface ProfileClientProps {
    initialUser: User;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user.username,
        bio: user.bio || '',
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
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-primary-600 h-32 relative">
                        {/* 头像区域 */}
                        <div className="absolute -bottom-16 left-6">
                            <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden">
                                <Image
                                    src={user.avatar || "https://via.placeholder.com/128"}
                                    alt={user.username}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-6">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">用户名</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">个人简介</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={3}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                    >
                                        保存
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                    >
                                        取消
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                                        <p className="text-gray-500">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        编辑资料
                                    </button>
                                </div>

                                <div className="mt-6">
                                    <h2 className="text-lg font-semibold text-gray-900">个人简介</h2>
                                    <p className="mt-2 text-gray-600">
                                        {user.bio || "用户还没有添加个人简介"}
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
