import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd, RouterLinkActive } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/Services/Auth/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,   
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isAuthenticated: boolean = false;
  private authSubscription?: Subscription;
  

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    
    this.authSubscription = this.auth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

   
  this.auth.checkAuth().subscribe({
    next: () => this.auth.setAuthenticated(true),
    error: () => this.auth.setAuthenticated(false)
  });
  }


  logout(): void {
  this.auth.logout().subscribe(() => {
    this.auth.setAuthenticated(false);
    this.router.navigate(['/']);
  });
}


  
}
