import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequestDto } from '../../Dtos/LoginRequestDto';
import { SignupRequestDto } from '../../Dtos/SignupRequestDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/Auth";


  login(dto: LoginRequestDto): Observable<any> {
    console.log(`${this.baseUrl}/login`);
    return this.http.post(`${this.baseUrl}/login`, dto);
  }

  signup(dto: SignupRequestDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, dto);
  }
}
