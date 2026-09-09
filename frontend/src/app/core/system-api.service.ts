import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface IntegrationStatus { id: 'tmdb' | 'prowlarr' | 'qbittorrent'; configured: boolean; }

@Injectable({ providedIn: 'root' })
export class SystemApiService {
  private readonly http = inject(HttpClient);
  integrations(): Observable<IntegrationStatus[]> { return this.http.get<IntegrationStatus[]>('/api/system/integrations'); }
}
