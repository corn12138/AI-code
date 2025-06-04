'use client';

import { Comment } from '@/types';

interface CommentListProps {
    comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
    if (!comments.length) {
        return <p className="text-gray-500 my-4">暂无评论</p>;
    }

    return (
        <div className="mt-6 space-y-6">
            {comments.map(comment => (
                <div key={comment.id} className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="font-bold">{comment.name}</div>
                        <div className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <p>{comment.content}</p>
                </div>
            ))}
        </div>
    );
}
