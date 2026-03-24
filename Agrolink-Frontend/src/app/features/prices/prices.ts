import { Component } from '@angular/core';
import { FormControl,ReactiveFormsModule } from '@angular/forms';
import { WebscraperDataDto } from '../../core/Dtos/WebscraperDataDto';
import { CropService } from '../../core/Services/CropService/crop-service';
import { Spinner } from '../../shared/spinner/spinner';


@Component({
  selector: 'app-prices',
  imports: [ReactiveFormsModule,Spinner],
    standalone:true,
  templateUrl: './prices.html',
  styleUrl: './prices.css',
})
export class Prices {

  filteredList: WebscraperDataDto[] = [];
  priceList : WebscraperDataDto[] = [];
  currenttime: Date = new Date();
  SearchControl !: FormControl;
  loading:Boolean = false;
  results: any[] = [];

  isLoading : boolean = false;

   constructor(
    
    private cropService: CropService
  ) {}


  // display this in the template

ngOnInit() {
  this.isLoading = true;
  this.SearchControl = new FormControl('');

  // load once
  this.cropService.Prices().subscribe({
    next: (res) => {
      this.priceList = res;
      this.filteredList = res;  // initially show all
      this.isLoading = false;
    },
    error: () => { this.isLoading = false; }
  });

  // filter in memory on every keystroke
  this.SearchControl.valueChanges.subscribe(query => {
    if (!query || query.length < 2) {
      this.filteredList = this.priceList;  // reset
      return;
    }
    this.filteredList = this.priceList.filter(item =>
      item.commodity?.toLowerCase().includes(query.toLowerCase())
    );
  });



  }
  
   searchCrop(): void {
          this.isLoading = true;
    const query = this.SearchControl.value;

    if (!query || query.length < 2) return;

    this.loading = true;

    this.cropService.search(query).subscribe({
      next: (res) => {
        this.priceList = res;
        this.loading = false;
            this.isLoading = false
      },
      error: () => {
        this.loading = false;
            this.isLoading = false
      },
    });
}

  

}
