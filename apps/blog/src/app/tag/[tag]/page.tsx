import ClientTagPage from '@/components/tag/ClientTagPage';
import { fetchArticles, fetchTags } from '@/services/api';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `${decodeURIComponent(tag)} 相关文章`,
    description: `浏览与 ${decodeURIComponent(tag)} 相关的技术文章和教程`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const result = await fetchArticles({ tag });
  const articles = Array.isArray(result) ? result : result.articles;
  const tags = await fetchTags();

  // 确认标签存在
  const tagExists = tags.some(t => t.name.toLowerCase() === tag.toLowerCase());

  if (!tagExists) {
    notFound();
  }

  return <ClientTagPage tag={tag} initialArticles={articles} tags={tags} />;
}
