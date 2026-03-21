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


  priceList : WebscraperDataDto[] = [];

  SearchControl !: FormControl;
  loading:Boolean = false;
  results: any[] = [];

  isLoading : boolean = false;

   constructor(
    
    private cropService: CropService
  ) {}


  ngOnInit(){
    this.isLoading = true;

    this.SearchControl = new FormControl('');

      this.cropService.Prices().subscribe({
      next:(res) =>{
        this.priceList = res;
        this.isLoading = false
      },
      error:(err)=>{
        
            this.isLoading = false
      }
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
