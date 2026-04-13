import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Auth } from "../../core/Services/Auth/auth";
import { SignupRequestDto } from '../../core/Dtos/SignupRequestDto';
import { FormGroup, FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Spinner } from '../../shared/spinner/spinner';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule,Spinner],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {

  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isloading = false;
   private toast = inject(ToastService);
  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      Username: ['', [Validators.required, Validators.minLength(8)]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
      SecondPassword: ['', [Validators.required, Validators.minLength(8)]],
      UserType: ['user']
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ERROR MESSAGES

  getUsernameError(): string {
    const ctrl = this.signupForm.get('Username');
    if (!ctrl?.touched) return '';
    if (ctrl?.hasError('required')) return 'Username is required';
    if (ctrl?.hasError('minlength')) return 'Username must be at least 8 characters';
    return '';
  }

  getEmailError(): string {
    const ctrl = this.signupForm.get('Email');
    if (!ctrl?.touched) return '';
    if (ctrl?.hasError('required')) return 'Email is required';
    if (ctrl?.hasError('email')) return 'Please enter a valid email address';
    return '';
  }

  getPasswordError(): string {
    const ctrl = this.signupForm.get('Password');
    if (!ctrl?.touched) return '';
    if (ctrl?.hasError('required')) return 'Password is required';
    if (ctrl?.hasError('minlength')) return 'Password must be at least 8 characters';
    return '';
  }

  getConfirmPasswordError(): string {
    const ctrl = this.signupForm.get('SecondPassword');
    if (!ctrl?.touched) return '';
    if (ctrl?.hasError('required')) return 'Please confirm your password';
    if (ctrl?.hasError('minlength')) return 'Must be at least 8 characters';
    if (this.signupForm.get('Password')?.value !== ctrl?.value) return 'Passwords do not match';
    return '';
  }

 

  // REGISTER METHOD
  register(): void {
    if (this.signupForm.invalid) return;

    const dto = new SignupRequestDto();
    dto.Username = this.signupForm.value.Username;
    dto.Email = this.signupForm.value.Email;
    dto.Password = this.signupForm.value.Password;
    dto.UserType = 'user';
   
this.isloading=true;
    this.auth.signup(dto).subscribe({
      next: res => {
        const currentUserID = res.userid;
        this.toast.info("User details saved!","");
        this.isloading = false;
        this.router.navigate(['/buildProfile', currentUserID]);
      },
      error: err => {
        console.error(err);
        this.isloading=false;
              const message =
          err?.error?.message || "Email already exists!. Please try again.";

        this.toast.error(message, "");
        
      }
    });
  }
}