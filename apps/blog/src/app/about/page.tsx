import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ClientPageWrapper from '../../components/ClientPageWrapper';

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解TechBlog团队和我们的使命',
};

export default function AboutPage() {
  return (
    <ClientPageWrapper>
      <div
        data-testid="about-page"
        className="container mx-auto px-4 py-12 bg-space-950"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-space-200">关于我们</h1>

          <div className="prose prose-lg max-w-none">
            <p className="lead text-xl text-space-300">
              TechBlog是一个致力于分享技术知识和见解的平台，我们相信知识共享能够促进技术的发展和创新。
            </p>

            <h2 data-testid="mission-section" className="text-xl md:text-2xl lg:text-3xl text-space-200">我们的使命</h2>
            <p className="text-space-400">
              我们的使命是创建一个开放、包容的技术社区，让开发者和技术爱好者能够轻松地分享和获取知识。
              我们希望通过高质量的内容和良好的用户体验，帮助更多人学习和成长。
            </p>

            <div
              data-testid="team-image-container"
              className="my-8 relative h-80 rounded-2xl overflow-hidden border border-cosmic-500/20 shadow-cosmic backdrop-blur-xl bg-space-900/40"
            >
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="我们的团队成员在工作"
                fill
                className="object-cover"
              />
            </div>

            <h2 data-testid="team-section" className="text-xl md:text-2xl lg:text-3xl text-space-200">我们的团队</h2>
            <p className="text-space-400">
              我们是一群热爱技术的开发者、设计师和内容创作者。我们来自不同的背景，但都有一个共同的目标：
              打造一个优质的技术内容平台。
            </p>

            <h2 data-testid="values-section" className="text-xl md:text-2xl lg:text-3xl text-space-200">核心价值观</h2>
            <ul className="text-space-400">
              <li><strong className="text-cosmic-300">开放共享</strong> - 我们相信知识应该是开放和共享的</li>
              <li><strong className="text-cosmic-300">持续学习</strong> - 技术世界不断进步，我们也在不断学习</li>
              <li><strong className="text-cosmic-300">社区驱动</strong> - 社区的反馈和贡献是我们前进的动力</li>
              <li><strong className="text-cosmic-300">优质体验</strong> - 我们致力于提供最好的用户体验和内容质量</li>
            </ul>

            <h2 className="text-xl md:text-2xl lg:text-3xl text-space-200">联系我们</h2>
            <p className="text-space-400">
              如果您有任何问题、建议或合作意向，欢迎随时联系我们：
              <a href="mailto:contact@techblog.com" aria-label="联系我们邮箱" data-testid="contact-link" className="ml-1 text-cosmic-400 hover:text-cosmic-300 transition-colors">contact@techblog.com</a>
            </p>

            <div
              data-testid="join-us-section"
              className="mt-8 p-4 md:p-6 lg:p-8 bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 shadow-cosmic"
            >
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 text-space-200">加入我们</h3>
              <p className="mb-4 text-space-400">
                我们一直在寻找热爱技术和写作的人才加入我们的团队。如果您对技术充满热情，并且愿意分享您的知识和经验，
                我们非常欢迎您成为我们的作者或团队成员。
              </p>
              <Link
                href="/join-us"
                aria-label="了解更多关于加入我们的信息"
                data-testid="join-us-button"
                className="inline-block px-6 py-3 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-lg hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 shadow-cosmic"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
