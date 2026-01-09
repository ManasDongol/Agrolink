import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormsModule,Validators ,ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-profile',
  standalone:true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{

  profileForm!: FormGroup;

  ngOnInit(): void {
    
  }
}
