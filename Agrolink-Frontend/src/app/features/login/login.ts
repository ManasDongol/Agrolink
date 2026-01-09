import { Component,OnInit  } from '@angular/core';
import { FormGroup,FormBuilder, FormsModule,Validators ,ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { LoginRequestDto } from '../../core/Dtos/LoginRequestDto';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [FormsModule, RouterLink,ReactiveFormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth, private router : Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onlogin(){
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    let dto = new LoginRequestDto();
    dto.username = this.loginForm.value.username!;
    dto.password = this.loginForm.value.password!;
    //dto.username=this.Username;
    //dto.password=this.Password;
    dto.token = "";

    this.auth.login(dto).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/feed'])
        
        
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
