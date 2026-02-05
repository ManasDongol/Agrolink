import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../Auth/auth';
import { Observable } from 'rxjs';
import { PredictionRequestDto } from '../../Dtos/PredictionRequestDto';

@Injectable({
  providedIn: 'root',
})
export class CropService{
  private auth = inject(Auth)
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/Crops/predict";

    
  
  Predict(dto: PredictionRequestDto): Observable<any>{
    return this.http.post(`${this.baseUrl}`, dto);
  }
}
