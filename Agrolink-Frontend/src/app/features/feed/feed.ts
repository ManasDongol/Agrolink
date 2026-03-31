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
    postcategory: post.postcategory
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
        this.currentpostId="";
        

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
  formData.append('postcategory', this.postForm.get('postcategory')?.value);

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
        this.loadPosts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
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
        this.loadPosts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error creating post', err);
        this.isLoading = false;
      }
    });
  }
}

  resetForm() {
    this.postForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
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

  this.commentService.addComment(dto).subscribe((res) => {
    const newComment = new Comment(res as Partial<Comment>); //  map to class

    post.comments.push(newComment);
    post.commentsCount++;

    this.newCommentContent = ''; // optional clear
  });
}

toggleLike(post: Post) {

  post.toggleLike();


  this.feedService.toggleLike(post.postId).subscribe({
    next: () => {
   
    },
    error: (err: HttpErrorResponse) => {
      console.error('Like failed', err);

      post.toggleLike();
    }
  });
}

  toggleBookmark(post: Post) {
    post.toggleBookmark();
  
    this.feedService.toggleBookmark(post.postId).subscribe({
      next: () => {
    
      },
      error: (err: HttpErrorResponse) => {
        console.error('bookmark failed', err);

        post.toggleBookmark();
      }
    });
  }

  replyTo(comment: Comment) {
  // Toggle the reply input for this specific comment
  comment.showReplyInput = !comment.showReplyInput;

  // Load replies if opening and not yet loaded
  if (comment.showReplyInput && comment.replies.length === 0) {
    this.commentService.getReplies(comment.commentId).subscribe(replies => {
      comment.replies = replies.map(r => new Comment(r as Partial<Comment>));
      comment.showReplies = true;
    });
  }
}

addReply(comment: Comment, content: string) {
  if (!content?.trim()) return;

  const dto: CommentCreateDto = {
    postId: comment.postId,
    content: content.trim(),
    parentCommentId: comment.commentId  // ← key difference from addComment
  };

  this.commentService.addReply(dto).subscribe(newReply => {
    comment.replies.push(new Comment(newReply as Partial<Comment>));
    comment.showReplies = true;
    this.replyContents[comment.commentId] = ''; // clear input
  });
}

deleteComment(comment: Comment) {
  this.commentService.deleteComment(comment.commentId).subscribe(() => {
    // Find which post owns this comment and remove it
    const post = this.posts.find(p => p.postId === comment.postId);
    if (post) {
      post.comments = post.comments.filter(c => c.commentId !== comment.commentId);
      post.commentsCount--;
    }
  });
}
}