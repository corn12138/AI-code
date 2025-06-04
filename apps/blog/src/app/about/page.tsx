import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解TechBlog团队和我们的使命',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">关于我们</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-xl">
            TechBlog是一个致力于分享技术知识和见解的平台，我们相信知识共享能够促进技术的发展和创新。
          </p>
          
          <h2>我们的使命</h2>
          <p>
            我们的使命是创建一个开放、包容的技术社区，让开发者和技术爱好者能够轻松地分享和获取知识。
            我们希望通过高质量的内容和良好的用户体验，帮助更多人学习和成长。
          </p>
          
          <div className="my-8 relative h-80 rounded-xl overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Our team" 
              fill 
              className="object-cover" 
            />
          </div>
          
          <h2>我们的团队</h2>
          <p>
            我们是一群热爱技术的开发者、设计师和内容创作者。我们来自不同的背景，但都有一个共同的目标：
            打造一个优质的技术内容平台。
          </p>
          
          <h2>核心价值观</h2>
          <ul>
            <li><strong>开放共享</strong> - 我们相信知识应该是开放和共享的</li>
            <li><strong>持续学习</strong> - 技术世界不断进步，我们也在不断学习</li>
            <li><strong>社区驱动</strong> - 社区的反馈和贡献是我们前进的动力</li>
            <li><strong>优质体验</strong> - 我们致力于提供最好的用户体验和内容质量</li>
          </ul>
          
          <h2>联系我们</h2>
          <p>
            如果您有任何问题、建议或合作意向，欢迎随时联系我们：
            <a href="mailto:contact@techblog.com" className="ml-1">contact@techblog.com</a>
          </p>
          
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-4">加入我们</h3>
            <p className="mb-4">
              我们一直在寻找热爱技术和写作的人才加入我们的团队。如果您对技术充满热情，并且愿意分享您的知识和经验，
              我们非常欢迎您成为我们的作者或团队成员。
            </p>
            <Link 
              href="/join-us" 
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
