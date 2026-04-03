import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  profileForm!: FormGroup;

  // server paths (loaded from existing profile)
  profileImageServerPath: string | null = null;
  backgroundImageServerPath: string | null = null;
  proofFilePreview: string | null = null;

  // local base64 previews (set when user picks a new file)
  profileImageLocalPreview: string | null = null;
  backgroundImageLocalPreview: string | null = null;
  proofFileLocalPreview: string | null = null;

  // actual file objects to upload
  profileImageFile: File | null = null;
  backgroundImageFile: File | null = null;
  proofFile: File | null = null;
  proofFileError = '';

  apiurl: string = environment.apiUrl;

  readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

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
      isverified: ['']
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
          isverified: profileData.isverified || false
        });

        // store server paths separately
        this.profileImageServerPath = profileData.profilePicture;
        this.backgroundImageServerPath = profileData.profileBackground;
        this.proofFilePreview = profileData.proof;
      },
      error: () => {
        console.log('No existing profile found, creating new one');
      }
    });
  }

  // --- profile image ---
  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > this.MAX_FILE_SIZE) { alert('Image size should be less than 5MB'); return; }
      this.profileImageFile = file;
      this.convertToBase64(file, (base64) => {
        this.profileImageLocalPreview = base64; // local preview, no apiurl prefix needed
      });
    }
  }

  // --- background image ---
  onBackgroundImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > this.MAX_FILE_SIZE) { alert('Image size should be less than 5MB'); return; }
      this.backgroundImageFile = file;
      this.convertToBase64(file, (base64) => {
        this.backgroundImageLocalPreview = base64;
      });
    }
  }

  // --- proof file ---
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
    if (file.type.startsWith('image/')) {
      this.convertToBase64(file, (base64) => {
        this.proofFileLocalPreview = base64;
      });
    } else {
      this.proofFileLocalPreview = null; // PDF — no image preview
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.proofFile = null;
    this.proofFileLocalPreview = null;
    this.proofFileError = '';
  }

  clearExistingProof(event: Event): void {
    event.stopPropagation();
    this.proofFilePreview = null;
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

    if (this.proofFile) {
      formData.append('Proof', this.proofFile);
    } else if (this.proofFilePreview) {
      formData.append('ExistingProofPath', this.proofFilePreview);
    }

    if (this.profileImageFile) formData.append('ProfileImage', this.profileImageFile);
    if (this.backgroundImageFile) formData.append('BackgroundImage', this.backgroundImageFile);

    this.profile.UpdateProfile(formData).subscribe({
      next: () => { this.router.navigate(['/userProfile/' + userId]); },
      error: (err) => {
        console.error('Validation errors:', JSON.stringify(err.error?.errors, null, 2));
        alert('Failed to update profile');
      }
    });
  }
}