import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-6xl font-extrabold text-primary-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">页面不存在</h2>
      <p className="text-gray-600 mb-8">您访问的页面不存在或已被移除</p>
      <Link
        to="/"
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
      >
        返回首页
      </Link>
    </div>
  );
};

export { NotFound };
export default NotFound;
