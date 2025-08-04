import { formatDate } from '@/utils/date';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface User {
    id: string;
    username: string;
    avatar?: string;
}

interface ArticleMetaProps {
    author: User;
    date: string;
    readingTime?: number;
    views?: number;
}

const ArticleMeta: FC<ArticleMetaProps> = ({ author, date, readingTime, views }) => {
    return (
        <div className="flex items-center text-gray-500 text-sm mb-6">
            <div className="flex items-center">
                <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image
                        src={author.avatar || '/default-avatar.svg'}
                        alt={author.username}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <Link href={`/author/${author.id}`} className="text-gray-700 hover:text-blue-600 font-medium">
                    {author.username}
                </Link>
            </div>

            <span className="mx-2">•</span>

            <time dateTime={date} className="mr-2">
                {formatDate(date)}
            </time>

            {readingTime && (
                <>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{readingTime} 分钟阅读</span>
                    </div>
                </>
            )}

            {views !== undefined && (
                <>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>{views} 次阅读</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default ArticleMeta;
