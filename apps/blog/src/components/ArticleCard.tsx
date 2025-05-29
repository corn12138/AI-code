import { Article } from '@/types';
import { formatDate } from '@/utils/date';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleCardProps {
    article: Article;
    highlight?: boolean;
}

export default function ArticleCard({ article, highlight = false }: ArticleCardProps) {
    return (
        <div className={`card group ${highlight ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
            <Link href={`/article/${article.id}`} className="block">
                {/* 文章封面图 */}
                {article.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                        <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: 'cover' }}
                            className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                        />
                        {/* 标签覆盖在图片上 */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                                {article.tags.slice(0, 2).map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full font-medium"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                                {article.tags.length > 2 && (
                                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                        +{article.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="p-5">
                    {/* 文章标题 */}
                    <h2 className="text-xl font-bold mb-2 line-clamp-2 text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {article.title}
                    </h2>

                    {/* 文章摘要 */}
                    <p className="text-secondary-600 mb-4 line-clamp-2">
                        {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>

                    {/* 文章元信息 */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                            {/* 作者头像和用户名 */}
                            <div className="flex items-center space-x-2">
                                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white">
                                    <Image
                                        src={article.author.avatar || 'https://via.placeholder.com/40'}
                                        alt={article.author.username}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <span className="font-medium text-secondary-700">{article.author.username}</span>
                            </div>

                            {/* 发布日期 */}
                            <span className="text-secondary-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {formatDate(article.createdAt)}
                            </span>
                        </div>

                        {/* 阅读数和评论数 */}
                        <div className="flex items-center space-x-3">
                            <span className="text-secondary-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                {article.views || 0}
                            </span>
                            <span className="text-secondary-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {article.comments?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
