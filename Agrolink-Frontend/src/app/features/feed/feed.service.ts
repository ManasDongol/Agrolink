import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Tag, PostResponse } from './feed.models';

@Injectable({
    providedIn: 'root'
})
export class FeedService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:5131/api/Posts';

    constructor() { }

    getTags(): Observable<Tag[]> {
        return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
    }

    getPosts(page: number, pageSize: number, view: 'all' | 'my'): Observable<PostResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString())
            .set('view', view);

        return this.http.get<PostResponse>(this.baseUrl, { params });
    }

    createPost(data: FormData): Observable<Post> {
        return this.http.post<Post>(this.baseUrl, data);
    }
}
