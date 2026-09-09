import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from './api-url';

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
  popularity: number | null;
}

export interface MovieDetails extends CatalogMovie {
  tagline: string | null;
  runtimeMinutes: number;
  genres: string[];
  director: string | null;
  writers: string[];
  cast: CastMember[];
  trailerUrl: string | null;
  recommendations: CatalogMovie[];
}

export interface CastMember { tmdbId: number; name: string; character: string | null; profilePath: string | null; }
export interface CatalogPerson { tmdbId: number; name: string; profilePath: string | null; knownFor: CatalogMovie[]; }
export interface PersonDetails extends CatalogPerson { biography: string | null; movies: CatalogMovie[]; }

export type CatalogCollection = 'POPULAR' | 'TOP_RATED' | 'ESTABLISHED' | 'RECENT';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);

  trending(language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>(apiUrl('/api/catalog/trending'), {
      params: { language, page },
    });
  }

  discover(collection: CatalogCollection, language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>(apiUrl('/api/catalog/discover'), {
      params: { collection, language, page },
    });
  }

  search(query: string, language = 'pt-BR', page = 1): Observable<CatalogMovie[]> {
    return this.http.get<CatalogMovie[]>(apiUrl('/api/catalog/search'), {
      params: { query, language, page },
    });
  }

  details(tmdbId: number, language = 'pt-BR'): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(apiUrl(`/api/catalog/${tmdbId}`), {
      params: { language },
    });
  }
  searchPeople(query: string, language = 'pt-BR'): Observable<CatalogPerson[]> { return this.http.get<CatalogPerson[]>(apiUrl('/api/catalog/people/search'), { params: { query, language } }); }
  personDetails(tmdbId: number, language = 'pt-BR'): Observable<PersonDetails> { return this.http.get<PersonDetails>(apiUrl(`/api/catalog/people/${tmdbId}`), { params: { language } }); }
  trendingSeries(language = 'pt-BR', page = 1): Observable<CatalogSeries[]> { return this.http.get<CatalogSeries[]>(apiUrl('/api/catalog/series/trending'), { params: { language, page } }); }
  searchSeries(query: string, language = 'pt-BR', page = 1): Observable<CatalogSeries[]> { return this.http.get<CatalogSeries[]>(apiUrl('/api/catalog/series/search'), { params: { query, language, page } }); }
  seriesDetails(tmdbId: number, language = 'pt-BR'): Observable<SeriesDetails> { return this.http.get<SeriesDetails>(apiUrl(`/api/catalog/series/${tmdbId}`), { params: { language } }); }
  seasonDetails(seriesTmdbId: number, seasonNumber: number, language = 'pt-BR'): Observable<SeasonDetails> { return this.http.get<SeasonDetails>(apiUrl(`/api/catalog/series/${seriesTmdbId}/seasons/${seasonNumber}`), { params: { language } }); }
}

export interface CatalogSeries {
  tmdbId: number;
  name: string;
  originalName: string | null;
  firstAirDate: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  popularity: number | null;
}

export interface SeriesSeason {
  tmdbId: number;
  seasonNumber: number;
  name: string;
  overview: string | null;
  airDate: string | null;
  posterPath: string | null;
  episodeCount: number;
}

export interface SeriesEpisode {
  tmdbId: number;
  episodeNumber: number;
  name: string;
  overview: string | null;
  airDate: string | null;
  stillPath: string | null;
  runtimeMinutes: number;
}

export interface SeriesDetails {
  series: CatalogSeries;
  tagline: string | null;
  genres: string[];
  status: string | null;
  numberOfSeasons: number;
  cast: CastMember[];
  trailerUrl: string | null;
  seasons: SeriesSeason[];
}

export interface SeasonDetails { season: SeriesSeason; episodes: SeriesEpisode[]; }
