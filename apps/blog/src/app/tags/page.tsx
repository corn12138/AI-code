import ClientPageWrapper from '@/components/ClientPageWrapper';
import TagList from '@/components/TagList';
import { fetchTags } from '@/services/api';
import { ClientOnly } from '@/utils/clientUtils';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '标签索引',
    description: '浏览所有技术主题标签',
};

export default async function TagsPage() {
    // 获取标签数据
    const tags = await fetchTags();

    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">标签云</h1>

                <ClientOnly fallback={<div>加载标签中...</div>}>
                    {/* 使用ClientOnly确保客户端交互组件仅在客户端渲染 */}
                    <TagList
                        tags={tags}
                        selectedTag={null}
                        onTagSelect={(tag) => console.log(`Selected tag: ${tag}`)}
                    />
                </ClientOnly>
            </div>
        </ClientPageWrapper>
    );
}
