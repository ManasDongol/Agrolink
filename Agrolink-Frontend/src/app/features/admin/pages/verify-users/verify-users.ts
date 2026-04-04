import { Component, OnInit } from '@angular/core';
import { AdminService, UnverifiedUser } from '../../../../core/Services/Admin/admin.service';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-verify-users',
  standalone: false,
  templateUrl: './verify-users.html',
  styleUrl: './verify-users.css',
})
export class VerifyUsers implements OnInit {
  users: UnverifiedUser[] = [];
  loading = true;
  error?: string;
  apiUrl = environment.apiUrl;

  showVerifyConfirm = false;
  showRejectConfirm = false;
  pendingUserId: string | null = null;
  isProcessing = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUnverifiedUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load pending verifications.';
        this.loading = false;
      },
    });
  }

  openVerifyConfirm(id: string) {
    this.pendingUserId = id;
    this.showVerifyConfirm = true;
  }

  openRejectConfirm(id: string) {
    this.pendingUserId = id;
    this.showRejectConfirm = true;
  }

  cancelAction() {
    this.pendingUserId = null;
    this.showVerifyConfirm = false;
    this.showRejectConfirm = false;
  }

  confirmVerify() {
    if (!this.pendingUserId) return;
    this.isProcessing = true;
    this.adminService.verifyUser(this.pendingUserId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.userId !== this.pendingUserId);
        this.cancelAction();
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
      },
    });
  }

  confirmReject() {
    if (!this.pendingUserId) return;
    this.isProcessing = true;
    this.adminService.rejectUser(this.pendingUserId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.userId !== this.pendingUserId);
        this.cancelAction();
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
      },
    });
  }

  getProfileImage(url?: string): string {
    if (!url) return 'assets/default-avatar.png';
    return this.apiUrl + url;
  }

  getProofUrl(proof: string): string {
    return this.apiUrl + proof;
  }
}
