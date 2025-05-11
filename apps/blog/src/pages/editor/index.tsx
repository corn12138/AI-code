import MarkdownEditor from '@/components/MarkdownEditor';
import TagSelector from '@/components/TagSelector';
import EditorLayout from '@/layouts/EditorLayout';
import { createArticle, fetchTags } from '@/services/api';
import { useEditorStore } from '@/store/editorStore';
import { Tag } from '@/types';
import { useAuth } from '@shared/auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreateArticlePage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [tags, setTags] = useState<Tag[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const {
        title,
        content,
        setTitle,
        setContent,
        resetEditor,
        loadDraft,
        saveDraft
    } = useEditorStore();

    // 未登录重定向到登录页
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?next=/editor');
        }
    }, [isAuthenticated, router]);

    // 加载标签
    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await fetchTags();
                setTags(tags);
            } catch (error) {
                console.error('Failed to load tags:', error);
                toast.error('加载标签失败');
            }
        };

        loadTags();
    }, []);

    // 加载草稿
    useEffect(() => {
        loadDraft();
    }, [loadDraft]);

    // 自动保存草稿
    useEffect(() => {
        const interval = setInterval(() => {
            if (title || content) {
                saveDraft();
                console.log('Draft saved automatically');
            }
        }, 30000); // 每30秒保存一次

        return () => clearInterval(interval);
    }, [title, content, saveDraft]);

    const handleSubmit = async () => {
        // 验证表单
        if (!title.trim()) {
            toast.error('请输入文章标题');
            return;
        }

        if (!content.trim()) {
            toast.error('请输入文章内容');
            return;
        }

        if (selectedTags.length === 0) {
            toast.error('请至少选择一个标签');
            return;
        }

        setIsSubmitting(true);

        try {
            const article = await createArticle({
                title,
                content,
                tagIds: selectedTags,
                isPublished: true,
            });

            // 提交成功后清除草稿
            resetEditor();

            toast.success('文章发布成功!');

            // 跳转到文章详情页
            router.push(`/article/${article.id}`);
        } catch (error) {
            console.error('Failed to publish article:', error);
            toast.error('发布文章失败，请稍后重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <Head>
                <title>创建新文章 | 技术博客与低代码平台</title>
            </Head>

            <EditorLayout
                onSave={handleSubmit}
                isSaving={isSubmitting}
                onSaveDraft={() => {
                    saveDraft();
                    toast.success('草稿已保存');
                }}
            >
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="输入文章标题..."
                        className="w-full text-3xl font-bold border-none outline-none focus:ring-0"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <TagSelector
                        availableTags={tags}
                        selectedTags={selectedTags}
                        onChange={setSelectedTags}
                    />
                </div>

                <MarkdownEditor
                    value={content}
                    onChange={setContent}
                />
            </EditorLayout>
        </>
    );
}
