import { Component } from '@angular/core';
import { AdminRoutingModule } from "../../features/admin/admin-routing-module";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [AdminRoutingModule,RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

}
