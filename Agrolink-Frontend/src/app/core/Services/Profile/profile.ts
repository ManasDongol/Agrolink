import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileRequestDto } from '../../Dtos/ProfileRequestDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/profile";

  BuildProfile(dto: ProfileRequestDto): Observable<any> {
      console.log(`${this.baseUrl}/profile`);
      return this.http.post(`${this.baseUrl}/profile`, dto);
    }
}
