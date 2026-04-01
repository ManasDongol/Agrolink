import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/Services/Network/network';
import { NetworkPageDto, NetworkUserDto, ConnectionRequestDto, ProfileStatsDto } from '../../core/Dtos/NetworkDtos';
import { Auth } from '../../core/Services/Auth/auth';
import { environment } from '../../../environments/environments';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './network.html',
  styleUrl: './network.css'
})


export class Network implements OnInit {
  networkService = inject(NetworkService);

  networkData: NetworkPageDto | null = null;
  users: NetworkUserDto[] = [];
  requests: ConnectionRequestDto[] = [];

  sentrequests : ConnectionRequestDto[]=[];
  myProfile: ProfileStatsDto | null = null;
  apiurl:string= environment.apiUrl;

  searchUsername = '';
  searchRole = '';
  currentPage = 1;
  totalPages = 1;
  activeRequestTab: 'received' | 'sent' = 'received';
  loading = false;

  

  ngOnInit() {
    this.loadNetwork();
  }

  filterByRole(role: string): void {
  this.searchUsername = role;
  this.onSearch();
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
          console.log(data.sentRequests)
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
      },
      error: (err) => console.error(err)
    });
  }

  accept(req: ConnectionRequestDto) {
    this.networkService.acceptRequest(req.requestId).subscribe({
      next: () => {
        this.requests = this.requests.filter(r => r.requestId !== req.requestId);
        if (this.myProfile) this.myProfile.connectionCount++;
      },
      error: (err) => console.error(err)
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

