import { fetchArticles, fetchTags } from '@/services/api';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ClientTagPage from '@/components/tag/ClientTagPage';

interface Props {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${decodeURIComponent(params.tag)} 相关文章`,
    description: `浏览与 ${decodeURIComponent(params.tag)} 相关的技术文章和教程`,
  };
}

export default async function TagPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag);
  const articles = await fetchArticles({ tag });
  const tags = await fetchTags();

  // 确认标签存在
  const tagExists = tags.some(t => t.name.toLowerCase() === tag.toLowerCase());
  
  if (!tagExists) {
    notFound();
  }

  return <ClientTagPage tag={tag} initialArticles={articles} tags={tags} />;
}
