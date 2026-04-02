import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';
import { NetworkPageDto, SentRequestDto } from '../../Dtos/NetworkDtos';
import { ConnectionRequestDto, connectionsDto } from '../../Dtos/NetworkDtos';

@Injectable({
    providedIn: 'root',
})
export class NetworkService {
    private http = inject(HttpClient);
    private baseUrl = "http://localhost:5131/api/Network";

private sentRequestIds = new BehaviorSubject<Set<string>>(new Set());
public sentRequestIds$ = this.sentRequestIds.asObservable();

private connectedIds = new BehaviorSubject<Set<string>>(new Set());
public connectedIds$ = this.connectedIds.asObservable();

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


    rejectRequest(requestId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/reject/${requestId}`, {});
    }

    updateConnectionState(sentRequests: SentRequestDto[], connections: connectionsDto[]) {
  this.sentRequestIds.next(new Set(sentRequests.map(r => r.toUserId)));
  this.connectedIds.next(new Set(connections.map(c => c.connectedUserID)));
}


addSentRequest(userId: string) {
  const current = this.sentRequestIds.getValue();
  current.add(userId);
  this.sentRequestIds.next(new Set(current));
}

removeSentRequest(userId: string) {
  const current = this.sentRequestIds.getValue();
  current.delete(userId);
  this.sentRequestIds.next(new Set(current));
}

withdrawRequest(requestId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/withdraw/${requestId}`);
}

withdrawRequestByReceiverId(receiverId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/withdraw/${receiverId}`);
}

removeConnection(userId: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/connections/${userId}`);
}
}
