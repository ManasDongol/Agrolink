import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-manage-admins',
  standalone: false,
  templateUrl: './manage-admins.html',
  styleUrl: './manage-admins.css',
})
export class ManageAdmins implements OnInit {
  admins: AdminUser[] = [];
  loading = true;
  error?: string;

  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;
  isDeleting = false;

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
    this.adminService.deleteAdmin(this.pendingDeleteId).subscribe({
      next: () => {
        this.admins = this.admins.filter(a => a.id !== this.pendingDeleteId);
        this.cancelDelete();
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }
}
