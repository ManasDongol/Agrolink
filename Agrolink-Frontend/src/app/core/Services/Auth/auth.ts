import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequestDto } from '../../Dtos/LoginRequestDto';
import { SignupRequestDto } from '../../Dtos/SignupRequestDto';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/Auth";
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Update authentication state when localStorage changes
    window.addEventListener('storage', () => {
      this.isAuthenticatedSubject.next(this.isLoggedIn());
    });
  }

  login(dto: LoginRequestDto): Observable<any> {
    console.log(`${this.baseUrl}/login`);
    return this.http.post(`${this.baseUrl}/login`, dto);
  }

  signup(dto: SignupRequestDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, dto);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    // Basic token validation - check if token exists and is not expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return exp > currentTime;
      }
      return true; // Token exists but no expiration, consider it valid
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    this.isAuthenticatedSubject.next(false);
  }

  updateAuthState(): void {
    this.isAuthenticatedSubject.next(this.isLoggedIn());
  }
}
