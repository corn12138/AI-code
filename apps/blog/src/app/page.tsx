'use client';

import {
  BookmarkIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  EyeIcon,
  FireIcon,
  HeartIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import TopNavbar from '../components/layout/TopNavbar';

interface Article {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    company?: string;
  };
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  publishedAt: string;
  readTime: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function HomePage() {
  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: '这个夏日让我教你一起"学宝典"，参与蔚来小伙编辑器让你轻松拿分！',
      content: '免换集成超级礼包：🔥 pocket3、apple watch、机械键盘、京东卡等你拿！立即参与：🔗 sourl.co',
      author: {
        name: 'AI博主',
        company: 'AI技术专家'
      },
      tags: ['前端', '技术分享', '开发工具'],
      likeCount: 42,
      commentCount: 7,
      viewCount: 1234,
      publishedAt: '1月前',
      readTime: 5,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Next.js 14 全栈开发实战：从零到生产部署的完整指南',
      content: 'Next.js 14 带来了许多激动人心的新特性，包括 App Router、Server Components、Streaming 等。本文将带你从零开始构建一个完整的全栈应用...',
      author: {
        name: '前端小王',
        company: '字节跳动'
      },
      tags: ['Next.js', 'React', '全栈开发'],
      likeCount: 128,
      commentCount: 23,
      viewCount: 5678,
      publishedAt: '2天前',
      readTime: 8,
      isLiked: true,
      isBookmarked: true
    },
    {
      id: '3',
      title: 'AI 驱动的代码生成：如何用 ChatGPT 提升开发效率',
      content: '在这个 AI 飞速发展的时代，ChatGPT 等大语言模型正在改变我们的开发方式。本文将分享如何有效利用 AI 工具来提升编程效率...',
      author: {
        name: 'AI开发者',
        company: 'OpenAI'
      },
      tags: ['AI', 'ChatGPT', '开发效率'],
      likeCount: 89,
      commentCount: 15,
      viewCount: 3421,
      publishedAt: '3天前',
      readTime: 6,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '4',
      title: 'TypeScript 5.0 新特性深度解析：Decorators 和 const 断言',
      content: 'TypeScript 5.0 正式发布！新版本带来了对 ECMAScript 装饰器的支持、const 断言的改进，以及更好的性能优化...',
      author: {
        name: 'TS专家',
        company: 'Microsoft'
      },
      tags: ['TypeScript', 'JavaScript', '新特性'],
      likeCount: 156,
      commentCount: 31,
      viewCount: 7890,
      publishedAt: '5天前',
      readTime: 10,
      isLiked: true,
      isBookmarked: false
    }
  ]);

  const ArticleCard = ({ article }: { article: Article }) => (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-6 mb-4">
      {/* 作者信息 */}
      <div className="flex items-center mb-4">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
          {article.author.name.charAt(0)}
        </div>
        <div className="ml-3">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">{article.author.name}</span>
            {article.author.company && (
              <>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-sm text-gray-600">{article.author.company}</span>
              </>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-3 w-3 mr-1" />
            {article.publishedAt}
            <span className="mx-1">·</span>
            {article.readTime}分钟阅读
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <Link href={`/article/${article.id}`} className="block group">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.content}
        </p>
      </Link>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 互动数据 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className={`flex items-center space-x-1 text-sm transition-colors ${article.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}>
            {article.isLiked ? (
              <HeartSolidIcon className="h-4 w-4" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
            <span>{article.likeCount}</span>
          </button>

          <Link href={`/article/${article.id}#comments`} className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ChatBubbleLeftIcon className="h-4 w-4" />
            <span>{article.commentCount}</span>
          </Link>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <EyeIcon className="h-4 w-4" />
            <span>{article.viewCount}</span>
          </div>
        </div>

        <button className={`p-1 rounded transition-colors ${article.isBookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
          }`}>
          <BookmarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const TrendingTopics = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <FireIcon className="h-5 w-5 text-red-500 mr-2" />
          热门话题
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">更多</button>
      </div>
      <div className="space-y-3">
        {[
          { topic: 'Next.js 14 新特性', count: '1.2k 讨论' },
          { topic: 'AI 编程助手', count: '856 讨论' },
          { topic: 'React Server Components', count: '743 讨论' },
          { topic: 'TypeScript 最佳实践', count: '621 讨论' }
        ].map((item, index) => (
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

  const WeeklyRanking = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center mb-4">
        <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
        <h3 className="font-semibold text-gray-900">本周排行</h3>
      </div>
      <div className="space-y-3">
        {[
          { rank: 1, author: '前端大师', score: '1.2k' },
          { rank: 2, author: 'React专家', score: '998' },
          { rank: 3, author: 'Vue开发者', score: '876' },
          { rank: 4, author: 'Node.js高手', score: '745' },
          { rank: 5, author: 'TypeScript忍者', score: '692' }
        ].map((item) => (
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

  return (
    <div>
      <TopNavbar />
      <MainLayout>
        <div className="flex">
          {/* 主内容区域 */}
          <div className="flex-1 p-6 mr-6">
            {/* 内容过滤标签 */}
            <div className="flex items-center space-x-4 mb-6 border-b border-gray-200 pb-4">
              <button className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm font-medium">
                推荐
              </button>
              <button className="text-gray-600 hover:text-gray-900 pb-2 text-sm font-medium">
                最新
              </button>
              <button className="text-gray-600 hover:text-gray-900 pb-2 text-sm font-medium">
                热门
              </button>
              <button className="text-gray-600 hover:text-gray-900 pb-2 text-sm font-medium">
                关注
              </button>
            </div>

            {/* 文章列表 */}
            <div>
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* 加载更多 */}
            <div className="text-center py-8">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                加载更多
              </button>
            </div>
          </div>

          {/* 右侧额外内容（在小屏幕时隐藏） */}
          <div className="hidden lg:block w-64 space-y-6">
            <TrendingTopics />
            <WeeklyRanking />
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
