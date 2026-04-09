import { Component } from '@angular/core';
import { FormControl,ReactiveFormsModule } from '@angular/forms';
import { WebscraperDataDto } from '../../core/Dtos/WebscraperDataDto';
import { CropService } from '../../core/Services/CropService/crop-service';
import { Spinner } from '../../shared/spinner/spinner';

import { Injectable, inject } from '@angular/core';
import { ToastService } from '../../shared/toast/toast.service';

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

  private toast = inject(ToastService);

  isLoading : boolean = false;

   constructor(
    
    private cropService: CropService
  ) {}


  

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


  

}
