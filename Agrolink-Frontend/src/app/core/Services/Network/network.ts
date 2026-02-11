import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NetworkPageDto } from '../../Dtos/NetworkDtos';

@Injectable({
    providedIn: 'root',
})
export class NetworkService {
    private http = inject(HttpClient);
    private baseUrl = "http://localhost:5131/api/Network";

    getNetworkPage(username?: string, role?: string, page: number = 1, pageSize: number = 12): Observable<NetworkPageDto> {
        let params = new HttpParams().set('page', page).set('pageSize', pageSize);
        if (username) params = params.set('username', username);
        if (role) params = params.set('role', role);

        return this.http.get<NetworkPageDto>(this.baseUrl, { params });
    }

    sendConnectionRequest(targetUserId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/connect/${targetUserId}`, {});
    }

    acceptRequest(requestId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/accept/${requestId}`, {});
    }
}
