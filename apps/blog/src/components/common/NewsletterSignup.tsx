'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setEmail('');
      
      // 5秒后重置成功状态
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full">
      {isSuccess ? (
        <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
          感谢订阅！我们会将最新内容发送到您的邮箱。
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="您的邮箱地址"
              required
              disabled={isSubmitting}
              className="flex-1"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '订阅中...' : '订阅'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            我们尊重您的隐私，不会向任何第三方分享您的信息
          </p>
        </form>
      )}
    </div>
  );
}
