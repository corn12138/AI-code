import { StarryBackground, StarryParticles } from '@/components/ui/StarryBackground';
import Link from 'next/link';

export default function NotFound() {
  return (
    <StarryBackground>
      <StarryParticles />
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 shadow-cosmic p-8">
          <h1 className="text-6xl font-bold text-cosmic-400 mb-4 animate-pulse">404</h1>
          <h2 className="text-3xl font-semibold text-space-200 mb-6">页面未找到</h2>
          <p className="text-lg text-space-400 mb-8">
            抱歉，我们找不到您要查找的页面。
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-cosmic text-white bg-gradient-to-r from-cosmic-600 to-nebula-600 hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300"
          >
            返回首页
          </Link>
        </div>
      </div>
    </StarryBackground>
  );
}
