import { Component } from '@angular/core';
import { AdminRoutingModule } from "../../features/admin/admin-routing-module";

@Component({
  selector: 'app-footer',
  imports: [AdminRoutingModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

}
