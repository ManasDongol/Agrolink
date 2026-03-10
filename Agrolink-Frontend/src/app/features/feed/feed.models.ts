

export interface Author {
    userId: string;
    username: string;
    profilePictureUrl?: string;
    role?: string;
}

export interface Post {
    postId: string;
    title: string;
    content: string;
    created: string; // Dates often come as strings from JSON
    imagePath?: string;
    author: Author;
    postcategory: string;
    isLiked: boolean;
    likesCount: number;
    commentsCount: number;
}

export interface PostResponse {
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
}
