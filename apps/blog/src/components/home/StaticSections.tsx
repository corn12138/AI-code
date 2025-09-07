import { FireIcon, TrophyIcon } from '@heroicons/react/24/outline';

// 静态的热门话题组件 - 可以在服务端渲染
export function TrendingTopics() {
    const topics = [
        { topic: 'Next.js 14 新特性', count: '1.2k 讨论' },
        { topic: 'AI 编程助手', count: '856 讨论' },
        { topic: 'React Server Components', count: '743 讨论' },
        { topic: 'TypeScript 最佳实践', count: '621 讨论' }
    ];

    return (
        <div className="bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 p-6 mb-6 hover:shadow-cosmic transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-space-200 flex items-center">
                    <FireIcon className="h-5 w-5 text-nebula-400 mr-2 animate-pulse-slow" />
                    热门话题
                </h3>
                <button className="text-sm text-cosmic-400 hover:text-cosmic-300 transition-colors duration-300">更多</button>
            </div>
            <div className="space-y-3">
                {topics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                        <span className="text-sm text-space-300 hover:text-cosmic-300 cursor-pointer transition-colors duration-300 group-hover:scale-105">
                            #{item.topic}
                        </span>
                        <span className="text-xs text-space-500">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 静态的本周排行组件 - 可以在服务端渲染
export function WeeklyRanking() {
    const rankings = [
        { rank: 1, author: '前端大师', score: '1.2k' },
        { rank: 2, author: 'React专家', score: '998' },
        { rank: 3, author: 'Vue开发者', score: '876' },
        { rank: 4, author: 'Node.js高手', score: '745' },
        { rank: 5, author: 'TypeScript忍者', score: '692' }
    ];

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-stardust-400 to-stardust-600 shadow-stardust';
            case 2:
                return 'bg-gradient-to-r from-space-400 to-space-600';
            case 3:
                return 'bg-gradient-to-r from-nebula-400 to-nebula-600';
            default:
                return 'bg-space-600';
        }
    };

    return (
        <div className="bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 p-6 hover:shadow-cosmic transition-all duration-300">
            <div className="flex items-center mb-4">
                <TrophyIcon className="h-5 w-5 text-stardust-400 mr-2 animate-bounce-slow" />
                <h3 className="font-semibold text-space-200">本周排行</h3>
            </div>
            <div className="space-y-3">
                {rankings.map((item) => (
                    <div key={item.rank} className="flex items-center justify-between group hover:bg-space-800/30 rounded-lg p-2 transition-all duration-300">
                        <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white mr-3 ${getRankStyle(item.rank)}`}>
                                {item.rank}
                            </div>
                            <span className="text-sm text-space-300 group-hover:text-space-200 transition-colors duration-300">{item.author}</span>
                        </div>
                        <span className="text-xs text-space-500">{item.score}分</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
