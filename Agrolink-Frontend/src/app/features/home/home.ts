import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from "../../shared/footer/footer";

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer],
  standalone:true,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
