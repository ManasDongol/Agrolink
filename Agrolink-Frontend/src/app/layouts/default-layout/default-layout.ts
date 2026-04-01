import { Component } from '@angular/core';
import { Router, RouterOutlet,NavigationEnd } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';


const NO_FOOTER_ROUTES = ['/crop', '/messages', '/ai'];
@Component({
  selector: 'app-default-layout',
  standalone:true,
  imports: [Navbar,Footer,RouterOutlet],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css',
})


export class DefaultLayout {
  showFooter = true;

  constructor(private router: Router) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.showFooter = !NO_FOOTER_ROUTES.some(route => 
          e.urlAfterRedirects.startsWith(route)
        );
      }
    });
  }
}