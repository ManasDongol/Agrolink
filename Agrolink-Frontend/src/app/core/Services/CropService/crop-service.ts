import { Injectable,inject } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Auth } from '../Auth/auth';
import { Observable } from 'rxjs';
import { PredictionRequestDto } from '../../Dtos/PredictionRequestDto';
import { PDFReportDto } from '../../Dtos/PDFReportDto';

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

interface PredictionResponse {
  results: CropResult[];
}
@Injectable({
  providedIn: 'root',
})
export class CropService{
  private auth = inject(Auth)
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5131/api/Crops/predict";
  private priceUrl = "http://localhost:5131/api/Crops/prices";
   private cropUrl = "http://localhost:5131/api/Crops/cropName";
  private reportURL = "http://localhost:5131/api/Crops/report";
    
  
Predict(dto: PredictionRequestDto): Observable<PredictionResponse>{
  return this.http.post<PredictionResponse>(`${this.baseUrl}`, dto);
}
  Prices():Observable<any>{
    return this.http.get(`${this.priceUrl}`);
  }
  search(value: string): Observable<any> {
  const params = new HttpParams().set('name', value);

  return this.http.get(this.cropUrl, { params });
}

  report(dto : PDFReportDto):Observable<any>{
    return this.http.post(`${this.reportURL}`,dto,{ responseType: 'blob' , headers: { 'Content-Type': 'application/json' }});
  }
}
