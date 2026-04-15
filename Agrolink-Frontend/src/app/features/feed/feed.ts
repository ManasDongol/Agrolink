import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from "@angular/router";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedService } from './feed.service';
import { Post, CommentCreateDto, Comment } from './feed.models';
import { environment } from '../../../environments/environments';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../core/Services/Auth/auth';
import {CommentService} from './Comments/comment.service';
import { inject } from '@angular/core';

import { ToastService } from '../../shared/toast/toast.service';


@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule,FormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
  providers: [FeedService]
})
export class Feed implements OnInit {

  posts: Post[] = [];
  private toast = inject(ToastService)
 currentView: 'all' | 'my' | 'bookmarks' = 'all';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isLoading: boolean = false;
  deletepost:boolean = false;
  editingPost:Post | null = null;;

  toggleNewPost: boolean = false;
  editpost:boolean = false;
  postForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  successMessage: string = '';
  currentUser: { id: string; username: string; profileImage?: string } | null = null;


  myuserId:string="";
  currentpostId: string ="";

  newCommentContent: string = '';

  commentsForm: { [postId: string]: FormGroup } = {};

  apiurl: string = environment.apiUrl;

  replyContents: { [commentId: string]: string } = {};

  constructor(
    private feedService: FeedService,
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth,
    private commentService: CommentService
    
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      postcategory: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPosts();
    this.auth.checkAuth().subscribe({
      next:(res)=>{
        this.myuserId=res.id
         this.currentUser = res; 
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  loadPosts() {
    this.isLoading = true;

    this.feedService.getPosts(this.currentPage, this.pageSize, this.currentView).subscribe({
      next: (response) => {
        // Map API posts to Post class instances
        const mappedPosts = response.posts.map((p: Post)=> new Post(p));

        if (this.currentPage === 1) {
          this.posts = mappedPosts;
          console.log(this.posts[0])
        } else {
          this.posts = [...this.posts, ...mappedPosts];
        }

        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading posts', err);
        this.isLoading = false;
      }
    });
  }

 editPost(post: Post) {
  this.editingPost = post;       // store which post we are editing
  this.toggleNewPost = true;     // open the modal
  this.postForm.patchValue({
    title: post.title,
    content: post.content,
    postcategory: post.postCategory
  });

  this.imagePreview = post.imagePath ? this.apiurl + post.imagePath : null;
  this.selectedFile = null; // clear any new selected file
}

  deletePostForm(postId:string){
this.currentpostId=postId;
      this.deletepost=!this.deletepost;
  }
  deletePost(){
  console.log(this.currentpostId);
   if(this.currentpostId!=null){
    this.feedService.deletePost(this.currentpostId).subscribe({
      next:(res)=>{
         this.deletepost=!this.deletepost;
         this.posts = this.posts.filter(p => p.postId !== this.currentpostId);
         this.toast.success("Post was deleted successfully", "")
        this.currentpostId="";
        

      },
      error:()=>{
        this.toast.error("unable to delete post, try again later", "")
      }
      
    })
   }

  }

  changeView(view: 'all' | 'my'|'bookmarks') {
    if (this.currentView !== view) {
      this.currentView = view;
      this.currentPage = 1;
      this.loadPosts();
    }
  }

  togglePostForm() {
    this.toggleNewPost = !this.toggleNewPost;
    if (!this.toggleNewPost) {
      this.resetForm();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

 submitPost() {
  if (!this.postForm.valid) {
    this.postForm.markAllAsTouched();
    return;
  }

  const formData = new FormData();
  formData.append('title', this.postForm.get('title')?.value);
  formData.append('content', this.postForm.get('content')?.value);
  formData.append('category', this.postForm.get('postcategory')?.value);

  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  
  this.isLoading = true;

  if (this.editingPost) {
    // Update existing post
    this.feedService.updatePost(this.editingPost.postId, formData).subscribe({
      next: (updatedPost) => {
        this.isLoading = false;
        this.successMessage = "Post updated successfully!";
        this.toggleNewPost = false;
        this.editingPost = null;

        this.toast.success("Post updated successfully","")
       
        this.loadPosts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
            this.toast.error("update failed please try again!","")
        console.error('Error updating post', err);
        this.isLoading = false;
      }
    });
  } else {
    // Create new post
    this.feedService.createPost(formData).subscribe({
      next: (newPost) => {
        this.isLoading = false;
        this.successMessage = "Post created successfully!";
        this.toggleNewPost = false;
         this.resetForm();
        const createdPost = new Post(newPost);
this.posts = [createdPost, ...this.posts];

this.loadPosts();

        setTimeout(() => this.successMessage = '', 3000);
        
      },
      error: (err) => {
           this.toast.error("failed to create post","")
        this.isLoading = false;
      }
    });
  }
}

  resetForm() {
  this.postForm.reset({
    title: '',
    content: '',
    postcategory: ''
  });

  this.selectedFile = null;
  this.imagePreview = null;
  this.editingPost = null;
}

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPosts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPosts();
    }
  }

  viewUserProfile(userId: string) {
    this.router.navigate(['/userProfile', userId]);
  }

  openComments(post: Post) {
  post.toggleComments();
  if (post.commentsOpen && post.comments.length === 0) {
    this.commentService.getComments(post.postId).subscribe((res) => {
      post.comments = res.map(c => {
        const comment = new Comment(c as Partial<Comment>);
        // ← map nested replies from the API response
        if (c.replies && c.replies.length > 0) {
          comment.replies = c.replies.map(r => new Comment(r as Partial<Comment>));
          comment.showReplies = true;  // auto-show on load
        }
        return comment;
      });
    });
  }
}


  getProfileImage(path?: string): string {
  if (!path) return 'assets/default-avatar.png';

  return this.apiurl + path;
}
Addcomments(post: Post, content: string) {
  if (!content.trim()) return;

  const dto: CommentCreateDto = {
    postId: post.postId,
    content: content
  };

  // optimistic UI
const tempComment = new Comment({
  content,
  postId: post.postId,
  author: {
    userId: this.currentUser?.id ?? '',
    username: this.currentUser?.username ?? 'You',
    profilePictureUrl: this.currentUser!.profileImage! 
  }
});

  post.comments.push(tempComment);
  post.commentsCount++;

  this.commentService.addComment(dto).subscribe({
    next: (res) => {
      // replace temp with real comment
      const index = post.comments.indexOf(tempComment);
      if (index !== -1) {
        post.comments[index] = new Comment(res as Partial<Comment>);
      }
    },

    error: (err: HttpErrorResponse) => {
      // rollback
      post.comments = post.comments.filter(c => c !== tempComment);
      post.commentsCount--;

      if (err.status === 404) {
        this.removePost(post.postId);
        this.toast.info("Post was deleted", "");
        return;
      }

      this.toast.error("Failed to add comment", "");
    }
  });
}

toggleLike(post: Post) {
  const prevLiked = post.isLiked;
  const prevCount = post.likesCount;

  post.toggleLike(); // optimistic UI

  this.feedService.toggleLike(post.postId).subscribe({
    next: () => {
      // SUCCESS → show optional toast
      this.toast.success("likes Updated", "");
    },

    error: (err: HttpErrorResponse) => {
      console.error("Like failed", err);

      // rollback
      post.isLiked = prevLiked;
      post.likesCount = prevCount;

      if (err.status === 404) {
        this.removePost(post.postId);
        this.toast.info("Post was deleted by the user", "");
        return;
      }

      this.toast.error("Failed to update like", "");
    }
  });
}

toggleBookmark(post: Post) {
  const prev = post.isBookmarked;

  post.toggleBookmark();

  this.feedService.toggleBookmark(post.postId).subscribe({
    next: () => {
      this.toast.success("Bookmark updated", "");
    },

    error: (err: HttpErrorResponse) => {
      console.error(err);

      post.isBookmarked = prev;

      if (err.status === 404) {
        this.removePost(post.postId);
        this.toast.info("Post removed by the user", "");
        return;
      }

      this.toast.error("Bookmark failed", "");
    }
  });
}
removePost(postId: string) {
  this.posts = this.posts.filter(p => p.postId !== postId);
}

replyTo(comment: Comment, parentComment?: Comment) {
  if (parentComment) {
    
    parentComment.showReplyInput = !parentComment.showReplyInput;
   
    this.replyContents[parentComment.commentId] = `@${comment.author.username} `;
  } else {
    // Replying to a top-level comment
    comment.showReplyInput = !comment.showReplyInput;
    if (comment.showReplyInput && comment.replies.length === 0) {
      this.commentService.getReplies(comment.commentId).subscribe(replies => {
        comment.replies = replies.map(r => new Comment(r as Partial<Comment>));
        comment.showReplies = true;
      });
    }
  }
}

addReply(comment: Comment, content: string) {
  if (!content?.trim()) return;

  const dto: CommentCreateDto = {
    postId: comment.postId,
    content: content.trim(),
    parentCommentId: comment.commentId // always the top-level comment id
  };

  this.commentService.addReply(dto).subscribe(newReply => {
    const reply = new Comment(newReply as Partial<Comment>);
    comment.replies.push(reply);
    comment.showReplies = true;
    comment.showReplyInput = false;
    this.replyContents[comment.commentId] = '';
  });
}


deleteComment(comment: Comment) {
  this.commentService.deleteComment(comment.commentId).subscribe({
    next: () => {
      const post = this.posts.find(p => p.postId === comment.postId);
      if (!post) return;

      // CASE 1: Top-level comment
      const isTopLevel = post.comments.some(c => c.commentId === comment.commentId);

      if (isTopLevel) {
        post.comments = post.comments.filter(c => c.commentId !== comment.commentId);
        post.commentsCount--;
      } 
      
      // CASE 2: Reply
      else {
        post.comments.forEach(parent => {
          const before = parent.replies.length;

          parent.replies = parent.replies.filter(r => r.commentId !== comment.commentId);

          if (parent.replies.length < before) {
            //  reply removed → trigger UI update
            parent.replies = [...parent.replies];
          }
        });
      }

      this.toast.success("Comment deleted", "");
    },

    error: (err: HttpErrorResponse) => {
      if (err.status === 404) {
        this.toast.info("Comment already removed", "");
        return;
      }

      this.toast.error("Failed to delete comment", "");
    }
  });
}
}