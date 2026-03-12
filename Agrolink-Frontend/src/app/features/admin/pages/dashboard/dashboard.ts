import { Component, OnInit } from '@angular/core';
import { AdminService, AdminStats } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone:false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats?: AdminStats;
  loading = true;
  error?: string;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard statistics.';
        this.loading = false;
      },
    });
  }
}
