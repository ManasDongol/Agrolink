import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormsModule,Validators ,ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileRequestDto } from '../../core/Dtos/ProfileRequestDto';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { ProfileService } from '../../core/Services/ProfileService/profileService';

@Component({
  selector: 'app-profile',
  standalone:true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{
  constructor(
    private profile : ProfileService,
    private router: Router,
    private fb: FormBuilder
  ){}

  profileForm!: FormGroup;
  profileImagePreview: string | null = null;
  backgroundImagePreview: string | null = null;
  profileImageFile: File | null = null;
  backgroundImageFile: File | null = null;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      role: ['', Validators.required],
      address: [''],
      phone: [''],
      description: [''],
      achievements: [''],
      profileimage: [''], // Will store base64 string
      profilebackgroundimage: [''] // Will store base64 string
    });
    
    // Load existing profile if editing
    this.loadExistingProfile();
  }

  private loadExistingProfile(): void {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return;
    }

    this.profile.GetProfileByUserId(userId).subscribe({
      next: (profileData) => {
        // Populate form with existing profile data
        this.profileForm.patchValue({
          firstname: profileData.firstName || '',
          lastname: profileData.lastName || '',
          role: profileData.role || '',
          address: profileData.address || '',
          phone: profileData.phoneNumber || '',
          description: profileData.description || '',
          achievements: profileData.achievement || '',
          profileimage: profileData.profilePicture || '',
          profilebackgroundimage: profileData.profileBackground || ''
        });

        // Set image previews if images exist
        if (profileData.profilePicture) {
          this.profileImagePreview = profileData.profilePicture;
        }
        if (profileData.profileBackground) {
          this.backgroundImagePreview = profileData.profileBackground;
        }
      },
      error: (err) => {
        // Profile doesn't exist yet, that's fine - user is creating new profile
        console.log('No existing profile found, creating new one');
      }
    });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.profileImageFile = input.files[0];
      
     
      if (!this.profileImageFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (this.profileImageFile.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      this.convertToBase64(this.profileImageFile, (base64: string) => {
        this.profileImagePreview = base64;
        this.profileForm.patchValue({
          profileimage: base64
        });
      });
    }
  }

  onBackgroundImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.backgroundImageFile = input.files[0];
      
  
      if (!this.backgroundImageFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (this.backgroundImageFile.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      this.convertToBase64(this.backgroundImageFile, (base64: string) => {
        this.backgroundImagePreview = base64;
        this.profileForm.patchValue({
          profilebackgroundimage: base64
        });
      });
    }
  }

  private convertToBase64(file: File, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      callback(base64String);
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsDataURL(file);
  }

  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
    
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token payload:', payload);
      
      // Try different possible claim names
      const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
        || payload['nameid'] 
        || payload['NameIdentifier']
        || payload['sub']
        || null;
      
      console.log('Extracted UserID:', userId);
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  profilebuilder(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (this.profileForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    const userId = this.getUserIdFromToken();
    console.log('Extracted UserID from token:', userId);
    
    if (!userId) {
      alert('Please login to create a profile');
      this.router.navigate(['/login']);
      return;
    }

    let profileDto = new ProfileRequestDto();

    profileDto.UserID = userId;
    console.log('Profile DTO being sent:', profileDto);
    profileDto.FirstName = this.profileForm.value.firstname;
    profileDto.LastName = this.profileForm.value.lastname;
    profileDto.Role = this.profileForm.value.role;
    profileDto.Address = this.profileForm.value.address || '';
    profileDto.PhoneNumber = this.profileForm.value.phone || '';
    profileDto.Achievement = this.profileForm.value.achievements || '';
    profileDto.ProfilePicture = this.profileForm.value.profileimage || '';
    profileDto.ProfileBackgroundPicture = this.profileForm.value.profilebackgroundimage || '';
    profileDto.Description = this.profileForm.value.description || '';

    this.profile.BuildProfile(profileDto).subscribe({
      next: res => {
        // Navigate to user profile page to see the updated profile
        this.router.navigate(['/userProfile']);
      },
      error: err => {
        console.error('Error building profile:', err);
        alert('Failed to save profile. Please try again.');
      }
    });
  }
}
