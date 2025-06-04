import EditorClient from '@/components/EditorClient';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '创建文章',
  description: '使用Markdown编辑器创建新文章',
};

export default async function EditorPage() {
  // 服务端验证用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/editor');
  }

  return <EditorClient />;
}
