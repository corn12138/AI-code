'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-6xl font-bold text-red-500 mb-6">⚠️</div>
      <h2 className="text-2xl font-bold mb-4">出现错误</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        非常抱歉，加载此页面时出现了问题。
        {process.env.NODE_ENV === 'development' && (
          <span className="block mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm overflow-auto max-h-32">
            {error.message}
          </span>
        )}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          重新加载
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
