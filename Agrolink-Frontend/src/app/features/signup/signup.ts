import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Auth} from "../../core/Services/Auth/auth";
import { SignupRequestDto } from '../../core/Dtos/SignupRequestDto';
import { FormGroup,FormBuilder, FormsModule,Validators ,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink,ReactiveFormsModule,CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit{

  signupForm !: FormGroup;
  ngOnInit(): void {
     this.signupForm = this.fb.group({
      Username: ['', [Validators.required, Validators.minLength(8)]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
      Email: ['', [Validators.required, Validators.minLength(8)]],
      SecondPassword:['', [Validators.required, Validators.minLength(8)]]
      
    });
  }
  Username :string = "";
  Email: string ="";
  Password:string = "";
  SecondPassword:string ="";

  constructor(private fb: FormBuilder,private auth: Auth, private router : Router){
  }
  register(){
      let dto = new SignupRequestDto();
      dto.Username = this.signupForm.value.Username;
      dto.Email = this.signupForm.value.Email;
      dto.Password = this.signupForm.value.Password

      this.auth.signup(dto).subscribe({
        next: res =>{
          console.log("no error")
          this.router.navigate(['/buildProfile']);
        }, 
        error: err=>{
          console.log(err);
          console.log(dto);
          this.router.navigate(['/']);
        }
      });
  }
  

  
  

}
