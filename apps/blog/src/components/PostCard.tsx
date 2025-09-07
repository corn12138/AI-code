import { formatRelativeTime } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface Post {
    id: string
    title?: string
    excerpt?: string
    slug: string
    published?: boolean
    authorId?: string
    author?: {
        id: string
        name: string
        email: string
        username: string
        avatar: string
        bio: string
        createdAt: Date
        updatedAt: Date
    }
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
    date?: string
}

interface PostCardProps {
    post: Post
    onCardClick?: (post: Post) => void
    onTagClick?: (tag: string) => void
    onAuthorClick?: (author: Post['author']) => void
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    onCardClick,
    onTagClick,
    onAuthorClick,
}) => {
    const handleCardClick = () => {
        onCardClick?.(post)
    }

    const handleTagClick = (e: React.MouseEvent, tag: string) => {
        e.stopPropagation()
        onTagClick?.(tag)
    }

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (post.author) {
            onAuthorClick?.(post.author)
        }
    }

    const calculateReadingTime = (content?: string) => {
        if (!content) return 0
        const wordsPerMinute = 200
        const words = content.split(/\s+/).length
        return Math.ceil(words / wordsPerMinute)
    }

    const readingTime = calculateReadingTime(post.excerpt || post.content)

    return (
        <article
            className="group relative bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 hover:border-cosmic-400/40 transition-all duration-500 ease-out p-6 hover:shadow-cosmic hover:scale-[1.02] animate-slide-up cursor-pointer"
            onClick={handleCardClick}
        >
            {/* 渐变边框效果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cosmic-500/10 via-nebula-500/10 to-stardust-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 内容容器 */}
            <div className="relative z-10">
                <div className="flex items-center mb-4">
                    {post.author?.avatar ? (
                        <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={40}
                            height={40}
                            className="rounded-xl mr-3 border border-cosmic-500/30"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-600 flex items-center justify-center text-white font-medium text-sm shadow-cosmic mr-3">
                            {post.author?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="flex-1">
                        {post.author && (
                            <div
                                className="text-sm font-medium text-space-200 hover:text-cosmic-300 cursor-pointer transition-colors duration-300"
                                onClick={handleAuthorClick}
                            >
                                {post.author.name}
                            </div>
                        )}
                        <div className="text-xs text-space-500">
                            {post.date && formatRelativeTime(post.date)}
                            {readingTime > 0 && (
                                <span className="ml-2">
                                    · {readingTime} 分钟阅读
                                </span>
                            )}
                        </div>
                    </div>
                    {!post.published && (
                        <span className="text-xs bg-stardust-500/20 text-stardust-300 px-3 py-1 rounded-lg border border-stardust-500/30">
                            草稿
                        </span>
                    )}
                </div>

                <Link href={`/blog/${post.slug}`} className="block group">
                    <h2 className="text-xl font-bold text-space-100 mb-3 group-hover:text-cosmic-300 transition-all duration-300 line-clamp-2 leading-relaxed">
                        {post.title || '无标题'}
                    </h2>
                </Link>

                {post.excerpt && (
                    <p className="text-space-400 mb-4 line-clamp-3 leading-relaxed group-hover:text-space-300 transition-colors duration-300">
                        {post.excerpt}
                    </p>
                )}

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs bg-space-800/60 text-space-300 px-3 py-1.5 rounded-lg hover:bg-cosmic-600/20 hover:text-cosmic-300 hover:border hover:border-cosmic-500/30 cursor-pointer transition-all duration-300 backdrop-blur-sm"
                                onClick={(e) => handleTagClick(e, tag)}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 悬停时的光晕效果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cosmic-500/5 via-nebula-500/5 to-stardust-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </article>
    )
}

export default PostCard
