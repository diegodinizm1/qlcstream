import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CatalogApiService, CatalogMovie } from './catalog-api.service';

describe('CatalogApiService', () => {
  let service: CatalogApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the weekly catalog in Brazilian Portuguese', () => {
    const movies: CatalogMovie[] = [{
      id: 1,
      tmdbId: 42,
      title: 'Filme de teste',
      originalTitle: 'Test Movie',
      releaseDate: '2026-04-03',
      overview: 'Uma cidade desaparece do mapa.',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      voteAverage: 8.1,
    }];

    service.trending().subscribe((result) => expect(result).toEqual(movies));

    const request = http.expectOne((candidate) => candidate.url === '/api/catalog/trending');
    expect(request.request.params.get('language')).toBe('pt-BR');
    expect(request.request.params.get('page')).toBe('1');
    request.flush(movies);
  });

  it('sends the submitted title to catalog search', () => {
    service.search('Matrix').subscribe();

    const request = http.expectOne((candidate) => candidate.url === '/api/catalog/search');
    expect(request.request.params.get('query')).toBe('Matrix');
    request.flush([]);
  });
});
