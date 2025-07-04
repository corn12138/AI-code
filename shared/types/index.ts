// 全局共享类型
export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
}

export interface Article {
    id: string;
    title: string;
    content: string;
    author: User;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

// 认证相关
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// 分页
export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
} 