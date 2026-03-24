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

  isLoading: boolean= false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private ToastService : ToastService
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

  onlogin() {
    this.isLoading = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
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

        // After successful login, check the current user's type
        this.auth.checkAuth().subscribe({
          next: user => {
            if (user.userType === 'Admin' || user.userType === 'SuperAdmin') {
                this.ToastService.success('login successful!','welcome to agrolink!');
              this.router.navigate(['/admin']);
            } else {
                this.ToastService.success('login successful!','welcome to agrolink!');
              this.router.navigate(['/feed']);
            }
          },
          error: () => {
            // Fallback to normal user feed if role cannot be determined
          
            this.router.navigate(['/feed']);
          }
        });
      },
      error: err => {
         this.isLoading =false;
        this.ToastService.error('login failed!','password or username doesnt match!');
        this.clearTextfields();
        console.error(err);
      },
    });
  }
}
