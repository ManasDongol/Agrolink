import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileRequestDto } from '../../core/Dtos/ProfileRequestDto';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  profileForm!: FormGroup;
  profileImagePreview: string | null = null;
  backgroundImagePreview: string | null = null;
  profileImageFile: File | null = null;
  backgroundImageFile: File | null = null;

  constructor(
    private profile: ProfileService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

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

    this.loadExistingProfile();
  }

  private loadExistingProfile(): void {
    const userId = this.getUserIdFromToken();
    if (!userId) return;

    this.profile.GetProfileByUserId(userId).subscribe({
      next: (profileData) => {
        this.profileForm.patchValue({
          firstname: profileData.firstName || '',
          lastname: profileData.lastName || '',
          role: profileData.role || '',
          address: profileData.address || '',
          phone: profileData.phoneNumber || '',
          description: profileData.description || '',
          achievements: profileData.achievement || '',
        });

        this.profileImagePreview = profileData.profilePicture;
        this.backgroundImagePreview = profileData.profileBackground;
      },
      error: () => {
        console.log('No existing profile found, creating new one');
      }
    });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return; }
      this.profileImageFile = file;
      this.convertToBase64(file, (base64) => { this.profileImagePreview = base64; });
    }
  }

  onBackgroundImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return; }
      this.backgroundImageFile = file;
      this.convertToBase64(file, (base64) => { this.backgroundImagePreview = base64; });
    }
  }

  private convertToBase64(file: File, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.onloadend = () => { callback(reader.result as string); };
    reader.onerror = () => { alert('Error reading file'); };
    reader.readAsDataURL(file);
  }

  private getUserIdFromToken(): string | null {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { console.error('No user ID found in route'); return null; }
    return id;
  }

  updateProfile(event?: Event): void {
    if (event) event.preventDefault();

    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    const userId = this.getUserIdFromToken();
    if (!userId) { alert('Please login'); return; }

    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('FirstName', this.profileForm.value.firstname);
    formData.append('LastName', this.profileForm.value.lastname);
    formData.append('Role', this.profileForm.value.role);
    formData.append('Address', this.profileForm.value.address || '');
    formData.append('PhoneNumber', this.profileForm.value.phone || '');
    formData.append('Achievement', this.profileForm.value.achievements || '');
    formData.append('Description', this.profileForm.value.description || '');
    if (this.profileImageFile) formData.append('ProfileImage', this.profileImageFile);
    if (this.backgroundImageFile) formData.append('BackgroundImage', this.backgroundImageFile);

    this.profile.UpdateProfile(formData).subscribe({
      next: () => { this.router.navigate(['/userProfile']); },
      error: (err) => { console.error(err); alert('Failed to update profile'); }
    });
  }
}