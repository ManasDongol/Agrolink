
import { ReturnComment } from "./Comments/comment.models";
export class Author {
  userId!: string;
  username!: string;
  profilePictureUrl?: string;
  role?: string;

  constructor(init?: Partial<Author>) {
    Object.assign(this, init);
  }
}
export class Comment {
  commentId!: string;
  postId!: string;
  content!: string;
  parentCommentId?: string | null;
  created!: string;

  author!: {
    userId: string;
    username: string;
    profilePictureUrl?: string;
  };

  showReplies: boolean = false;
  replies: Comment[] = [];

  constructor(init?: Partial<Comment>) {
    Object.assign(this, init);
    this.replies = init?.replies?.map(r => new Comment(r)) || [];
  }
}

export class Post {
  postId!: string;
  title!: string;
  content!: string;
  created!: string;
  imagePath?: string;
  author!: Author;
  postcategory!: string;

  isLiked: boolean = false;
  likesCount: number = 0;
  commentsCount: number = 0;
  isBookmarked: boolean = false;
  
  commentsOpen: boolean = false;

 comments: Comment[] = [];

constructor(init?: Partial<Post>) {
  Object.assign(this, init);
  this.comments = init?.comments?.map(c => new Comment(c)) || [];
}

  toggleComments() {
    this.commentsOpen = !this.commentsOpen;
  }

  toggleLike() {
    this.isLiked = !this.isLiked;
    this.likesCount = (this.likesCount || 0) + (this.isLiked ? 1 : -1);
  }

  toggleBookmark() {
    this.isBookmarked = !this.isBookmarked;
  }
}

export interface PostResponse {
  posts: Post[];   // Posts returned by API
  total: number;
  page: number;
  pageSize: number;
}
export interface CommentCreateDto{
  postId: string,
  content:string
}