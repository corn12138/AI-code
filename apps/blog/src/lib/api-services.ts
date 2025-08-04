import { toast as toastFunction } from '@/components/ui/use-toast';
import { Article, PaginatedResult, Tag } from '@/models/article';
// import { API_BASE_PATH, AUTH_TOKEN_KEY } from '@shared/auth/src/constants'; // 暂时注释，模块不存在
const API_BASE_PATH = '/api';
const AUTH_TOKEN_KEY = 'auth_token';
import axios from 'axios';

// Create a toast function with proper typing
const toast = toastFunction;

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:3001${API_BASE_PATH}`;

// 创建axios实例
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 请求拦截器 - 添加认证Token和CSRF令牌
api.interceptors.request.use(
  (config) => {
    // 仅在客户端添加认证token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加CSRF令牌
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 增加令牌刷新机制
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且不是刷新令牌请求且未尝试过刷新
    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')) {

      originalRequest._retry = true;

      try {
        // 尝试刷新令牌
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data;

        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

        // 使用新令牌重试原请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除认证信息
        localStorage.removeItem(AUTH_TOKEN_KEY);

        // 处理认证错误
        toast({
          title: "会话已过期",
          description: "请重新登录",
          variant: "destructive",
        });

        // 重定向到登录页
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || '请求失败，请稍后重试';

    // 处理认证错误
    if (error.response?.status === 401) {
      // 如果是CSRF错误，提示刷新页面
      if (error.response.data?.message?.includes('CSRF')) {
        toast({
          title: "安全验证失败",
          description: "请刷新页面或重新登录",
          variant: "destructive",
        });
      }
      // 普通认证错误
      else {
        toast({
          title: "需要登录",
          description: "请先登录后再操作",
          variant: "destructive",
        });

        // 可以在这里处理重定向到登录页
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    // 其他错误
    else {
      toast({
        title: "操作失败",
        description: message,
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

// 模拟API服务延迟
const simulateDelay = async (ms: number = 500) => {
  if (process.env.NODE_ENV !== 'production') {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
};

// 上传图片服务
export async function uploadImageService(file: File): Promise<string> {
  try {
    // 在生产环境：使用真实API
    if (process.env.NODE_ENV === 'production') {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    }
    // 开发环境：模拟上传
    else {
      await simulateDelay(1500);

      // 生成随机图片URL (模拟)
      const randomId = Math.floor(Math.random() * 1000) + 1;
      return `https://images.unsplash.com/photo-${randomId}?w=800&q=80`;
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('图片上传失败');
  }
}

// 获取文章列表
export async function getArticlesService(params?: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  author?: string;
  featured?: boolean;
  sort?: string;
}): Promise<PaginatedResult<Article>> {
  try {
    // 生产环境：调用真实API
    if (process.env.NODE_ENV === 'production') {
      const response = await api.get('/articles', { params });
      return response.data;
    }
    // 开发环境：模拟数据
    else {
      await simulateDelay();

      // 模拟数据生成
      const articlesPerPage = params?.limit || 10;
      const currentPage = params?.page || 1;
      const startIndex = (currentPage - 1) * articlesPerPage;

      // 生成示例文章
      const sampleArticles: Article[] = Array(30).fill(null).map((_, index) => ({
        id: `article-${index + 1}`,
        title: `${params?.featured ? '[精选] ' : ''}示例技术文章标题 ${index + 1}`,
        slug: `sample-article-${index + 1}`,
        excerpt: '这是文章的摘要，简要介绍文章内容和核心观点，吸引读者点击阅读全文...',
        content: '# 示例文章\n\n这是文章的内容...\n\n## 小标题\n\n- 要点1\n- 要点2\n\n```js\nconsole.log("示例代码");\n```',
        coverImage: `https://images.unsplash.com/photo-${1500000000 + index}?auto=format&fit=crop&w=800&q=60`,
        author: {
          id: 'user-1',
          username: '示例作者',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          bio: '资深开发者，热爱技术分享',
          createdAt: new Date().toISOString()
        },
        tags: [
          { id: 'tag-1', name: 'JavaScript', slug: 'javascript' },
          { id: 'tag-2', name: 'React', slug: 'react' }
        ],
        createdAt: new Date(Date.now() - index * 86400000 * 2).toISOString(),
        publishedAt: new Date(Date.now() - index * 86400000 * 2).toISOString(),
        viewCount: Math.floor(Math.random() * 1000) + 100,
        likeCount: Math.floor(Math.random() * 50) + 5,
        commentCount: Math.floor(Math.random() * 20),
        readingTime: Math.floor(Math.random() * 10) + 2,
        isFeatured: params?.featured || index < 3
      }));

      // 筛选和排序
      let filteredArticles = [...sampleArticles];

      // 标签筛选
      if (params?.tag) {
        filteredArticles = filteredArticles.filter(article =>
          article.tags.some(tag =>
            tag.name.toLowerCase() === params.tag?.toLowerCase() ||
            tag.slug === params.tag
          )
        );
      }

      // 作者筛选
      if (params?.author) {
        filteredArticles = filteredArticles.filter(article =>
          article.author.id === params.author ||
          article.author.username.toLowerCase() === params.author?.toLowerCase()
        );
      }

      // 搜索
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt?.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower)
        );
      }

      // 特色文章
      if (params?.featured) {
        filteredArticles = filteredArticles.filter(article => article.isFeatured);
      }

      // 排序
      switch (params?.sort) {
        case 'newest':
          filteredArticles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
          break;
        case 'popular':
          filteredArticles.sort((a, b) => b.viewCount - a.viewCount);
          break;
        case 'trending':
          filteredArticles.sort((a, b) => (b.commentCount + b.likeCount) - (a.commentCount + a.likeCount));
          break;
        default:
          // 默认按最新排序
          filteredArticles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
      }

      // 分页
      const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

      return {
        data: paginatedArticles,
        meta: {
          total: filteredArticles.length,
          page: currentPage,
          limit: articlesPerPage,
          totalPages: Math.ceil(filteredArticles.length / articlesPerPage),
          hasNextPage: startIndex + articlesPerPage < filteredArticles.length,
          hasPrevPage: currentPage > 1
        }
      };
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

// 获取热门标签
export async function getPopularTagsService(): Promise<Tag[]> {
  try {
    // 生产环境：调用真实API
    if (process.env.NODE_ENV === 'production') {
      const response = await api.get('/tags/popular');
      return response.data;
    }
    // 开发环境：模拟数据
    else {
      await simulateDelay(300);

      return [
        { id: 'tag-1', name: 'JavaScript', slug: 'javascript', count: 42 },
        { id: 'tag-2', name: 'React', slug: 'react', count: 38 },
        { id: 'tag-3', name: 'TypeScript', slug: 'typescript', count: 31 },
        { id: 'tag-4', name: 'Next.js', slug: 'nextjs', count: 28 },
        { id: 'tag-5', name: 'Node.js', slug: 'nodejs', count: 24 },
        { id: 'tag-6', name: 'CSS', slug: 'css', count: 22 },
        { id: 'tag-7', name: 'API', slug: 'api', count: 19 },
        { id: 'tag-8', name: '性能优化', slug: 'performance', count: 17 },
        { id: 'tag-9', name: '前端工程化', slug: 'frontend-engineering', count: 15 },
        { id: 'tag-10', name: '微服务', slug: 'microservices', count: 13 },
        { id: 'tag-11', name: 'Docker', slug: 'docker', count: 10 },
        { id: 'tag-12', name: '云原生', slug: 'cloud-native', count: 8 },
      ];
    }
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    throw error;
  }
}
