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
        <div
            className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${highlight ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
        >
            <Link href={`/article/${article.id}`}>
                <div className="p-6">
                    {/* 文章封面图 */}
                    {article.coverImage && (
                        <div className="relative h-48 mb-4 rounded overflow-hidden">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    {/* 文章标题 */}
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600">
                        {article.title}
                    </h2>

                    {/* 文章摘要 */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>

                    {/* 文章元信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                            {/* 作者头像和用户名 */}
                            <div className="flex items-center space-x-2">
                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                    <Image
                                        src={article.author.avatar || 'https://via.placeholder.com/40'}
                                        alt={article.author.username}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <span>{article.author.username}</span>
                            </div>

                            {/* 发布日期 */}
                            <span>{formatDate(article.createdAt)}</span>
                        </div>

                        {/* 阅读数 */}
                        <div className="flex items-center space-x-4">
                            <span>{article.views || 0} 阅读</span>
                            <span>{article.comments?.length || 0} 评论</span>
                        </div>
                    </div>

                    {/* 标签 */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {article.tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}
