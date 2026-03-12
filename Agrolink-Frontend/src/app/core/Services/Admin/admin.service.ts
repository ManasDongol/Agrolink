import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalPosts: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  userType: string;
}

export interface AdminPost {
  id: string;
  title: string;
  author: string;
  created: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5131/api/Admin';

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`, {
      withCredentials: true,
    });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`, {
      withCredentials: true,
    });
  }

  getAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/admins`, {
      withCredentials: true,
    });
  }

  getPosts(): Observable<AdminPost[]> {
    return this.http.get<AdminPost[]>(`${this.baseUrl}/posts`, {
      withCredentials: true,
    });
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}/users/${id}`, {
      withCredentials: true,
    });
  }

  deleteAdmin(id: string) {
    return this.http.delete(`${this.baseUrl}/admins/${id}`, {
      withCredentials: true,
    });
  }
}

