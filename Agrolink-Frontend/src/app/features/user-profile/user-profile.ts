import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { Auth } from '../../core/Services/Auth/auth';
import { Observable,map } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  profile: ProfileResponseDto | null = null;
  loading: boolean = true;
  error: string | null = null;
  showEditForm: boolean = false;
  connections: number = 12; // Static for now
  userid:string = "";

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private getUserIdFromToken(): Observable<string> {
  return this.auth.checkAuth().pipe(
    map(user => user.id)
  );
}

/*
  private getUserIdFromToken(): string | null {
    
    
    const token = this.auth.checkAuth().subscribe({
      next:(user)=>{
        this.userid = user.id;
        console.log("the token is "+this.userid);
        return this.userid;
        
      },
      error:(err)=>{
        return "error";
      }
      
    }
    );
     if (!token) {
      return null;
    }
    
    return toen;*/
   /* try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
        || payload['nameid'] 
        || payload['NameIdentifier']
        || payload['sub']
        || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }*/

  loadProfile(): void {
    this.loading = true;
    this.error = null;

   //let userId = this.getUserIdFromToken();

   this.getUserIdFromToken().subscribe(id => {
      console.log("User ID:", id);
       if (!id) {
      this.error = 'Please login to view your profile';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.profileService.GetProfileByUserId(id).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. You may need to create your profile first.';
        this.loading = false;
      }
    });
});
   
   
  }

  openEditForm(): void {
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
  }

  onProfileUpdated(): void {
    this.closeEditForm();
    this.loadProfile(); // Reload profile data
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/buildProfile']);
  }
}
