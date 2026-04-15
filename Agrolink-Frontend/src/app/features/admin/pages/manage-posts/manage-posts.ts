import { Component, OnInit, inject } from '@angular/core';
import { AdminService, AdminPostFull } from '../../../../core/Services/Admin/admin.service';
import { environment } from '../../../../../environments/environments';
import { PostResponse } from '../../../feed/feed.models';
import { ToastService } from '../../../../shared/toast/toast.service';

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
   toast = inject(ToastService);

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
         this.toast.success("admins loaded successfully!","");
        
      },
      error: () => {
        this.error = 'Unable to load posts.';
         this.toast.error("admins could not be loaded, try again later!","");
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
         this.toast.success("post deleted successfully!","");
      },
      error: () => {
        this.isDeleting = false;
         this.toast.error("post could not be deleted,try again later!","");
      },
    });
  }

 getImage(url?: string): string {
  if (!url) return 'assets/default-avatar.png';

  return `${this.apiUrl}${url}`;
}
}
