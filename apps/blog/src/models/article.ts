export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  replies?: Comment[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: User;
  tags: Tag[];
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number; // 分钟数
  isFeatured?: boolean;
  isDraft?: boolean;
  comments?: Comment[];
}

export interface ArticleFilters {
  tag?: string;
  author?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'popular' | 'trending';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tagIds: string[];
  isDraft?: boolean;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface CreateCommentDto {
  content: string;
  articleId: string;
  parentId?: string;
}
