import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequestDto } from '../../Dtos/LoginRequestDto';
import { SignupRequestDto } from '../../Dtos/SignupRequestDto';
import { BehaviorSubject, Observable } from 'rxjs';
import { userDto } from '../../Dtos/UserDto';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/Auth";

  // Login state only (NOT token)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

 

  login(dto: LoginRequestDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, dto // send/receive cookies
    );
  }

  signup(dto: SignupRequestDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, dto);
  }

 

  checkAuth(): Observable<userDto> {
    return this.http.get<userDto>(`${this.baseUrl}/me`);
  }



  setAuthenticated(value: boolean) {
    this.isAuthenticatedSubject.next(value);
  }

  forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/forgot-password`, { email });
}

resetPassword(token: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword });
}

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      withCredentials: true
    });
  }
}
