export interface ReturnComment {
  commentId: string;         // maps to CommentID
  postId: string;
  content: string;           // maps to Comment
  parentCommentId?: string | null;
  created: string;           // ISO date string
  author: {
    userId: string;
    username: string;
    profilePicture?: string; // maps to ProfilePicture
  };
  replies?: Comment[];       // nested replies
}