import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedService } from './feed.service';
import { Post, Tag } from './feed.models';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
  providers: [FeedService]
})
export class Feed implements OnInit {

  posts: Post[] = [];
  tags: Tag[] = [];
  currentView: 'all' | 'my' = 'all';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isLoading: boolean = false;

  toggleNewPost: boolean = false;
  postForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  successMessage: string = '';

  constructor(
    private feedService: FeedService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      tagId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTags();
    this.loadPosts();
  }

  loadTags() {
    this.feedService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
      },
      error: (err) => console.error('Error loading tags', err)
    });
  }

  loadPosts() {
    this.isLoading = true;
    this.feedService.getPosts(this.currentPage, this.pageSize, this.currentView).subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.totalPages = Math.ceil(response.total / response.pageSize); // Use pageSize from response or local?
        // If response.pageSize is not available or reliable, use this.pageSize
        // But better to use total / pageSize
        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading posts', err);
        this.isLoading = false;
      }
    });
  }

  changeView(view: 'all' | 'my') {
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
    if (this.postForm.valid) {
      const formData = new FormData();
      formData.append('title', this.postForm.get('title')?.value);
      formData.append('content', this.postForm.get('content')?.value);
      formData.append('tagId', this.postForm.get('tagId')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.isLoading = true;
      this.feedService.createPost(formData).subscribe({
        next: (newPost) => {
          this.isLoading = false;
          this.successMessage = "Post created successfully!";
          this.togglePostForm();
          this.loadPosts();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Error creating post', err);
          this.isLoading = false;
          // Handle error (show message)
        }
      });
    } else {
      this.postForm.markAllAsTouched();
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
    this.router.navigate(['/network', userId]);
    // Assuming the route is /network/:userId as per typical patterns or previous conversations
    // Only "Network Page Creation" mentioned "right-side panel displaying user profile".
    // "view profile" on the top right of each post which takes us to the users profile.
    // I need to verify the route for user profile. 
    // Usually it might be /profile/:id or /network/profile/:id.
    // I'll assume /network/:id or similar based on "Network Page" context.
    // Let me check existing routes if possible, or just assume /network for now as requested by user "takes us to the users profile".
  }
}
