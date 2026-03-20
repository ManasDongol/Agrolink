import { Component, Input } from '@angular/core';
import { Post, Comment } from '../feed.models';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class CommentsComponent {

  @Input() post!: Post;

  openReplies(comment: Comment) {
    comment.showReplies = !comment.showReplies;
  }

  // Optional: function to post a new comment
  postComment(newCommentText: string) {
    // call your API here
    /*
    this.post.comments.push({
      commentId:
      user: 'CurrentUser',
      text: newCommentText,
      replies: [],
      showReplies: false
    });*/
  }
}