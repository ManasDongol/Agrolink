import { Component, OnInit } from '@angular/core'; 
import { RouterLink } from "@angular/router"; 
import { Auth} from "../../core/Services/Auth/auth"; 
import { SignupRequestDto } from '../../core/Dtos/SignupRequestDto'; 
import { FormGroup,FormBuilder, FormsModule,Validators ,ReactiveFormsModule } from '@angular/forms'; import { CommonModule } from '@angular/common'; import { Router } from '@angular/router';

@Component({
  selector: 'app-signup', 
  imports: [FormsModule, RouterLink,ReactiveFormsModule,CommonModule], 
  templateUrl: './signup.html', 
  styleUrl: './signup.css',
})
export class Signup implements OnInit {

  signupForm!: FormGroup;

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
    if (ctrl?.hasError('email')) return 'Email is invalid';
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
    if (ctrl?.hasError('required')) return 'Confirm Password is required';
    if (ctrl?.hasError('minlength')) return 'Confirm Password must be at least 8 characters';
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