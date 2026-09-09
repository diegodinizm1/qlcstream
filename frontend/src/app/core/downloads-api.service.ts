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

export interface CreateDownloadRequest {
  movieTmdbId: number;
  releaseTitle: string;
  acquisitionRef: string;
  indexerName: string | null;
  resolutionHeight: number | null;
  sourceType: string | null;
  dynamicRange: string | null;
}

export interface SubmittedDownload {
  id: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DownloadsApiService {
  private readonly http = inject(HttpClient);

  active(): Observable<DownloadSummary[]> {
    return this.http.get<DownloadSummary[]>('/api/downloads');
  }

  enqueue(request: CreateDownloadRequest): Observable<SubmittedDownload> {
    return this.http.post<SubmittedDownload>('/api/downloads', request);
  }

  control(id: string, action: 'pause' | 'resume' | 'cancel'): Observable<void> {
    return this.http.post<void>(`/api/downloads/${id}/${action.toUpperCase()}`, {});
  }
}
