import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiResponseDto {
  answer: string;
  sessionId: string;
  sessionTitle: string;
  queriesUsed: number;
  queriesRemaining: number;
  conversationEnded: boolean;
}

export interface AiSessionDto {
  id: string;
  title: string;
  updatedAt: string;
}

export interface AiMessageDto {
  role: string;
  content: string | null;
  isImage: boolean;
  imagePath: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private baseUrl = 'http://localhost:5131/api/Ai';
  private http = inject(HttpClient);

  Ask(query: string, sessionId?: string): Observable<AiResponseDto> {
    return this.http.post<AiResponseDto>(`${this.baseUrl}/ask`, {
      query,
      sessionId: sessionId ?? null
    });
  }

  AskWithImage(image: File, query?: string, sessionId?: string): Observable<AiResponseDto> {
    const form = new FormData();
    form.append('image', image);
    if (query) form.append('query', query);
    if (sessionId) form.append('sessionId', sessionId);
    return this.http.post<AiResponseDto>(`${this.baseUrl}/ask/image`, form);
  }

  GetSessions(): Observable<AiSessionDto[]> {
    return this.http.get<AiSessionDto[]>(`${this.baseUrl}/sessions`);
  }

  GetSession(id: string): Observable<AiMessageDto[]> {
    return this.http.get<AiMessageDto[]>(`${this.baseUrl}/sessions/${id}`);
  }

  DeleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }
}