import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home  } from "./features/home/home";
import { RouterLink } from '@angular/router';
import { AdminModule } from './features/admin/admin-module';


@Component({
  selector: 'app-root',
  imports: [  RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FrontEndPrac');
}
