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

confirmWithdraw() {
  if (!this.pendingWithdrawRequest) return;
  const req = this.pendingWithdrawRequest;

  this.networkService.withdrawRequest(req.requestId).subscribe({
    next: () => {
      this.sentrequests = this.sentrequests.filter(r => r.requestId !== req.requestId);
      this.networkService.removeSentRequest(req.toUserId);
      const user = this.users.find(u => u.userId === req.toUserId);
      if (user) user.isRequestSent = false;

      this.toast.info("request withdrawn!","");
      this.closeWithdrawModal();
    },
    error: (err) => console.error(err)
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
          console.log(data.requests)
          console.log(data.sentRequests)

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
    next: () => {
      user.isRequestSent = true;
      this.networkService.addSentRequest(user.userId);
    },
    error: (err) => console.error(err)
  });
}

withdrawRequest(req: SentRequestDto) {
  this.networkService.withdrawRequest(req.requestId).subscribe({
    next: () => {
      this.sentrequests = this.sentrequests.filter(r => r.requestId !== req.requestId);
      this.networkService.removeSentRequest(req.toUserId);
      // also update users list
      const user = this.users.find(u => u.userId === req.toUserId);
      if (user) user.isRequestSent = false;
    },
    error: (err) => console.error(err)
  });
}

  accept(req: ConnectionRequestDto) {
    this.networkService.acceptRequest(req.requestId).subscribe({
      next: () => {
        this.requests = this.requests.filter(r => r.requestId !== req.requestId);
        if (this.myProfile) this.myProfile.connectionCount++;
        this.toast.success("Request accepted!","");
      },
      error: (err) => {
        console.error(err);
         this.toast.error("unable to accept request!","the user may have withdrawn the request !");
      }
    });
  }

  reject(req: ConnectionRequestDto) {
    this.networkService.rejectRequest(req.requestId).subscribe({
      next: () => {
        this.requests = this.requests.filter(r => r.requestId !== req.requestId);
        if (this.myProfile) this.myProfile.connectionCount--;
      },
      error: (err) => console.error(err)
    });
  }

  WithdrawRequest(){

  }


}

