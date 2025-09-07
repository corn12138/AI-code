import { Suspense } from 'react';
import { HomeContent } from '../components/home/HomeContent';
import { TrendingTopics, WeeklyRanking } from '../components/home/StaticSections';
import MainLayout from '../components/layout/MainLayout';
import TopNavbar from '../components/layout/TopNavbar';

// 模拟数据获取 - 在实际项目中这里会是数据库查询
async function getArticles() {
  // 服务端数据获取
  return [
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
  ];
}

// 服务端组件 - 利用 Next.js App Router 的 SSR 优势
export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div>
      <TopNavbar />
      <MainLayout>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 主内容区域 */}
          <div className="flex-1">
            {/* 使用 Suspense 包装动态内容 */}
            <Suspense fallback={
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 p-6 animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-xl bg-space-700"></div>
                      <div className="ml-3 space-y-2">
                        <div className="h-4 bg-space-700 rounded w-24"></div>
                        <div className="h-3 bg-space-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 bg-space-700 rounded w-3/4"></div>
                      <div className="h-4 bg-space-700 rounded w-full"></div>
                      <div className="h-4 bg-space-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            }>
              <HomeContent articles={articles} />
            </Suspense>
          </div>

          {/* 右侧静态内容 */}
          <div className="w-full lg:w-80 space-y-6">
            <TrendingTopics />
            <WeeklyRanking />
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
