import clsx from 'clsx';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useArticleStore } from '../../store/articleStore';

export const ArticleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentArticle, loading, error, getArticleById } = useArticleStore();

    useEffect(() => {
        if (id) {
            getArticleById(id);
        }
    }, [id, getArticleById]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <ArticleDetailSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                {/* 头部导航 */}
                <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-semibold">文章详情</h1>
                    </div>
                </header>

                {/* 错误内容 */}
                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="text-red-500 text-center">
                        <p className="text-lg font-medium mb-2">加载失败</p>
                        <p className="text-sm text-gray-600">{error}</p>
                    </div>
                    <button
                        onClick={() => id && getArticleById(id)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    if (!currentArticle) {
        return (
            <div className="min-h-screen bg-white">
                <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-semibold">文章详情</h1>
                    </div>
                </header>
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">文章不存在</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* 头部导航 */}
            <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-semibold truncate">
                        {currentArticle.title}
                    </h1>
                </div>
            </header>

            {/* 文章内容 */}
            <article className="px-4 py-6">
                {/* 文章标题 */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {currentArticle.title}
                </h1>

                {/* 文章元信息 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{currentArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                            {new Date(currentArticle.publishDate).toLocaleDateString('zh-CN')}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{currentArticle.readTime}分钟阅读</span>
                    </div>
                </div>

                {/* 文章标签 */}
                {currentArticle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {currentArticle.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                            >
                                <Tag size={12} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 文章封面图 */}
                {currentArticle.imageUrl && (
                    <div className="mb-6">
                        <img
                            src={currentArticle.imageUrl}
                            alt={currentArticle.title}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>
                )}

                {/* 文章正文 */}
                <div className="prose prose-gray max-w-none">
                    <ArticleContent content={currentArticle.content} />
                </div>
            </article>
        </div>
    );
};

interface ArticleContentProps {
    content: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
    // 简单的 Markdown 渲染（实际项目中建议使用专业的 Markdown 解析库）
    const renderContent = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                // 标题
                if (line.startsWith('# ')) {
                    return (
                        <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
                            {line.substring(2)}
                        </h1>
                    );
                }
                if (line.startsWith('## ')) {
                    return (
                        <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-900">
                            {line.substring(3)}
                        </h2>
                    );
                }
                if (line.startsWith('### ')) {
                    return (
                        <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-gray-900">
                            {line.substring(4)}
                        </h3>
                    );
                }

                // 代码块
                if (line.startsWith('```')) {
                    return null; // 代码块需要特殊处理
                }

                // 列表项
                if (line.startsWith('- ')) {
                    return (
                        <li key={index} className="ml-4 mb-1 text-gray-700">
                            {line.substring(2)}
                        </li>
                    );
                }
                if (/^\d+\./.test(line)) {
                    return (
                        <li key={index} className="ml-4 mb-1 text-gray-700 list-decimal">
                            {line.replace(/^\d+\.\s*/, '')}
                        </li>
                    );
                }

                // 粗体文本
                const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // 空行
                if (line.trim() === '') {
                    return <br key={index} />;
                }

                // 普通段落
                return (
                    <p
                        key={index}
                        className="mb-4 text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: boldText }}
                    />
                );
            });
    };

    return <div className="space-y-2">{renderContent(content)}</div>;
};

const ArticleDetailSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* 头部骨架 */}
            <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
            </header>

            {/* 内容骨架 */}
            <div className="px-4 py-6 space-y-4">
                {/* 标题骨架 */}
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>

                {/* 元信息骨架 */}
                <div className="flex gap-4 py-4 border-b border-gray-200">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* 标签骨架 */}
                <div className="flex gap-2">
                    <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse" />
                </div>

                {/* 图片骨架 */}
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />

                {/* 内容骨架 */}
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className={clsx(
                                'h-4 bg-gray-200 rounded animate-pulse',
                                index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-5/6' : 'w-4/5'
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
