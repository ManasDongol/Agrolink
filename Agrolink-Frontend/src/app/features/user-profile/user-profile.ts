import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/Services/ProfileService/profileService';
import { ProfileResponseDto } from '../../core/Dtos/ProfileResponseDto';
import { Auth } from '../../core/Services/Auth/auth';
import { environment } from '../../../environments/environments';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil, switchMap } from 'rxjs/operators';
import { NetworkService } from '../../core/Services/Network/network';
import { FeedService } from '../feed/feed.service';
import { Post } from '../feed/feed.models';
import { connectionsDto } from '../../core/Dtos/NetworkDtos';
import { Spinner } from '../../shared/spinner/spinner';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';


import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, Spinner],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit, OnDestroy {
  profile: ProfileResponseDto | null = null;
  id: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  showEditForm: boolean = false;
  connections: number = 0;
  userid: string = '';
  apiurl: string = environment.apiUrl;
  isOwnProfile: boolean = false;
  requestSent: boolean = false;
  connectionExists: boolean = false;

  userposts: Post[] = [];
  activeTab: 'about' | 'posts' | 'connections' = 'about';

  showRemoveModal: boolean = false;
  connectionToRemove: { id: string; name: string; role: string; profilePicture: string } | null = null;
  connectionsList: connectionsDto[] = [];
  showWithdrawModal: boolean = false;


  private destroy$ = new Subject<void>();
    
  private toast = inject(ToastService);

  constructor(
    private profileService: ProfileService,
    private networkService: NetworkService,
    private postService: FeedService,
    private router: Router,
    private auth: Auth,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  combineLatest([
    this.getUserIdFromToken(),
    this.route.paramMap
  ])
  .pipe(
    map(([userId, params]) => {
      const routeId = params.get('id');
      return { userId, routeId };
    }),
    switchMap(({ userId, routeId }) => {
      if (!routeId) throw new Error('Invalid profile id');

      this.userid = userId;
      this.id = routeId;

      this.loading = true;
      this.error = null;

      this.isOwnProfile = routeId === userId;

      return this.profileService.GetProfileByUserId(routeId);
    }),
    takeUntil(this.destroy$)
  )
  .subscribe({
    next: (data) => {
      this.profile = data;
      this.loading = false;

      this.loadExtras(this.id!);
    },
    error: (err) => {
      console.error(err);
      this.error = "Failed to load profile";
      this.loading = false;
    }
  });
}

private loadExtras(id: string) {
  this.postService.getPostsByID(id).subscribe(res => {
    this.userposts = res;
  });

  this.profileService.getUserConnections(id).subscribe(res => {
    this.connectionsList = res;
    this.connections = res.length;

    this.connectionExists = res.some(
      c => c.connectedUserID === this.userid
    );
  });

  this.networkService.sentRequestIds$
    .pipe(takeUntil(this.destroy$))
    .subscribe(ids => {
      this.requestSent = ids.has(id);
    });
}

  ngOnDestroy(): void {
    // Clean up all subscriptions when leaving the page
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getUserPosts(profileuserid: string) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.postService.getPostsByID(this.id!).subscribe((res) => {
      this.userposts = res;
    });
  }

  public getUserConnections(currentuserid: string) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.profileService.getUserConnections(this.id!).subscribe({
      next: (res) => {
        this.connectionsList = res;
        this.connections = this.connectionsList.length;
        this.connectionExists = this.connectionsList.some(
        c => c.connectedUserID === this.userid
      
      );
      console.log(this.connectionsList);
        console.log(this.userid);
        console.log(this.connectionExists);
      }
    });
  }

  private getUserIdFromToken(): Observable<string> {
    return this.auth.checkAuth().pipe(map(user => user.id));
  }

  loadProfile(): void {
  const routeId = this.route.snapshot.paramMap.get('id');
  if (!routeId) return;

  this.loading = true;
  this.error = null;

  this.getUserIdFromToken().pipe(take(1)).subscribe(tokenId => {
    if (!tokenId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isOwnProfile = routeId === tokenId;

    forkJoin({
      profile: this.profileService.GetProfileByUserId(routeId),
      connections: this.profileService.getUserConnections(routeId),
      posts: this.postService.getPostsByID(routeId)
    })
    .pipe(
      finalize(() => {
        this.loading = false; // 🔥 ALWAYS runs
      }),
      catchError(err => {
        console.error(err);
        this.error = "Failed to load profile";
        return of(null);
      })
    )
    .subscribe(res => {
      if (!res) return;

      this.profile = res.profile;
      this.connectionsList = res.connections;
      this.connections = res.connections.length;
      this.userposts = res.posts;

      this.connectionExists = res.connections.some(
        c => c.connectedUserID === this.userid
      );
    });
  });
}

  sendConnection() {
    const routeId = this.route.snapshot.paramMap.get('id')!;
    this.networkService.sendConnectionRequest(routeId).subscribe({
      next: () => {
      
        this.networkService.addSentRequest(routeId);
          this.toast.success('request sent successfully!', '');
      },
      error: (err) =>{
 console.error(err);
    this.toast.error('unsuccessful request!', 'please try sending the request later!');
      }
    });
  }

  confirmWithdraw(): void {
    this.loading = true;
    const routeId = this.route.snapshot.paramMap.get('id')!;
    this.networkService.withdrawRequestByReceiverId(routeId).subscribe({
      next: () => {
        //  removeSentRequest updates sentRequestIds$ BehaviorSubject
        // which our reactive subscription above will pick up automatically
        this.networkService.removeSentRequest(routeId);
        this.showWithdrawModal = false;
        this.loading = false;
         this.toast.info('request withdrawn!', '');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
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
    this.loading = true;
    if (!this.connectionToRemove) return;
    this.networkService.removeConnection(this.connectionToRemove.id).subscribe({
      next: () => {
        this.connectionsList = this.connectionsList.filter(
          c => c.connectedUserID !== this.connectionToRemove!.id
        );
        this.connections = Math.max(0, this.connections - 1);
        this.connectionExists = false;
        this.toast.success("Connection removed successfully!","");
        this.cancelRemove();
        this.loading = false;
      },
      error: (err) =>{
          this.loading = false;
          console.error(err);
      } 
    });
  }

  withdrawConnection(): void {
    this.showWithdrawModal = true;
  }

  closeWithdrawModal(): void {
    this.showWithdrawModal = false;
  }

  cancelRemove(): void {
    this.showRemoveModal = false;
    this.connectionToRemove = null;
  }

  openEditForm(): void {
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
  }

  onProfileUpdated(): void {
    this.closeEditForm();
    this.loadProfile();
  }

  navigateToEditProfile(): void {
    this.getUserIdFromToken().subscribe(id => {
      if (!id) {
         this.toast.info("please login first!","");
        this.router.navigate(['/login']);
        return;
      }
      this.router.navigate(['/buildProfile/', id]);
    });
  }
}

export class posts {
  content!: string;
  created!: string;
  imagePath?: string;
  postcategory!: string;
  isLiked: boolean = false;
  likesCount: number = 0;
  commentsCount: number = 0;
  isBookmarked: boolean = false;
}