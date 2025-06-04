export interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
}

export interface Tag {
    id: string;
    name: string;
    count?: number;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: User;
    replies?: Comment[];
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    publishedAt?: string;
    coverImage?: string;
    author: User;
    tags?: Tag[];
    views?: number;
    likesCount?: number;
    readingTime?: number;
    comments?: Comment[];
}

export interface ArticleFilters {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    author?: string;
    sort?: 'newest' | 'popular' | 'trending';
}

export interface CreateArticleDto {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    tagIds?: string[];
    isDraft?: boolean;
}

export interface UpdateArticleDto {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    tagIds?: string[];
    isDraft?: boolean;
}

export interface CreateCommentDto {
    articleId: string;
    content: string;
    parentId?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode: number;
    success: boolean;
}
