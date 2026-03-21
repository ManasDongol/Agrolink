import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReturnComment } from './comment.models';

export interface CommentCreateDto {
  postId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface Comment {
  commentId: string;
  postId: string;
  content: string;
  parentCommentId?: string | null;
  created: string;
  author: {
    userId: string;
    username: string;
  };
  replies?: Comment[]; // nested replies
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'http://localhost:5131/api/comment'; // replace with your API URL

  constructor(private http: HttpClient) {}

  // Add a comment or reply
  addComment(dto: CommentCreateDto): Observable<Comment> {
  return this.http.post<Comment>(this.baseUrl, dto);
}

  // Get all comments for a post
  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${postId}`);
  }

  // Delete a comment
  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${commentId}`);
  }
}