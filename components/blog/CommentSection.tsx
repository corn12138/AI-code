'use client';

import { getComments, submitComment } from '@/actions/commentActions';
import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadComments() {
            setIsLoading(true);
            const fetchedComments = await getComments(postId);
            setComments(fetchedComments);
            setIsLoading(false);
        }

        loadComments();
    }, [postId]);

    const handleNewComment = async (formData) => {
        const newComment = await submitComment(formData, postId);
        setComments(prev => [newComment, ...prev]);
    };

    return (
        <section className="mt-10">
            <h2 className="text-2xl font-bold mb-6">评论</h2>
            <CommentForm onSubmit={handleNewComment} />

            {isLoading ? (
                <p>加载评论中...</p>
            ) : (
                <CommentList comments={comments} />
            )}
        </section>
    );
}
