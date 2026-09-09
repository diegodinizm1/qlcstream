import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReleaseOption { title: string; protocol: string | null; indexer: string | null; size: number | null; seeders: number | null; leechers: number | null; downloadUrl: string | null; magnetUrl: string | null; infoUrl: string | null; publishDate: string | null; }

@Injectable({ providedIn: 'root' })
export class ReleasesApiService {
  private readonly http = inject(HttpClient);
  search(query: string, year: string): Observable<ReleaseOption[]> { return this.http.get<ReleaseOption[]>('/api/search/releases', { params: { query, year } }); }
}
