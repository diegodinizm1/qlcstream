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
export interface FavoriteItem { mediaType: 'MOVIE' | 'SERIES'; tmdbId: number; title: string; posterPath: string | null; subtitle: string | null; addedAt: string; }
export interface FavoriteRequest { title: string; posterPath: string | null; subtitle: string | null; }

export interface SeriesLibraryItem {
  id: number;
  seriesTmdbId: number;
  seriesTitle: string;
  posterPath: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  relativePath: string;
  sizeBytes: number;
  resolutionHeight: number | null;
  sourceType: string | null;
  dynamicRange: string | null;
  discoveredAt: string;
}

export interface PlannedSeries {
  tmdbId: number;
  name: string;
  originalName: string | null;
  posterPath: string | null;
  firstAirDate: string | null;
  voteAverage: number | null;
  addedAt: string;
}

export interface PlannedMovie {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LibraryApiService {
  private readonly http = inject(HttpClient);
  browse(): Observable<LibraryItem[]> { return this.http.get<LibraryItem[]>(apiUrl('/api/library')); }
  favorites(): Observable<FavoriteItem[]> { return this.http.get<FavoriteItem[]>(apiUrl('/api/library/favorites')); }
  addFavorite(mediaType: 'MOVIE' | 'SERIES', tmdbId: number, favorite: FavoriteRequest): Observable<void> { return this.http.post<void>(apiUrl(`/api/library/favorites/${mediaType}/${tmdbId}`), favorite); }
  removeFavorite(mediaType: 'MOVIE' | 'SERIES', tmdbId: number): Observable<void> { return this.http.delete<void>(apiUrl(`/api/library/favorites/${mediaType}/${tmdbId}`)); }
  browseSeries(): Observable<SeriesLibraryItem[]> { return this.http.get<SeriesLibraryItem[]>(apiUrl('/api/library/series')); }
  planned(): Observable<PlannedMovie[]> { return this.http.get<PlannedMovie[]>(apiUrl('/api/library/planned')); }
  movieIds(): Observable<number[]> { return this.http.get<number[]>(apiUrl('/api/library/movie-ids')); }
  isPlanned(tmdbId: number): Observable<{ planned: boolean }> { return this.http.get<{ planned: boolean }>(apiUrl(`/api/library/planned/${tmdbId}`)); }
  addPlanned(tmdbId: number): Observable<{ planned: boolean }> { return this.http.post<{ planned: boolean }>(apiUrl(`/api/library/planned/${tmdbId}`), {}); }
  removePlanned(tmdbId: number): Observable<void> { return this.http.delete<void>(apiUrl(`/api/library/planned/${tmdbId}`)); }
  plannedSeries(): Observable<PlannedSeries[]> { return this.http.get<PlannedSeries[]>(apiUrl('/api/library/planned-series')); }
  isSeriesPlanned(tmdbId: number): Observable<{ planned: boolean }> { return this.http.get<{ planned: boolean }>(apiUrl(`/api/library/planned-series/${tmdbId}`)); }
  addPlannedSeries(series: PlannedSeries): Observable<{ planned: boolean }> { return this.http.post<{ planned: boolean }>(apiUrl(`/api/library/planned-series/${series.tmdbId}`), series); }
  removePlannedSeries(tmdbId: number): Observable<void> { return this.http.delete<void>(apiUrl(`/api/library/planned-series/${tmdbId}`)); }
  remove(id: number): Observable<void> { return this.http.delete<void>(apiUrl(`/api/library/${id}`)); }
  storage(): Observable<StorageSettings> { return this.http.get<StorageSettings>(apiUrl('/api/library/storage')); }
  updateStorage(downloadDirectory: string): Observable<StorageSettings> { return this.http.put<StorageSettings>(apiUrl('/api/library/storage'), { downloadDirectory }); }
}
