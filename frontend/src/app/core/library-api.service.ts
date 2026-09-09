import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from './api-url';

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

export interface StorageSettings { downloadDirectory: string; }

@Injectable({ providedIn: 'root' })
export class LibraryApiService {
  private readonly http = inject(HttpClient);
  browse(): Observable<LibraryItem[]> { return this.http.get<LibraryItem[]>(apiUrl('/api/library')); }
  remove(id: number): Observable<void> { return this.http.delete<void>(apiUrl(`/api/library/${id}`)); }
  storage(): Observable<StorageSettings> { return this.http.get<StorageSettings>(apiUrl('/api/library/storage')); }
  updateStorage(downloadDirectory: string): Observable<StorageSettings> { return this.http.put<StorageSettings>(apiUrl('/api/library/storage'), { downloadDirectory }); }
}
