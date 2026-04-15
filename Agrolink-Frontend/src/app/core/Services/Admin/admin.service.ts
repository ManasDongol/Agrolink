import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalPosts: number;
  pendingVerifications?: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  userType: string;
}

/* Legacy flat shape kept for backward compat */
export interface AdminPost {
  id: string;
  title: string;
  author: string;
  created: string;
  category: string;
}

/* Rich shape that mirrors the feed Post model */

export interface AdminPostFull {
  postId: string;
  title: string;
  content: string;
  created: string;
  imagePath?: string;

  author: {
    userId: string;
    username: string;
    profilePictureUrl?: string;
  };

  postCategory: string;

  isLiked: boolean;
  likesCount: number;

  commentsCount: number;

  isBookmarked: boolean;
  bookmarksCount: number;
}
export interface UnverifiedUser {
   profileId: string;          // Guid in C# → string in TS
  userId: string;             // Guid → string
  firstName: string;
  lastName: string;
  role: string;
  address: string;
  phoneNumber: string;
  profilePicture: string;
  profileBackground: string;
  description: string;
  achievement: string;
  proof?: string | null;      // nullable in C# → optional or null in TS
  isVerified: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5131/api/Admin';
  private postUrl = 'http://localhost:5131/api/Posts';
  private authurl=  'http://localhost:5131/api/Auth'

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
  addAdmin(payload: { Username: string; Email: string; Password: string; UserType: string }): Observable<AdminUser> {
  return this.http.post<AdminUser>(`${this.authurl}/signup`, payload, {
    withCredentials: true,
  });
}

  getAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/admins`, {
      withCredentials: true,
    });
  }

  getPosts(): Observable<AdminPostFull[]> {
    return this.http.get<AdminPostFull[]>(`${this.baseUrl}/posts`, {
      withCredentials: true,
    });
  }

  getallPosts():Observable<AdminPostFull[]> {
    return this.http.get<AdminPostFull[]>(`${this.baseUrl}/posts`, {
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

  deletePost(id: string) {
    return this.http.delete(`${this.baseUrl}/posts/${id}`, {
      withCredentials: true,
    });
  }

  getUnverifiedUsers(): Observable<UnverifiedUser[]> {
    return this.http.get<UnverifiedUser[]>(`${this.baseUrl}/get-profiles`, {
      withCredentials: true,
    });
  }

  verifyUser(id: string) {
    return this.http.put(
      `${this.baseUrl}/verify-users/${id}/approve`,
      {},
      { withCredentials: true }
    );
  }

  rejectUser(id: string) {
    return this.http.post(
      `${this.baseUrl}/verify-users/${id}/reject`,
      {},
      { withCredentials: true }
    );
  }
}
