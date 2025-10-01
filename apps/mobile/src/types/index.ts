// 文章类型定义
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  author: string;
  publishDate: string;
  readTime: number;
  tags: string[];
  imageUrl?: string;
  isHot?: boolean;
}

// 文章分类
export type ArticleCategory = 'latest' | 'frontend' | 'backend' | 'ai' | 'mobile' | 'design';

// 分类配置
export interface CategoryConfig {
  key: ArticleCategory;
  label: string;
  icon: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  category?: ArticleCategory;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}