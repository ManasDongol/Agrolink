import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'alert' | 'price';
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'http://localhost:5131/api/notification';
  private hubUrl = 'http://localhost:5131/notificationhub';

  private http = inject(HttpClient);
  private hubConnection: signalR.HubConnection | null = null;

  // Reactive state — navbar subscribes to these
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();



 startConnection(): void {
    // ← guard: don't reconnect if already connected or connecting
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected ||
        this.hubConnection?.state === signalR.HubConnectionState.Connecting) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('[AgroLink] SignalR connected');
        this.hubConnection?.off('ReceiveNotification'); // ← clear before adding
        this.listenForNotifications();
        this.loadNotifications();
      })
      .catch(err => console.error('[AgroLink] SignalR connection error:', err));
}
  stopConnection(): void {
    this.hubConnection?.stop();
  }

  private listenForNotifications(): void {
    this.hubConnection?.on('ReceiveNotification', (notification: Notification) => {
      // Prepend new notification to the list
      const current = this.notificationsSubject.getValue();
      this.notificationsSubject.next([notification, ...current]);

      // Bump unread count
      this.unreadCountSubject.next(this.unreadCountSubject.getValue() + 1);
    });
  }



  loadNotifications(): void {
    this.http.get<Notification[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.notificationsSubject.next(data);
        this.unreadCountSubject.next(data.filter(n => !n.isRead).length);
      },
      error: () => {}
    });
  }

  markRead(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.patch<void>(`${this.baseUrl}/${id}/read`, {}).subscribe({
        next: () => {
          const updated = this.notificationsSubject.getValue().map(n =>
            n.id === id ? { ...n, isRead: true } : n
          );
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(updated.filter(n => !n.isRead).length);
          observer.next();
          observer.complete();
        }
      });
    });
  }

  markAllRead(): Observable<void> {
    return new Observable(observer => {
      this.http.post<void>(`${this.baseUrl}/mark-all-read`, {}).subscribe({
        next: () => {
          const updated = this.notificationsSubject.getValue().map(n => ({ ...n, isRead: true }));
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(0);
          observer.next();
          observer.complete();
        }
      });
    });
  }
}