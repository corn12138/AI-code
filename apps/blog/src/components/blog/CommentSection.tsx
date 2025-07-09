'use client';

import { Comment } from '@/types';
import { formatDate } from '@/utils/date';
import { useAuth } from '@ai-code/hooks';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

interface CommentSectionProps {
    articleId: string;
}

const CommentSection: FC<CommentSectionProps> = ({ articleId }) => {
    const { isAuthenticated, user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchComments() {
            try {
                // 在实际项目中，这里会调用API获取评论数据
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API延迟

                // 模拟数据
                const mockComments: Comment[] = [
                    {
                        id: '1',
                        content: '这篇文章写得非常好，解决了我的问题！',
                        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
                        author: {
                            id: 'user-1',
                            username: '读者小王',
                            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=face'
                        }
                    },
                    {
                        id: '2',
                        content: '我有个问题，文中提到的方法在特殊情况下还适用吗？',
                        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
                        author: {
                            id: 'user-2',
                            username: '技术爱好者',
                            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face'
                        }
                    }
                ];

                setComments(mockComments);
            } catch (error) {
                console.error('加载评论失败', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchComments();
    }, [articleId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        try {
            // 模拟评论提交
            await new Promise(resolve => setTimeout(resolve, 500));

            const newComment: Comment = {
                id: `comment-${Date.now()}`,
                content: commentText,
                createdAt: new Date().toISOString(),
                author: {
                    id: user?.id || 'guest',
                    username: user?.username || '访客',
                    avatar: user?.avatar
                }
            };

            setComments([newComment, ...comments]);
            setCommentText('');
        } catch (error) {
            console.error('评论提交失败', error);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-6">评论 ({comments.length})</h3>

            {/* 评论输入框 */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex">
                        <div className="flex-1">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="写下你的评论..."
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                    disabled={!commentText.trim()}
                                >
                                    发布评论
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-100 p-4 rounded-md mb-8">
                    <p className="text-center text-gray-600">
                        请 <a href="/login" className="text-blue-600 hover:underline">登录</a> 后参与评论
                    </p>
                </div>
            )}

            {/* 评论列表 */}
            {isLoading ? (
                <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-4">
                                <Image
                                    src={comment.author.avatar || 'https://via.placeholder.com/40'}
                                    alt={comment.author.username}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-secondary-800">{comment.author.username}</span>
                                        <span className="text-xs text-secondary-500">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-secondary-700 whitespace-pre-line">{comment.content}</p>
                                </div>
                                <div className="flex mt-2 gap-4 text-xs">
                                    <button className="text-secondary-500 hover:text-primary-600">回复</button>
                                    <button className="text-secondary-500 hover:text-primary-600">点赞</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-secondary-500">
                    暂无评论，成为第一个评论的人吧
                </div>
            )}
        </div>
    );
};

export default CommentSection;
