import { Component, OnInit } from '@angular/core';
import { AdminService,AdminPost } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-manage-posts',
  standalone:false,
  templateUrl: './manage-posts.html',
  styleUrl: './manage-posts.css',
})
export class ManagePosts implements OnInit {
  posts: AdminPost[] = [];
  loading = true;
  error?: string;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
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
}
