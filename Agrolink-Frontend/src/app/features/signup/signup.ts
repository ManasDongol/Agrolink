import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Auth } from "../../core/Services/Auth/auth";
import { SignupRequestDto } from '../../core/Dtos/SignupRequestDto';
import { FormGroup, FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {

  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  proofFile: File | null = null;
  proofFileError = '';

  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.validateAndSetFile(file);
  }

  private validateAndSetFile(file: File): void {
    this.proofFileError = '';
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.proofFileError = 'Only PDF, JPG, or PNG files are allowed.';
      return;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.proofFileError = 'File size must not exceed 5MB.';
      return;
    }
    this.proofFile = file;
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.proofFile = null;
    this.proofFileError = '';
  }

  // REGISTER METHOD
  register(): void {
    if (this.signupForm.invalid) return;

    const dto = new SignupRequestDto();
    dto.Username = this.signupForm.value.Username;
    dto.Email = this.signupForm.value.Email;
    dto.Password = this.signupForm.value.Password;
    dto.UserType = 'user';
    if (this.proofFile) {
      //dto.ProofOfExpertise = this.proofFile;
    }

    this.auth.signup(dto).subscribe({
      next: res => {
        const currentUserID = res.userid;
        this.router.navigate(['/buildProfile', currentUserID]);
      },
      error: err => {
        console.error(err);
        this.router.navigate(['/']);
      }
    });
  }
}