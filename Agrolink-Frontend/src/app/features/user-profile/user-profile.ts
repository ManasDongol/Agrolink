import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from "../../shared/navbar/navbar";
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { Auth } from '../../core/Services/Auth/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [Navbar, CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  profile: ProfileResponseDto | null = null;
  loading: boolean = true;
  error: string | null = null;
  showEditForm: boolean = false;
  connections: number = 12; // Static for now

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    try {
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
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    const userId = this.getUserIdFromToken();
    if (!userId) {
      this.error = 'Please login to view your profile';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.profileService.GetProfileByUserId(userId).subscribe({
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
