import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/services/Network/network';
import { NetworkPageDto, NetworkUserDto, ConnectionRequestDto, ProfileStatsDto } from '../../core/Dtos/NetworkDtos';

@Component({
    selector: 'app-network',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './network.component.html',
    styleUrls: ['./network.component.css']
})
export class NetworkComponent implements OnInit {
    networkService = inject(NetworkService);

    networkData: NetworkPageDto | null = null;
    users: NetworkUserDto[] = [];
    requests: ConnectionRequestDto[] = [];
    myProfile: ProfileStatsDto | null = null;

    searchUsername = '';
    searchRole = '';
    currentPage = 1;
    totalPages = 1;

    loading = false;

    ngOnInit() {
        this.loadNetwork();
    }

    loadNetwork() {
        this.loading = true;
        this.networkService.getNetworkPage(this.searchUsername, this.searchRole, this.currentPage)
            .subscribe({
                next: (data) => {
                    this.networkData = data;
                    this.users = data.users;
                    this.requests = data.requests;
                    this.myProfile = data.myProfile;
                    this.totalPages = data.totalPages;
                    this.loading = false;
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
                // Maybe refresh users too if the user was in the grid?
            },
            error: (err) => console.error(err)
        });
    }
}
