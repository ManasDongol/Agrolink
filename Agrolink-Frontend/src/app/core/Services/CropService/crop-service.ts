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
  private priceUrl = "http://localhost:5131/api/Crops/prices";

    
  
  Predict(dto: PredictionRequestDto): Observable<any>{
    return this.http.post(`${this.baseUrl}`, dto);
  }
  Prices():Observable<any>{
    return this.http.get(`${this.priceUrl}`);
  }
}
