import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { ToastService } from '../../shared/toast/toast.service';
import { Spinner } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Spinner],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {

  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  newPasswordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;

  isLoading: boolean = false;
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.toastService.error('Invalid Link', 'This reset link is invalid or has expired.');
      this.router.navigate(['/login']);
    }
  }

  get passwordMismatch(): boolean {
    return this.confirmPasswordTouched &&
           this.newPassword !== this.confirmPassword;
  }

  get newPasswordError(): string {
    if (!this.newPasswordTouched) return '';
    if (!this.newPassword) return 'Password is required';
    if (this.newPassword.length < 8) return 'Password must be at least 8 characters';
    return '';
  }

  get confirmPasswordError(): string {
    if (!this.confirmPasswordTouched) return '';
    if (!this.confirmPassword) return 'Please confirm your password';
    if (this.newPassword !== this.confirmPassword) return 'Passwords do not match';
    return '';
  }

  get isFormValid(): boolean {
    return this.newPassword.length >= 8 &&
           this.newPassword === this.confirmPassword;
  }

  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    this.newPasswordTouched = true;
    this.confirmPasswordTouched = true;
    if (!this.isFormValid) return;

    this.isLoading = true;
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(
          'Reset Failed',
          err.error?.message || 'This link is invalid or has expired.'
        );
      }
    });
  }
}