import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DownloadSummary {
  id: string;
  movieTmdbId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseTitle: string;
  resolutionHeight: number | null;
  sourceType: string | null;
  dynamicRange: string | null;
  status: string;
  progress: number;
  totalBytes: number | null;
  downloadedBytes: number;
  downloadSpeedBps: number;
  etaSeconds: number | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DownloadsApiService {
  private readonly http = inject(HttpClient);

  active(): Observable<DownloadSummary[]> {
    return this.http.get<DownloadSummary[]>('/api/downloads');
  }
}
