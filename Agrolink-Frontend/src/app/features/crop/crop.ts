import { Component, OnInit } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from "@angular/forms";
import { CropService } from '../../core/Services/CropService/crop-service';
import { PredictionRequestDto } from '../../core/Dtos/PredictionRequestDto';
import { WebscraperDataDto } from '../../core/Dtos/WebscraperDataDto';
@Component({
  selector: 'app-crop',
  standalone: true,
  imports: [Navbar, ReactiveFormsModule],
  templateUrl: './crop.html',
  styleUrl: './crop.css',
})
export class Crop implements OnInit {

  crop: string = "";
  fertilizer: string ="";
  priceList : WebscraperDataDto[] = [];

  RecomendationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cropService: CropService
  ) {}

  ngOnInit(): void {

    this.RecomendationForm = this.fb.group({
      Nitrogen: ['', Validators.required],
      Potassium: ['', Validators.required],
      Phosphorus: ['', Validators.required],
      Humidity: ['', Validators.required],
      Temperature: ['', Validators.required],
      Rainfall: ['', Validators.required],
      pH: ['', Validators.required],
    });

    this.cropService.Prices().subscribe({
      next:(res) =>{
        this.priceList = res;
      }
    });

  }

  submit(): void {

    if (this.RecomendationForm.invalid) {
      this.RecomendationForm.markAllAsTouched();
      return;
    }

    const form = this.RecomendationForm.value;

    const dto: PredictionRequestDto = {
      N: Number(form.Nitrogen),
      P: Number(form.Phosphorus),
      K: Number(form.Potassium),
      temperature: Number(form.Temperature),
      humidity: Number(form.Humidity),
      ph: Number(form.pH),
      rainfall: Number(form.Rainfall)
    };

    this.cropService.Predict(dto).subscribe({
      next: (res) => {
        
        this.crop = res.crop;
        this.fertilizer = res.fertilizer;
        console.log(this.crop);// adjust to match API response
      },
      error: (err) => {
        console.error('Prediction failed:', err);
      }
    });

  }

}
