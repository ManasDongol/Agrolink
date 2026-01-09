import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from "../../shared/footer/footer";

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
