import { Injectable,inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileRequestDto } from '../../Dtos/ProfileRequestDto';
import { ProfileResponseDto } from '../../Dtos/ProfileResponseDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/profile";

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  BuildProfile(dto: ProfileRequestDto): Observable<ProfileResponseDto> {
    const headers = this.getAuthHeaders();
    return this.http.post<ProfileResponseDto>(`${this.baseUrl}/build`, dto, { headers });
  }

  GetProfileByUserId(userId: string): Observable<ProfileResponseDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProfileResponseDto>(`${this.baseUrl}/user/${userId}`, { headers });
  }

  GetCurrentUserProfile(): Observable<ProfileResponseDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProfileResponseDto>(`${this.baseUrl}/current`, { headers });
  }
}
