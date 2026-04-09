import { Component } from '@angular/core';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Sidebar } from "../sidebar/sidebar";
import { AdminRoutingModule } from "../../admin-routing-module";
import { CommonModule } from '@angular/common';
import { Auth } from '../../../../core/Services/Auth/auth';
import { RouterLink, Router, RouterLinkActive } from "@angular/router";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone:false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

  constructor(
     private auth: Auth,
    private router: Router,
    ){

    
  }
  logout(){
       this.auth.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['/']);
    });
  }
}
