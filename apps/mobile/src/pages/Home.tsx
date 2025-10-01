import { lowcodeApi } from '@/services/api';
import { PageResponse } from '@/types';
import { formatRelativeTime } from '@/utils/date';
import { useAuth } from '@corn12138/hooks';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [pages, setPages] = useState<PageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 加载页面列表
  useEffect(() => {
    const loadPages = async () => {
      try {
        const data = await lowcodeApi.getPages();
        setPages(data);
      } catch (error) {
        console.error('Failed to load pages:', error);
        toast.error('加载页面列表失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, []);

  // 删除页面
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('确定要删除这个页面吗？此操作不可撤销。')) {
      return;
    }

    try {
      await lowcodeApi.deletePage(id);
      setPages(pages.filter(page => page.id !== id));
      toast.success('页面已删除');
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error('删除页面失败');
    }
  };

  // 创建新页面
  const handleCreatePage = () => {
    navigate('/editor/new');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">低代码平台</h1>

          <div className="flex items-center">
            {user && (
              <span className="mr-4 text-sm text-gray-600">
                欢迎，{user.username}
              </span>
            )}
            <button
              onClick={handleCreatePage}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              创建新页面
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-4">我的页面</h2>

        {pages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">您还没有创建任何页面</p>
            <button
              onClick={handleCreatePage}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              立即创建
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <Link to={`/editor/${page.id}`} className="block p-6">
                  <h3 className="text-lg font-medium mb-2">{page.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {page.description || '暂无描述'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>上次更新: {formatRelativeTime(page.updatedAt)}</span>
                    <span className={`px-2 py-1 rounded ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {page.isPublished ? '已发布' : '草稿'}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    {page.isPublished && (
                      <a
                        href={`/preview/${page.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        预览
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDelete(page.id, e)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      删除
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
