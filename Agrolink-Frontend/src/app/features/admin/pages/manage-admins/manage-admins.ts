import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-manage-admins',
  standalone:false,
  templateUrl: './manage-admins.html',
  styleUrl: './manage-admins.css',
})
export class ManageAdmins implements OnInit {
  admins: AdminUser[] = [];
  loading = true;
  error?: string;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins() {
    this.adminService.getAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load admins.';
        this.loading = false;
      },
    });
  }

  removeAdmin(id: string) {
    if (!confirm('Remove this admin?')) {
      return;
    }
    this.adminService.deleteAdmin(id).subscribe({
      next: () => this.loadAdmins(),
    });
  }
}
