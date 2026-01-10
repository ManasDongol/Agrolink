import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/Services/Auth/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,   
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check initial authentication state
    this.isAuthenticated = this.auth.isLoggedIn();
    
    // Subscribe to authentication state changes
    this.authSubscription = this.auth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Update auth state on route changes (in case token is set/removed)
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.auth.updateAuthState();
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  selectedPage() {
    var page=document.getElementById("");
  }
}
