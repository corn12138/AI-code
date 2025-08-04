import Image from 'next/image';
import Link from 'next/link';

type User = {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    roles?: string[];
};

interface AuthorCardProps {
    author: User;
}

export default function AuthorCard({ author }: AuthorCardProps) {
    return (
        <div className="flex items-start">
            <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                <Image
                    src={author.avatar || '/default-avatar.svg'}
                    alt={author.username}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>

            <div>
                <Link href={`/user/${author.id}`}>
                    <h3 className="text-lg font-semibold hover:text-blue-600">{author.username}</h3>
                </Link>

                <p className="text-gray-600 mt-1">
                    {(author as any).bio || '这个作者很懒，还没有填写个人简介。'}
                </p>

                <div className="mt-3 flex space-x-3">
                    <Link href={`/user/${author.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800">
                        查看更多文章
                    </Link>
                    <button className="text-sm text-gray-600 hover:text-blue-600">
                        关注作者
                    </button>
                </div>
            </div>
        </div>
    );
}
