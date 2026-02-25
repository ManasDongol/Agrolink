import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormsModule,Validators ,ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileRequestDto } from '../../core/Dtos/ProfileRequestDto';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ActivatedRoute } from '@angular/router';

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
    private fb: FormBuilder,
    private route: ActivatedRoute
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
          
        });


        // Set image previews if images exist
      
          this.profileImagePreview = profileData.profilePicture;
        
       
          this.backgroundImagePreview = profileData.profileBackground;
        
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

      
      if (this.profileImageFile.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
  
      
      this.convertToBase64(this.profileImageFile, (base64: string) => {
        this.profileImagePreview = base64;
        
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
     const id = this.route.snapshot.paramMap.get('id')
    if (!id) {
    
      console.error('No token found in localStorage');
      return null;
    }
    return id;
  
  }

 updateProfile(event?: Event): void {
  if (event) {
    event.preventDefault();
  }

  if (this.profileForm.invalid) {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
    return;
  }

  const userId = this.getUserIdFromToken();
  if (!userId) {
    alert('Please login');
    return;
  }

  const formData = new FormData();

  formData.append('UserID', userId);
  formData.append('FirstName', this.profileForm.value.firstname);
  formData.append('LastName', this.profileForm.value.lastname);
  formData.append('Role', this.profileForm.value.role);
  formData.append('Address', this.profileForm.value.address || '');
  formData.append('PhoneNumber', this.profileForm.value.phone || '');
  formData.append('Achievement', this.profileForm.value.achievements || '');
  formData.append('Description', this.profileForm.value.description || '');
  

  // Only append files if user selected new ones
  if (this.profileImageFile) {
    formData.append('ProfileImage', this.profileImageFile);
  }

  if (this.backgroundImageFile) {
    formData.append('BackgroundImage', this.backgroundImageFile);
  }

  this.profile.UpdateProfile(formData).subscribe({
    next: () => {
      this.router.navigate(['/userProfile']);
    },
    error: err => {
      console.error(err);
      alert('Failed to update profile');
    }
  });
}
}
