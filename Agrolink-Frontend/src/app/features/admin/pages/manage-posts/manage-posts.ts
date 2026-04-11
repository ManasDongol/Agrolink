import { Component, OnInit } from '@angular/core';
import { AdminService, AdminPostFull } from '../../../../core/Services/Admin/admin.service';
import { environment } from '../../../../../environments/environments';
import { PostResponse } from '../../../feed/feed.models';

@Component({
  selector: 'app-manage-posts',
  standalone: false,
  templateUrl: './manage-posts.html',
  styleUrl: './manage-posts.css',
})
export class ManagePosts implements OnInit {
  posts: AdminPostFull[] = [];
 
  loading = true;
  error?: string;
  apiUrl = environment.apiUrl;



  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;
  isDeleting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.adminService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load posts.';
        this.loading = false;
      },
    });
  }

  openDeleteConfirm(id: string) {
    this.pendingDeleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.pendingDeleteId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (!this.pendingDeleteId) return;
    this.isDeleting = true;
    this.adminService.deletePost(this.pendingDeleteId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== this.pendingDeleteId);
        this.pendingDeleteId = null;
        this.showDeleteConfirm = false;
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }

 getImage(url?: string): string {
  if (!url) return 'assets/default-avatar.png';

  return `${this.apiUrl}${url}`;
}
}
