import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { LoginRequestDto } from '../../core/Dtos/LoginRequestDto';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../shared/spinner/spinner';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, Spinner],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;

  isLoading: boolean = false;
  showForgotModal: boolean = false;
  showPassword: boolean = false;
  forgotEmail: string = '';
forgotEmailTouched: boolean = false;
isSendingReset: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private ToastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  clearTextfields() {
    this.loginForm.reset();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  openForgotModal() {
    console.log("opened");
    this.showForgotModal = true;
  }

  

 closeForgotModal() {
  this.showForgotModal = false;
  // reset state when closed
  this.forgotEmail = '';
  this.forgotEmailTouched = false;
  this.isSendingReset = false;
}

onForgotPassword() {
  this.forgotEmailTouched = true;
  if (!this.forgotEmail) return;

  this.isSendingReset = true;
 
  this.auth.forgotPassword(this.forgotEmail).subscribe({
    next: () => {
       this.ToastService.success('Reset link sent!', 'Check your email.');
       this.closeForgotModal();
     },
     error: () => {
       this.ToastService.error('Failed', 'Something went wrong.');
       this.isSendingReset = false;
     }
   });

  // remove this once service is wired:
  this.ToastService.success('Reset link sent!', 'Check your registered email for the reset link.');
  this.closeForgotModal();
}

  onlogin() {
    this.isLoading = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    const dto = new LoginRequestDto();
    dto.username = this.loginForm.value.username!;
    dto.password = this.loginForm.value.password!;
    dto.token = '';

    this.auth.login(dto).subscribe({
      next: _ => {
        this.auth.setAuthenticated(true);
        this.isLoading = false;

        this.auth.checkAuth().subscribe({
          next: user => {
            if (user.userType === 'Admin' || user.userType === 'SuperAdmin') {
              this.ToastService.success('Login successful!', 'Welcome to Agrolink!');
              this.router.navigate(['/admin']);
            } else {
              this.ToastService.success('Login successful!', 'Welcome to Agrolink!');
              this.router.navigate(['/feed']);
            }
          },
          error: () => {
            this.router.navigate(['/feed']);
          }
        });
      },
      error: err => {
        this.isLoading = false;
        this.ToastService.error('Login failed!', 'Password or username doesn\'t match!');
        this.clearTextfields();
        console.error(err);
      },
    });
  }

  
}