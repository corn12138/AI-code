import ProfileClient from '@/components/ProfileClient';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '个人资料',
  description: '查看和管理您的个人资料',
};

export default async function ProfilePage() {
  // 服务端验证用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }

  // 可以在服务器端获取用户详细信息并传递给客户端组件
  const user = session.user;

  return <ProfileClient initialUser={user} />;
}
