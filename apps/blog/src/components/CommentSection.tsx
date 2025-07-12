import { createComment, fetchComments } from '@/services/api';
import { Comment } from '@/types';
import { formatDate } from '@/utils/date';
import { useAuth } from '@corn12138/hooks';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface CommentSectionProps {
    articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const loadComments = async () => {
            try {
                const commentsData = await fetchComments(articleId);
                setComments(commentsData);
            } catch (error) {
                console.error('Error loading comments:', error);
                toast.error('加载评论失败');
            } finally {
                setIsLoading(false);
            }
        };

        loadComments();
    }, [articleId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim()) {
            toast.error('评论内容不能为空');
            return;
        }

        if (!isAuthenticated) {
            toast.error('请先登录后再评论');
            return;
        }

        setIsSubmitting(true);

        try {
            const newComment = await createComment({
                content: commentText,
                articleId,
            });

            setComments([newComment, ...comments]);
            setCommentText('');
            toast.success('评论发表成功');
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('评论发表失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-6">评论 ({comments.length})</h3>

            {/* 评论输入框 */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-4">
                            <Image
                                src={user?.avatar || 'https://via.placeholder.com/40'}
                                alt={user?.username || 'User'}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
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
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting ? 'animate-pulse' : ''}`}
                                >
                                    {isSubmitting ? '发表中...' : '发表评论'}
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
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">{comment.author.username}</h4>
                                        <time className="text-sm text-gray-500" dateTime={comment.createdAt}>
                                            {formatDate(comment.createdAt)}
                                        </time>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                                </div>
                                <div className="mt-2 ml-2">
                                    <button className="text-sm text-gray-500 hover:text-blue-600">回复</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>暂无评论，来发表第一条评论吧！</p>
                </div>
            )}
        </div>
    );
}
