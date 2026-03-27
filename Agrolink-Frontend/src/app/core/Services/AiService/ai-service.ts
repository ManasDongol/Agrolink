import { Injectable,inject } from '@angular/core';

import { HttpClient , HttpParams} from '@angular/common/http';
import { Auth } from '../Auth/auth';
import { Observable } from 'rxjs';
import { AiResponseDto } from '../../Dtos/AiResponseDto';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private baseUrl = "http://localhost:5131/api/Crops/ask";
  private http = inject(HttpClient);

  Ask(query : string): Observable<AiResponseDto>{
    console.log(query)
    return this.http.post<AiResponseDto>(`${this.baseUrl}`, {query : query});
  }
  
}
