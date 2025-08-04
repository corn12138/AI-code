// 服务器端函数
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

// 定义Post类型
interface Post {
    id: string;
    slug: string;
    date?: string;
    title?: string;
    description?: string;
    content?: string;
    [key: string]: any; // 允许其他任意属性
}

export async function getPosts(): Promise<Post[]> {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData: Post[] = fileNames.map(fileName => {
        // 从文件名中删除".md"以获取id
        const id = fileName.replace(/\.md$/, '');

        // 读取markdown文件为字符串
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // 使用gray-matter解析文章元数据部分
        const matterResult = matter(fileContents);

        return {
            id,
            slug: id,
            ...matterResult.data,
        } as Post;
    });

    // 按日期排序
    return allPostsData.sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA < dateB) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getPostBySlug(slug: string) {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        const { data, content } = matter(fileContents);

        // 转换内容为HTML
        const processedContent = await remark()
            .use(html)
            .process(content);
        const contentHtml = processedContent.toString();

        return {
            id: slug,
            slug,
            content: contentHtml,
            ...data,
        };
    } catch (error) {
        console.error(`获取文章失败: ${slug}`, error);
        return null;
    }
}

export async function getAllSlugs() {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.map(fileName => {
        return fileName.replace(/\.md$/, '');
    });
}

export async function getRelatedPosts(currentPostId: string, tags: string[]) {
    // 暂时返回空数组，避免类型错误
    return [];
}
