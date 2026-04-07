import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetectionHistory {
  id: number;
  userId: string;
  imageFileName: string;
  imagePath: string;
  predictedClass: string;
  predictedClassRaw: string;
  confidence: number;
  detectedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DetectionHistoryService {
  private baseUrl = 'http://localhost:5131/api/DetectionHistory';
  private http = inject(HttpClient);

  // Save a detection after a successful predict call
  saveDetection(
    image: File,
    predictedClass: string,
    predictedClassRaw: string,
    confidence: number
  ): Observable<DetectionHistory> {
    const form = new FormData();
    form.append('image', image);
    form.append('predictedClass', predictedClass);
    form.append('predictedClassRaw', predictedClassRaw);
    form.append('confidence', confidence.toString());
    return this.http.post<DetectionHistory>(`${this.baseUrl}/save`, form);
  }

  // Get all detections for the current logged-in user
  getHistory(): Observable<DetectionHistory[]> {
    return this.http.get<DetectionHistory[]>(this.baseUrl);
  }

  // Get a single detection by id
  getById(id: number): Observable<DetectionHistory> {
    return this.http.get<DetectionHistory>(`${this.baseUrl}/${id}`);
  }

  // Delete a detection (only owner can delete — enforced by backend)
  deleteDetection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}