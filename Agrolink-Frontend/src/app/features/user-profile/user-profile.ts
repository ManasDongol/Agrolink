import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { Auth } from '../../core/Services/Auth/auth';
import { environment } from '../../../environments/environments';
import { Observable,map, take } from 'rxjs';
import { NetworkService } from '../../core/Services/Network/network';
import { FeedService } from '../feed/feed.service';
import { Post } from '../feed/feed.models';
import { connectionsDto } from '../../core/Dtos/NetworkDtos';




@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  profile: ProfileResponseDto | null = null;
    id: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  showEditForm: boolean = false;
  connections: number = 0; // Static for now
  userid:string = "";
  apiurl:string= environment.apiUrl;
  isOwnProfile:boolean = false;
  requestSent:boolean=false;
  connectionExists:boolean = false;

  userposts: Post[] =[];


  
  constructor(
    private profileService: ProfileService,
    private networkService : NetworkService,
  
    private postService : FeedService,
    private router: Router,
    private auth: Auth,
    private route : ActivatedRoute
  ) {}

  activeTab: 'about' | 'posts' | 'connections' = 'about';
 
showRemoveModal: boolean = false;
connectionToRemove: { id: string; name: string; role: string; profilePicture: string } | null = null;
 

connectionsList:connectionsDto[] = [];
showWithdrawModal: boolean = false;

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id')!;
  
  this.getUserIdFromToken().subscribe({next:(res)=>{
    this.userid = res;
    console.log("the user id is "+res );
    this.getUserConnections(res);
     this.getUserPosts(res);

  }});
    this.networkService.sentRequestIds$.subscribe(ids => {
    this.requestSent = ids.has(routeId);
  });

   this.networkService.connectedIds$.subscribe(ids => {
    this.connectionExists = ids.has(routeId);
  });
    this.loadProfile();
   

  
  }

  public getUserPosts(profileuserid:string){
      this.id = this.route.snapshot.paramMap.get('id');
      console.log(this.id)
   this.postService.getPostsByID(this.id!
   ).subscribe((res)=>{
    this.userposts=res;
    console.log(this.userposts)
   
    
    
   });
    

  }
  public getUserConnections(currentuserid : string){
     this.id = this.route.snapshot.paramMap.get('id');
      this.profileService.getUserConnections(this.id!).subscribe(
        {
          next:(res)=>{
            this.connectionsList = res;
            this.connections=this.connectionsList.length;
          
         
          }
        }
      )
  }

  private getUserIdFromToken(): Observable<string> {
  return this.auth.checkAuth().pipe(
    map(user => user.id)
  );
}

  loadProfile(): void {
    this.loading = true;
    this.error = null;



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

    const routeId = this.route.snapshot.paramMap.get('id')!;
    this.networkService.sendConnectionRequest(routeId).subscribe({
      next: () => {
           this.networkService.addSentRequest(routeId);
      },
      error: (err) => console.error(err)
    });

  }
confirmRemoveFromHeader(): void {
  const routeId = this.route.snapshot.paramMap.get('id')!;
  this.connectionToRemove = {
    id: routeId,
    name: `${this.profile?.firstName} ${this.profile?.lastName}`,
    role: this.profile?.role ?? '',
    profilePicture: this.profile?.profilePicture ?? ''
  };
  this.showRemoveModal = true;
}
  confirmRemove(userID: string): void {
  const conn = this.connectionsList.find(c => c.connectedUserID === userID);
  if (!conn) return;
  this.connectionToRemove = {
    id: conn.connectedUserID,
    name: conn.connectedUserName,
    role: '',
    profilePicture: conn.connectedProfileUrl
  };
  this.showRemoveModal = true;
}

removeConnection(): void {
  if (!this.connectionToRemove) return;
  this.networkService.removeConnection(this.connectionToRemove.id).subscribe({
    next: () => {
      this.connectionsList = this.connectionsList.filter(
        c => c.connectedUserID !== this.connectionToRemove!.id
      );
      this.connections = Math.max(0, this.connections - 1);
      this.cancelRemove();
    },
    error: (err) => console.error(err)
  });
}

confirmWithdraw(): void {
  const routeId = this.route.snapshot.paramMap.get('id')!;
  this.networkService.withdrawRequestByReceiverId(routeId).subscribe({
    next: () => {
      this.networkService.removeSentRequest(routeId);
      this.showWithdrawModal = false;
    },
    error: (err) => console.error(err)
  });
}

closeWithdrawModal(): void {
  this.showWithdrawModal = false;
}
withdrawConnection(): void {

  this.showWithdrawModal = true;
}
cancelRemove(): void {
  this.showRemoveModal = false;
  this.connectionToRemove = null;
}
 

}


export class posts{
   
    content!: string;
    created!: string;
    imagePath?: string;

    postcategory!: string;
  
    isLiked: boolean = false;
    likesCount: number = 0;
    commentsCount: number = 0;
    isBookmarked: boolean = false;
  
}
  
    
  