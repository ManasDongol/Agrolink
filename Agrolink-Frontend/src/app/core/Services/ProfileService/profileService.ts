import { Injectable,inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileRequestDto } from '../../Dtos/ProfileRequestDto';
import { ProfileResponseDto } from '../../Dtos/ProfileResponseDto';
import { Observable } from 'rxjs';
import {connectionsDto } from '../../Dtos/NetworkDtos';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/profile";
  private connectionsUrl = "http://localhost:5131/api/network"

  

  BuildProfile(dto: ProfileRequestDto): Observable<ProfileResponseDto> {
  
    return this.http.post<ProfileResponseDto>(`${this.baseUrl}/build`, dto);
  }

  GetProfileByUserId(userId: string): Observable<ProfileResponseDto> {
   
    return this.http.get<ProfileResponseDto>(`${this.baseUrl}/user/${userId}`);
  }

  GetCurrentUserProfile(): Observable<ProfileResponseDto> {

    return this.http.get<ProfileResponseDto>(`${this.baseUrl}/current`);
  }

  getUserConnections(userId: string): Observable<connectionsDto[]>{
    return this.http.get<connectionsDto[]>(`${this.connectionsUrl}/${userId}/all`)
  }

  UpdateProfile(formData: FormData) {
  return this.http.put(
    `${this.baseUrl}/update`,
    formData
  );
}
}
