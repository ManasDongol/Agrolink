import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/Services/Network/network';
import { NetworkPageDto, NetworkUserDto, ConnectionRequestDto, ProfileStatsDto, SentRequestDto } from '../../core/Dtos/NetworkDtos';
import { Auth } from '../../core/Services/Auth/auth';
import { environment } from '../../../environments/environments';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './network.html',
  styleUrl: './network.css'
})
export class Network implements OnInit {
  networkService = inject(NetworkService);
  private toast = inject(ToastService);
  networkData: NetworkPageDto | null = null;
  users: NetworkUserDto[] = [];
  requests: ConnectionRequestDto[] = [];
  sentrequests : SentRequestDto[]=[];
  myProfile: ProfileStatsDto | null = null;
  apiurl:string= environment.apiUrl;
  searchUsername = '';
  searchRole = '';
  currentPage = 1;
  totalPages = 1;
  activeRequestTab: 'received' | 'sent' = 'received';
  
  loading = false;


  sentRequestIdSet: Set<string> = new Set();
connectedIdSet: Set<string> = new Set();

showWithdrawModal: boolean = false;
pendingWithdrawRequest: SentRequestDto | null = null;

  

  ngOnInit() {
    this.loadNetwork();
  }

  filterByRole(role: string): void {
  this.searchUsername = role;
  this.onSearch();
}

openWithdrawModal(req: SentRequestDto) {
  this.pendingWithdrawRequest = req;
  this.showWithdrawModal = true;
}

openWithdrawModalFromGrid(user: NetworkUserDto) {
  const req = this.sentrequests.find(r => r.toUserId === user.userId);
  if (req) this.openWithdrawModal(req);
}

closeWithdrawModal() {
  this.showWithdrawModal = false;
  this.pendingWithdrawRequest = null;
}


onButtonClick(event: Event, user: any) {
  event.stopPropagation(); 
  event.preventDefault();  

  if (user.isRequestSent) {
    this.openWithdrawModalFromGrid(user);
  } else {
    this.connect(user);
  }
}

confirmWithdraw() {
  if (!this.pendingWithdrawRequest) return;

  const req = this.pendingWithdrawRequest;

  this.networkService.withdrawRequest(req.requestId).subscribe({
    next: (res) => {

      // always update UI (whether real or already processed)
      this.sentrequests = this.sentrequests.filter(
        r => r.requestId !== req.requestId
      );

      const user = this.users.find(u => u.userId === req.toUserId);
      if (user) user.isRequestSent = false;

      
      if (res?.message?.includes("Already")) {
        this.toast.info("Already processed", "");
      } else {
        this.toast.info("Request withdrawn", "");
      }

      this.closeWithdrawModal();
    },

    error: (err) => {
      console.error("WITHDRAW ERROR:", err);

      this.toast.error("Failed to withdraw request", "");
      this.closeWithdrawModal();
    }
  });
}

  loadNetwork() {
    this.loading = true;
    this.networkService.getNetworkPage(this.searchUsername, this.searchRole, this.currentPage)
      .subscribe({
        next: (data) => {
          this.networkData = data;
          this.users = data.users;
          this.requests = data.requests;
          this.sentrequests = data.sentRequests;
          this.myProfile = data.myProfile;
          this.totalPages = data.totalPages;
          this.loading = false;
          

          this.networkService.updateConnectionState(data.sentRequests, data.users
  .filter(u => u.isConnected)
  .map(u => ({ connectedUserID: u.userId } as any))
);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });

      
  }

  onSearch() {
    this.currentPage = 1;
    this.loadNetwork();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadNetwork();
  }

connect(user: NetworkUserDto) {
  if (user.isRequestSent || user.isConnected) return;
  this.networkService.sendConnectionRequest(user.userId).subscribe({
    next: (res) => {
      user.isRequestSent = true;
      
  
      const newRequest: SentRequestDto = {
        requestId: res.requestId,
        toUserId: user.userId,
        toUserName: user.username,
        toUserRole: user.role,
        toUserProfilePicture: user.profilePicture,
        sentDate: new Date()
      };

      this.sentrequests = [newRequest, ...this.sentrequests];

       this.toast.success("Request sent!", "");
       
    },
    error: (err) =>  this.toast.error("failed to send please try again later !", "")
  });
}


  

accept(req: ConnectionRequestDto) {
  this.networkService.acceptRequest(req.requestId).subscribe({
    next: (res) => {

      // always remove from UI
      this.requests = this.requests.filter(
        r => r.requestId !== req.requestId
      );

      // update connection count ONLY if real accept
      if (!res?.message?.includes("Already")) {
        if (this.myProfile) this.myProfile.connectionCount++;
        this.toast.success("Request accepted!", "");
      } else {
        this.toast.info("Already processed", "");
      }
    },

    error: (err) => {
      console.error(err);
      this.toast.error("Failed to accept request", "");
    }
  });
}

  reject(req: ConnectionRequestDto) {
  this.networkService.rejectRequest(req.requestId).subscribe({
    next: (res) => {

      // always remove from UI
      this.requests = this.requests.filter(
        r => r.requestId !== req.requestId
      );

      if (!res?.message?.includes("Already")) {
        this.toast.info("Request rejected", "");
      } else {
        this.toast.info("Already processed", "");
      }
    },

    error: (err) => {
      console.error(err);
      this.toast.error("Failed to reject request", "");
    }
  });
}

  


}

