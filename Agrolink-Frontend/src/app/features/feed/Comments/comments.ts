import { Component, Input, OnInit } from '@angular/core';
import { CommentService, Comment, CommentCreateDto } from './comment.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class CommentsComponent implements OnInit {
  @Input() postId!: string;
  comments: Comment[] = [];
  newCommentContent: string = '';
  replyingTo: string | null = null; // parent comment ID for replies
  replyContents: { [key: string]: string } = {}; // store reply text per comment

  constructor(private commentService: CommentService) {}

  ngOnInit() {
    this.loadComments();
  }

  // Load comments from API
  loadComments() {
    this.commentService.getComments(this.postId).subscribe(comments => {
      this.comments = this.buildNestedComments(comments);
    });
  }

  // Build nested structure
  private buildNestedComments(comments: Comment[]): Comment[] {
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    // initialize map
    comments.forEach(c => map.set(c.commentId, { ...c, replies: [] }));

    map.forEach(c => {
      if (c.parentCommentId) {
        const parent = map.get(c.parentCommentId);
        if (parent) parent.replies!.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }

  // Post new comment
  addComment() {
    if (!this.newCommentContent.trim()) return;

    const dto: CommentCreateDto = {
      postId: this.postId,
      content: this.newCommentContent,
      parentCommentId: this.replyingTo
    };

    this.commentService.addComment(dto).subscribe(() => {
      this.newCommentContent = '';
      this.replyingTo = null;
      this.loadComments();
    });
  }

  // Start replying to a comment
  startReply(commentId: string) {
    this.replyingTo = commentId;
    this.replyContents[commentId] = '';
  }

  // Cancel reply
  cancelReply() {
    this.replyingTo = null;
  }

  // Post a reply to a comment
  addReply(parentCommentId: string) {
    const content = this.replyContents[parentCommentId]?.trim();
    if (!content) return;

    const dto: CommentCreateDto = {
      postId: this.postId,
      content,
      parentCommentId
    };

    this.commentService.addComment(dto).subscribe(() => {
      this.replyContents[parentCommentId] = '';
      this.replyingTo = null;
      this.loadComments();
    });
  }
}