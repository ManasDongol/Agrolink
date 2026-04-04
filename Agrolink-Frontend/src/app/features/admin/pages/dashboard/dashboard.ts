import { Component, OnInit } from '@angular/core';
import { AdminService, AdminStats, AdminPostFull } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats?: AdminStats;
  recentPosts: AdminPostFull[] = [];
  loading = true;
  postsLoading = true;
  error?: string;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentPosts();
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load statistics.';
        this.loading = false;
      },
    });
  }

  loadRecentPosts() {
    this.adminService.getPosts().subscribe({
      next: (posts) => {
        this.recentPosts = posts.slice(0, 6);
        this.postsLoading = false;
      },
      error: () => {
        this.postsLoading = false;
      },
    });
  }

  getPostRatio(): number {
    if (!this.stats?.totalUsers || this.stats.totalUsers === 0) return 0;
    return Math.round((this.stats.totalPosts / this.stats.totalUsers) * 10) / 10;
  }
}
