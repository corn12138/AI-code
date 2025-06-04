import ClientPageWrapper from '../components/ClientPageWrapper';

export default function HomePage() {
    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8">欢迎访问我的博客</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4">最新文章</h2>
                        <p className="text-gray-600">这里将展示最新的博客文章...</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4">关于博主</h2>
                        <p className="text-gray-600">我是一名开发者，喜欢分享技术心得和生活感悟...</p>
                    </div>
                </div>
            </div>
        </ClientPageWrapper>
    );
}
