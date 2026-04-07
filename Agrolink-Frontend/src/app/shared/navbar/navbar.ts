import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/Services/Auth/auth';
import { Notification, NotificationService } from '../../core/Services/Notifications/notification';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isAuthenticated = false;
  UserId = '';
  menuOpen = false;
  notifOpen = false;

  notifications: Notification[] = [];
  unreadCount = 0;

  private subs: Subscription[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    // 1. Load auth state first
    this.auth.checkAuth().subscribe({
      next: (user) => {
        this.UserId = user.id;
        this.auth.setAuthenticated(true);
      },
      error: () => this.auth.setAuthenticated(false)
    });

    // 2. React to auth state changes — startConnection is guarded internally
    this.subs.push(
      this.auth.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.notifService.startConnection();
        } else {
          this.notifService.stopConnection();
        }
      })
    );

    // 3. Subscribe to notification state
    this.subs.push(
      this.notifService.notifications$.subscribe(n => this.notifications = n)
    );

    this.subs.push(
      this.notifService.unreadCount$.subscribe(c => this.unreadCount = c)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.notifService.stopConnection();
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }
  toggleNotifications() { this.notifOpen = !this.notifOpen; }

  markRead(n: Notification) {
    if (!n.isRead) {
      this.notifService.markRead(n.id).subscribe();
    }
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe();
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.notifOpen = false;
    }
  }

  logout(): void {
    this.notifService.stopConnection();
    this.auth.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['/']);
    });
  }
}