import { Component, OnInit } from '@angular/core';
import { AdminService,AdminUser } from '../../../../core/Services/Admin/admin.service';

@Component({
  selector: 'app-manage-users',
  standalone:false,
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css',
})
export class ManageUsers implements OnInit {
  users: AdminUser[] = [];
  loading = true;
  error?: string;

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

  removeUser(id: string) {
    if (!confirm('Remove this user?')) {
      return;
    }
    this.adminService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
    });
  }
}
