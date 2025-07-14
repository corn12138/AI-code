import { Prisma } from '@prisma/client';

// 用户类型
export type User = Prisma.UserGetPayload<{
    include: {
        articles: true;
        comments: true;
    };
}>;

// 文章类型
export type Article = Prisma.ArticleGetPayload<{
    include: {
        author: true;
        category: true;
        tags: true;
        comments: {
            include: {
                author: true;
                replies: {
                    include: {
                        author: true;
                    };
                };
            };
        };
    };
}>;

// 简化的文章类型（用于列表显示）
export type ArticleWithBasicInfo = Prisma.ArticleGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                username: true;
                avatar: true;
            };
        };
        tags: {
            select: {
                id: true;
                name: true;
                slug: true;
            };
        };
        _count: {
            select: {
                comments: true;
            };
        };
    };
}>;

// 标签类型
export type Tag = Prisma.TagGetPayload<{
    include: {
        _count: {
            select: {
                articles: true;
            };
        };
    };
}>;

// 评论类型
export type Comment = Prisma.CommentGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                username: true;
                avatar: true;
            };
        };
        replies: {
            include: {
                author: {
                    select: {
                        id: true;
                        username: true;
                        avatar: true;
                    };
                };
            };
        };
    };
}>;

// 分类类型
export type Category = Prisma.CategoryGetPayload<{
    include: {
        _count: {
            select: {
                articles: true;
            };
        };
    };
}>;

// 分页结果类型
export type PaginatedResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
};

// API 响应类型
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
};

// 用户角色类型
export type UserRole = 'user' | 'admin' | 'editor';

// JWT 载荷类型
export type JwtPayload = {
    userId: string;
    email: string;
    username: string;
    roles: UserRole[];
};

// 文章创建/更新输入类型
export type ArticleInput = {
    title: string;
    content: string;
    summary?: string;
    featuredImage?: string;
    categoryId?: string;
    tags?: string[];
    published?: boolean;
};

// 用户创建/更新输入类型
export type UserInput = {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    avatar?: string;
    bio?: string;
};

// 评论创建输入类型
export type CommentInput = {
    content: string;
    articleId: string;
    parentId?: string;
}; 