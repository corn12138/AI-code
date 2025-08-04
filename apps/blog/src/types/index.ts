// Blog项目特有的类型定义

export interface Tag {
    id: string;
    name: string;
    description?: string;
    slug: string;
    count?: number;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        email?: string;
        avatar?: string;
        roles?: string[];
        createdAt?: string;
        bio?: string;
    };
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
    author: {
        id: string;
        username: string;
        email?: string;
        avatar?: string;
        roles?: string[];
        bio?: string;
        createdAt?: string;
    };
    tags?: Tag[];
    viewCount: number;
    likeCount: number;
    commentCount: number;
    readingTime: number;
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
