export interface Post {
    id: string;
    slug: string;
    title: string;
    date: string;
    author?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    readingTime?: number;
}

export interface Comment {
    id: string;
    name: string;
    email: string;
    content: string;
    postId: string;
    createdAt: string;
}
