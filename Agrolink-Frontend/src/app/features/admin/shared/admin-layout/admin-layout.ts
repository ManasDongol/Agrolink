import { Component } from '@angular/core';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Sidebar } from "../sidebar/sidebar";
import { AdminRoutingModule } from "../../admin-routing-module";

@Component({
  selector: 'app-admin-layout',
  standalone:false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

}
