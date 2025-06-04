'use client';

import { User } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface AuthorCardProps {
    author: User;
}

const AuthorCard: FC<AuthorCardProps> = ({ author }) => {
    return (
        <div className="bg-secondary-100 rounded-lg p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary-300">
                        <Image
                            src={author.avatar || 'https://via.placeholder.com/100'}
                            alt={author.username}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-lg">
                        <Link href={`/author/${author.id}`} className="text-secondary-900 hover:text-primary-600">
                            {author.username}
                        </Link>
                    </h3>

                    {author.bio && (
                        <p className="text-secondary-600 mt-1 text-sm leading-relaxed">
                            {author.bio}
                        </p>
                    )}

                    <div className="mt-3 flex gap-2">
                        <Link href={`/author/${author.id}`} className="text-sm inline-flex items-center px-3 py-1 bg-white rounded-full border border-secondary-200 text-secondary-700 hover:bg-gray-50">
                            查看更多文章
                        </Link>
                        <button className="text-sm inline-flex items-center px-3 py-1 bg-primary-50 rounded-full border border-primary-500 text-primary-700 hover:bg-primary-100">
                            关注作者
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorCard;
