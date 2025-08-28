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
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                    <FireIcon className="h-5 w-5 text-red-500 mr-2" />
                    热门话题
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">更多</button>
            </div>
            <div className="space-y-3">
                {topics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                            #{item.topic}
                        </span>
                        <span className="text-xs text-gray-500">{item.count}</span>
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

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-4">
                <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-900">本周排行</h3>
            </div>
            <div className="space-y-3">
                {rankings.map((item) => (
                    <div key={item.rank} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${item.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gray-400'
                                }`}>
                                {item.rank}
                            </div>
                            <span className="text-sm text-gray-700">{item.author}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.score}分</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
