'use client';

import {
    ChatBubbleLeftIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@corn12138/hooks';
import Link from 'next/link';

/**
 * 右侧边栏组件 - 客户端组件
 * 
 * 包含用户信息和推荐内容
 * 需要认证状态，因此使用客户端渲染
 */

export function RightSidebar() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="hidden xl:block w-80 bg-white border-l border-gray-200 min-h-screen">
            <div className="sticky top-0 p-6 space-y-6">
                {/* 用户信息卡片 */}
                {isAuthenticated && user && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                {(user as any).username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {(user as any).username}
                                </h3>
                                <p className="text-xs text-gray-600">
                                    {(user as any).email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                            <div>
                                <div className="text-lg font-semibold text-gray-900">1</div>
                                <div className="text-xs text-gray-600">获赞</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-gray-900">2</div>
                                <div className="text-xs text-gray-600">文章</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-gray-900">5</div>
                                <div className="text-xs text-gray-600">关注</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-gray-900">11</div>
                                <div className="text-xs text-gray-600">关注者</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 精选沸点 */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">精选沸点</h3>
                    <div className="space-y-3">
                        {[
                            { title: '92年，33岁女，谈情期间被辞退分手，最近看天朝精神保险，心', time: '42分钟' },
                            { title: '没想到公司高层这么善意的事也能处理得如此不堪，防火', time: '20分钟' },
                            { title: '因为小伙子被宜家行程辞退，盘点目前违背心得。。。', time: '55分钟' }
                        ].map((item, index) => (
                            <div key={index} className="border-l-2 border-blue-100 pl-3">
                                <p className="text-sm text-gray-700 line-clamp-2 mb-1">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.time} · 647评论</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 推荐话题 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">推荐话题</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700">换一换</button>
                    </div>
                    <div className="space-y-2">
                        {[
                            { tag: '#我每周日一条沸点#', count: '18.5m' },
                            { tag: '#Trae都失心疯了?#', count: '48k' },
                            { tag: '#每日快讯#', count: '37m' },
                            { tag: '#MCP 怎么玩#', count: '430k' },
                            { tag: '#金石庐条新#', count: '2.5m' }
                        ].map((topic, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                    {topic.tag}
                                </span>
                                <span className="text-xs text-gray-500">{topic.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 快捷操作 */}
                {isAuthenticated && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">快捷操作</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/editor"
                                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <PencilSquareIcon className="h-4 w-4 mr-1" />
                                写文章
                            </Link>
                            <Link
                                href="/chat"
                                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                            >
                                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                AI助手
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
