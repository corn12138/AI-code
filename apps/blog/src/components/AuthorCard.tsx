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
        <div className="bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 p-6 hover:shadow-cosmic transition-all duration-300 group">
            <div className="flex items-start">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden mr-4 border border-cosmic-500/30">
                    <Image
                        src={author.avatar || '/default-avatar.svg'}
                        alt={author.username}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                <div className="flex-1">
                    <Link href={`/user/${author.id}`}>
                        <h3 className="text-lg font-semibold text-space-200 hover:text-cosmic-300 transition-colors duration-300">
                            {author.username}
                        </h3>
                    </Link>

                    <p className="text-space-400 mt-2 leading-relaxed">
                        {(author as any).bio || '这个作者很懒，还没有填写个人简介。'}
                    </p>

                    <div className="mt-4 flex space-x-4">
                        <Link
                            href={`/user/${author.id}`}
                            className="text-sm text-cosmic-400 hover:text-cosmic-300 transition-colors duration-300 px-3 py-1.5 bg-space-800/60 rounded-lg hover:bg-cosmic-600/20 hover:border hover:border-cosmic-500/30 backdrop-blur-sm"
                        >
                            查看更多文章
                        </Link>
                        <button className="text-sm text-space-400 hover:text-nebula-400 transition-colors duration-300 px-3 py-1.5 bg-space-800/60 rounded-lg hover:bg-nebula-600/20 hover:border hover:border-nebula-500/30 backdrop-blur-sm">
                            关注作者
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
