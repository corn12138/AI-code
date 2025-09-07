// import { createComment, fetchComments } from '@/services/api'; // 暂时注释，API不存在
const createComment = (comment: any) => Promise.resolve(comment);
const fetchComments = (id: string) => Promise.resolve([]);
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
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-space-200 mb-6">评论 ({comments.length})</h3>

            {/* 评论输入框 */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden mr-4 border border-cosmic-500/30">
                            <Image
                                src={(user as any)?.avatar || '/default-avatar.svg'}
                                alt={(user as any)?.username || 'User'}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="写下你的评论..."
                                className="w-full p-4 bg-space-800/60 border border-cosmic-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 focus:border-cosmic-400/50 text-space-200 placeholder-space-500 backdrop-blur-sm transition-all duration-300"
                                rows={3}
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-lg hover:from-cosmic-700 hover:to-nebula-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-cosmic ${isSubmitting ? 'animate-pulse' : ''}`}
                                >
                                    {isSubmitting ? '发表中...' : '发表评论'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 p-6 rounded-xl mb-8">
                    <p className="text-center text-space-400">
                        请 <a href="/login" className="text-cosmic-400 hover:text-cosmic-300 transition-colors duration-300">登录</a> 后参与评论
                    </p>
                </div>
            )}

            {/* 评论列表 */}
            {isLoading ? (
                <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-cosmic-500 border-t-transparent rounded-full"></div>
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex group">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden mr-4 border border-cosmic-500/30">
                                <Image
                                    src={comment.author.avatar || '/default-avatar.svg'}
                                    alt={comment.author.username}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 p-4 rounded-xl hover:shadow-cosmic transition-all duration-300">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-space-200">{comment.author.username}</h4>
                                        <time className="text-sm text-space-500" dateTime={comment.createdAt}>
                                            {formatDate(comment.createdAt)}
                                        </time>
                                    </div>
                                    <p className="text-space-300 whitespace-pre-line leading-relaxed">{comment.content}</p>
                                </div>
                                <div className="mt-3 ml-2">
                                    <button className="text-sm text-space-400 hover:text-cosmic-400 transition-colors duration-300 px-3 py-1.5 bg-space-800/60 rounded-lg hover:bg-cosmic-600/20 hover:border hover:border-cosmic-500/30 backdrop-blur-sm">
                                        回复
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-space-500 bg-space-900/40 backdrop-blur-xl border border-cosmic-500/20 rounded-xl">
                    <p>暂无评论，来发表第一条评论吧！</p>
                </div>
            )}
        </div>
    );
}
