import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CatalogMovie {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  releaseDate: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
}

export interface MovieDetails extends CatalogMovie {
  tagline: string | null;
  runtimeMinutes: number;
  genres: string[];
}

export type CatalogCollection = 'POPULAR' | 'TOP_RATED' | 'ESTABLISHED' | 'RECENT';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);

  trending(language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>('/api/catalog/trending', {
      params: { language, page },
    });
  }

  discover(collection: CatalogCollection, language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>('/api/catalog/discover', {
      params: { collection, language, page },
    });
  }

  search(query: string, language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>('/api/catalog/search', {
      params: { query, language, page },
    });
  }

  details(tmdbId: number, language = 'pt-BR'): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`/api/catalog/${tmdbId}`, {
      params: { language },
    });
  }
}
