'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/models/article';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const {
    slug,
    title,
    excerpt,
    coverImage,
    author,
    tags,
    publishedAt,
    viewCount,
    readingTime,
  } = article;

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <article className={`group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden transition-all hover:shadow-md ${
      isFeatured ? 'lg:flex' : ''
    }`}>
      {/* 封面图片 */}
      <div className={`relative ${
        isFeatured ? 'lg:w-2/5' : ''
      } ${isCompact ? 'h-32' : 'h-48'} overflow-hidden`}>
        <Link href={`/blog/${slug}`} aria-label={title}>
          <Image 
            src={coverImage || 'https://via.placeholder.com/800x450?text=TechBlog'} 
            alt={title}
            fill
            sizes={isFeatured ? '(max-width: 1024px) 100vw, 40vw' : '100vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* 内容 */}
      <div className={`p-4 ${isFeatured ? 'lg:w-3/5 lg:p-6' : ''}`}>
        {/* 标签 */}
        {!isCompact && tags && tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Link href={`/tags/${tag.slug}`} key={tag.id}>
                <Badge variant="secondary" className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* 标题 */}
        <h3 className={`font-bold text-gray-900 dark:text-white leading-tight ${
          isFeatured ? 'text-xl mb-2' : isCompact ? 'text-base mb-1' : 'text-lg mb-2'
        }`}>
          <Link href={`/blog/${slug}`} className="hover:text-primary-600 dark:hover:text-primary-500">
            {isCompact ? truncateText(title, 60) : title}
          </Link>
        </h3>

        {/* 摘要 */}
        {!isCompact && excerpt && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {truncateText(excerpt, isFeatured ? 150 : 120)}
          </p>
        )}

        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <Link href={`/author/${author.id}`} className="flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-300">
              <Avatar className="h-5 w-5">
                <AvatarImage src={author.avatar} alt={author.username} />
                <AvatarFallback>{author.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{author.username}</span>
            </Link>
            
            <time dateTime={publishedAt || article.createdAt}>
              {formatRelativeTime(publishedAt || article.createdAt)}
            </time>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewCount.toLocaleString()}</span>
            </span>
            
            <span className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{readingTime} 分钟</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}