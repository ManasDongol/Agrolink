import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { Auth } from '../../core/Services/Auth/auth';
import { environment } from '../../../environments/environments';
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
  apiurl:string= environment.apiUrl;
  isOwnProfile:boolean = false;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private auth: Auth,
    private route : ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private getUserIdFromToken(): Observable<string> {
  return this.auth.checkAuth().pipe(
    map(user => user.id)
  );
}

  loadProfile(): void {
    this.loading = true;
    this.error = null;

   //let userId = this.getUserIdFromToken();

   const routeId = this.route.snapshot.paramMap.get('id');

     if (!routeId) {
    this.error = "Invalid profile id";
    this.loading = false;
    return;
  }

   this.getUserIdFromToken().subscribe(tokenId => {
      
       if (!tokenId) {
      this.error = 'Please login to view your profile';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }


     this.isOwnProfile = routeId === tokenId;

    this.profileService.GetProfileByUserId(routeId).subscribe({
      next: (data) => {
        console.log(routeId);
        this.profile = data;
        console.log(this.profile.profilePicture);
        console.log(this.profile.profileBackground);
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
    this.getUserIdFromToken().subscribe(id => {
      console.log("User ID:", id);
       if (!id) {
      this.error = 'Please login to view your profile';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/buildProfile/',id]) });
  }

  sendConnection(){

  }
}
