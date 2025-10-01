import axios from 'axios';
import { Article, ArticleCategory, PaginatedResponse } from '../src/types/index.ts';

// 后端API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API请求错误:', error.message);
    return Promise.reject(error);
  }
);

// 从后端API获取文档列表
export async function fetchArticlesFromAPI(
  category?: ArticleCategory,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Article>> {
  try {
    const params: any = {
      page,
      pageSize,
    };

    // 根据分类添加过滤
    if (category && category !== 'latest') {
      params.category = category;
    }

    const response = await apiClient.get('/api/mobile/docs', { params });

    // 转换后端数据格式到前端格式
    const backendData = response.data.data || response.data;
    const backendDocs = backendData.items || [];
    const total = backendData.total || 0;
    const hasMore = backendData.hasMore || false;

    const articles: Article[] = backendDocs.map(transformMobileDoc);

    return {
      items: articles,
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (error) {
    console.error('获取文档列表失败:', error);
    // 降级到模拟数据
    return generateMockData(category, page, pageSize);
  }
}

// 从后端API获取单篇文档
export async function fetchArticleByIdFromAPI(id: string): Promise<Article | null> {
  try {
    const response = await apiClient.get(`/api/mobile/docs/${id}`);
    const backendDoc = response.data.data || response.data;

    if (!backendDoc) {
      return null;
    }

    return transformMobileDoc(backendDoc);
  } catch (error) {
    console.error('获取文档详情失败:', error);
    // 降级到模拟数据
    return generateMockArticle(id);
  }
}

// 转换移动端文档数据格式到前端文章格式
function transformMobileDoc(mobileDoc: any): Article {
  return {
    id: mobileDoc.id,
    title: mobileDoc.title,
    summary: mobileDoc.summary || generateSummary(mobileDoc.content),
    content: mobileDoc.content,
    category: mobileDoc.category || 'latest',
    author: mobileDoc.author || '系统管理员',
    publishDate: mobileDoc.createdAt || new Date().toISOString(),
    readTime: mobileDoc.readTime || calculateReadTime(mobileDoc.content),
    tags: mobileDoc.tags || [],
    imageUrl: mobileDoc.imageUrl,
    isHot: mobileDoc.isHot || false,
  };
}

// 生成模拟数据（降级方案）
function generateMockData(
  category?: ArticleCategory,
  page: number = 1,
  pageSize: number = 10
): PaginatedResponse<Article> {
  const mockArticles = generateMockArticles(category || 'latest');
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = mockArticles.slice(startIndex, endIndex);

  return {
    items,
    total: mockArticles.length,
    page,
    pageSize,
    hasMore: endIndex < mockArticles.length,
  };
}

// 生成模拟文章
function generateMockArticle(id: string): Article {
  return {
    id,
    title: '文档加载中...',
    summary: '正在从服务器获取文档内容，请稍候...',
    content: '# 文档加载中\n\n正在从服务器获取文档内容，请稍候...',
    category: 'latest',
    author: '系统管理员',
    publishDate: new Date().toISOString(),
    readTime: 1,
    tags: ['加载中'],
    imageUrl: null,
    isHot: false,
  };
}

// 生成模拟文章列表
function generateMockArticles(category: ArticleCategory): Article[] {
  const categoryData = {
    latest: {
      titles: [
        '移动端技术文章阅读平台 - 文档中心',
        'SSR实现指南 - 从零开始构建服务端渲染',
        'SSR vs Next.js 全面对比分析',
        'SSR架构深度解析 - 核心原理与实现',
        'SSR性能优化指南 - 全面提升渲染性能',
      ],
      prefix: '最新',
    },
    frontend: {
      titles: [
        'SSR实现指南 - 从零开始构建服务端渲染',
        'SSR vs Next.js 全面对比分析',
        'SSR性能优化指南 - 全面提升渲染性能',
        'React 18 新特性深度解析',
        'TypeScript 高级类型系统',
      ],
      prefix: '前端',
    },
    backend: {
      titles: [
        'SSR架构深度解析 - 核心原理与实现',
        'Node.js 性能优化实战',
        'Express.js 最佳实践',
        'PostgreSQL 高级查询优化',
        'RESTful API 设计规范',
      ],
      prefix: '后端',
    },
    ai: {
      titles: [
        'AI 驱动的代码生成技术',
        'ChatGPT API 集成实战',
        '机器学习模型部署指南',
        'TensorFlow.js 入门教程',
        '深度学习框架选择指南',
      ],
      prefix: 'AI',
    },
    mobile: {
      titles: [
        '移动端技术文章阅读平台架构设计',
        'React Native 跨平台开发',
        'Flutter 性能优化技巧',
        '移动端适配解决方案',
        'PWA 应用开发指南',
      ],
      prefix: '移动端',
    },
    design: {
      titles: [
        'UI/UX 设计趋势分析',
        'Figma 设计系统构建',
        '色彩搭配理论与实践',
        '响应式设计最佳实践',
        '用户体验优化策略',
      ],
      prefix: '设计',
    },
  };

  const data = categoryData[category];

  return data.titles.map((title, index) => ({
    id: `${category}-${index + 1}`,
    title: `${data.prefix} - ${title}`,
    summary: `这是一篇关于${title}的详细文章，包含了最新的技术趋势和实践经验分享。文章深入浅出地介绍了相关概念和实际应用场景。`,
    content: generateMockContent(title),
    category,
    author: ['AI-Code Team', '技术专家', '架构师', '开发工程师', '产品经理'][index % 5],
    publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: Math.floor(Math.random() * 10) + 3,
    tags: generateTags(category),
    imageUrl: `https://picsum.photos/400/240?random=${category}-${index}`,
    isHot: Math.random() > 0.7,
  }));
}

function generateMockContent(title: string): string {
  return `
# ${title}

## 概述

这是一篇关于${title}的详细技术文章。在当今快速发展的技术环境中，掌握最新的技术趋势和最佳实践变得越来越重要。

## 主要内容

### 1. 技术背景

随着技术的不断发展，我们需要深入了解相关的技术背景和发展历程。这有助于我们更好地理解当前的技术状况和未来的发展方向。

### 2. 核心概念

在深入学习之前，我们需要掌握一些核心概念：

- **概念一**：这是一个重要的基础概念，需要深入理解
- **概念二**：建立在概念一基础上的进阶概念
- **概念三**：实际应用中的关键概念

### 3. 实践应用

理论知识需要结合实践才能真正掌握。以下是一些实际应用场景：

\`\`\`javascript
// 示例代码
function example() {
  console.log('这是一个示例代码片段');
  return 'Hello World';
}
\`\`\`

### 4. 最佳实践

基于实际项目经验，我们总结了以下最佳实践：

1. **性能优化**：关注应用性能，及时优化瓶颈
2. **代码质量**：保持代码的可读性和可维护性
3. **团队协作**：建立良好的团队协作流程

## 总结

通过本文的学习，我们深入了解了${title}的相关知识。在实际工作中，我们应该将这些知识与具体项目相结合，不断提升自己的技术水平。

## 参考资料

- 官方文档
- 技术博客
- 开源项目
- 社区讨论

---

*本文持续更新中，欢迎关注最新动态。*
  `.trim();
}

function generateTags(category: ArticleCategory): string[] {
  const tagMap = {
    latest: ['最新', '趋势', '技术'],
    frontend: ['前端', 'JavaScript', 'React', 'SSR'],
    backend: ['后端', 'Node.js', '数据库', 'API'],
    ai: ['人工智能', '机器学习', 'ChatGPT', 'TensorFlow'],
    mobile: ['移动开发', 'React Native', 'Flutter', 'PWA'],
    design: ['UI设计', 'UX设计', 'Figma', '用户体验'],
  };

  return tagMap[category] || ['技术', '开发'];
}

// 生成文章摘要
function generateSummary(content: string): string {
  if (!content) return '';

  // 移除Markdown标记和HTML标签
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/\n+/g, ' ') // 替换换行为空格
    .trim();

  // 截取前200个字符作为摘要
  return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
}

// 计算阅读时间（基于字数）
function calculateReadTime(content: string): number {
  if (!content) return 1;

  const wordsPerMinute = 200; // 假设每分钟阅读200字
  const wordCount = content.length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);

  return Math.max(1, readTime); // 至少1分钟
}

// 健康检查API
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API健康检查失败:', error);
    return false;
  }
}
