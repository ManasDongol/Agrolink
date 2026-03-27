import { Component, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, FormGroup, Validators,FormControl } from "@angular/forms";
import { CropService } from '../../core/Services/CropService/crop-service';
import { PredictionRequestDto } from '../../core/Dtos/PredictionRequestDto';
import { WebscraperDataDto } from '../../core/Dtos/WebscraperDataDto';
import { PDFReportDto } from '../../core/Dtos/PDFReportDto';

import { Spinner } from '../../shared/spinner/spinner';


interface Fertilizer {
  fertilizer: string;
  fert_prob: number;
  score: number;
}

interface CropResult {
  crop: string;
  crop_prob: number;
  yield_: number;
  fertilizers: Fertilizer[];
}

@Component({
  selector: 'app-crop',
  standalone: true,
  imports: [ ReactiveFormsModule,Spinner],
  templateUrl: './crop.html',
  styleUrl: './crop.css',
})
export class Crop implements OnInit {

  crop: string = "";
  fertilizer: string ="";
  priceList : WebscraperDataDto[] = [];

  RecomendationForm!: FormGroup;
  SearchControl !: FormControl;
  loading:Boolean = false;
 results: CropResult[] = [];

  isLoading : boolean = false;

  newRecommendationGenerated : boolean = false;

  constructor(
    private fb: FormBuilder,
    private cropService: CropService
  ) {}

  ngOnInit(): void {

    this.isLoading = true;

    this.SearchControl = new FormControl('');


    this.RecomendationForm = this.fb.group({
      Nitrogen: [0, Validators.required],
      Potassium: [0, Validators.required],
      Phosphorus: [0, Validators.required],
      Humidity: [0, Validators.required],
      Temperature: [0, Validators.required],
      Rainfall: [0, Validators.required],
      pH: [0, Validators.required],
    });

    this.cropService.Prices().subscribe({
      next:(res) =>{
        this.priceList = res;
        this.isLoading = false
      },
      error:(err)=>{
        console.log("sorry");
            this.isLoading = false
      }
    });

   

  }



  generatePDF(){
     this.isLoading = true;
        const form = this.RecomendationForm.value;
      const dto: PDFReportDto = {
      N: parseFloat(form.Nitrogen),
      P: parseFloat(form.Phosphorus),
      K: parseFloat(form.Potassium),
      Temperature: parseFloat(form.Temperature),
      Humidity: parseFloat(form.Humidity),
      Ph: parseFloat(form.pH),
      Rainfall: parseFloat(form.Rainfall),
      Crop: this.crop,
      Fertilizer : this.fertilizer
    };

  
    this.cropService.report(dto).subscribe({
      next:(res:Blob)=>{
        const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'AgroLink-CropReport.pdf';
      a.click();

      window.URL.revokeObjectURL(url);
      this.isLoading = false;
      },
      error:(err)=>{
           this.isLoading = false;
      }

    })

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


  submit(): void {

    if (this.RecomendationForm.invalid) {
      this.RecomendationForm.markAllAsTouched();
      return;
    }

    const form = this.RecomendationForm.value;

    const dto: PredictionRequestDto = {
      N: parseFloat(form.Nitrogen),
      P: parseFloat(form.Phosphorus),
      K: parseFloat(form.Potassium),
      temperature: parseFloat(form.Temperature),
      humidity: parseFloat(form.Humidity),
      ph: parseFloat(form.pH),
      rainfall: parseFloat(form.Rainfall)
    };

   this.cropService.Predict(dto).subscribe({
  next: (res) => {
    
   

    this.results = res?.results || [];

    this.newRecommendationGenerated = true;

    if (this.results.length > 0) {
      this.crop = this.results[0].crop;
      this.fertilizer = this.results[0].fertilizers?.[0]?.fertilizer || '';
    }
  },
  error: (err) => {
    console.error('Prediction failed:', err);
  }
});

  }

}
