import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home  } from "./features/home/home";
import { RouterLink } from '@angular/router';
import { AdminModule } from './features/admin/admin-module';
import { FormsModule } from '@angular/forms';
import { Toast } from './shared/toast/toast';


@Component({
  selector: 'app-root',
    standalone: true, 
  imports: [  RouterOutlet,FormsModule,Toast],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('Agrolink');
}
