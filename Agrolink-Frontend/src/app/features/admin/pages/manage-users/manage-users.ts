import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-manage-users',
  standalone: false,
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css',
})
export class ManageUsers implements OnInit {
  users: AdminUser[] = [];
  loading = true;
  error?: string;

  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;
  isDeleting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load users.';
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
    this.adminService.deleteUser(this.pendingDeleteId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.pendingDeleteId);
        this.cancelDelete();
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }
}
