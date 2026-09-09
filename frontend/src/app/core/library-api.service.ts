import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface LibraryItem {
  id: number;
  movieTmdbId: number;
  movieTitle: string;
  posterPath: string | null;
  relativePath: string;
  sizeBytes: number;
  resolutionHeight: number | null;
  sourceType: string | null;
  dynamicRange: string | null;
  discoveredAt: string;
}

@Injectable({ providedIn: 'root' })
export class LibraryApiService {
  private readonly http = inject(HttpClient);
  browse(): Observable<LibraryItem[]> { return this.http.get<LibraryItem[]>('/api/library'); }
}
