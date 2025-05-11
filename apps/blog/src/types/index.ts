export interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
    role: string;
    createdAt: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    createdAt: string;
    updatedAt?: string;
}

export interface Article {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    author: User;
    tags?: Tag[];
    comments?: Comment[];
    isPublished: boolean;
    views?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArticleDto {
    title: string;
    content: string;
    tagIds: string[];
    isPublished: boolean;
    coverImage?: string;
}

export interface UpdateArticleDto {
    title?: string;
    content?: string;
    tagIds?: string[];
    isPublished?: boolean;
    coverImage?: string;
}

export interface ArticleFilters {
    tag?: string;
    search?: string;
    author?: string;
    limit?: number;
    offset?: number;
}

export interface CreateCommentDto {
    content: string;
    articleId: string;
}
