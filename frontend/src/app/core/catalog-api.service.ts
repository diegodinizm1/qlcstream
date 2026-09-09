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

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);

  trending(language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>('/api/catalog/trending', {
      params: { language, page },
    });
  }

  search(query: string, language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>('/api/catalog/search', {
      params: { query, language, page },
    });
  }
}
