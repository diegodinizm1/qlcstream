import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { CatalogApiService, CatalogCollection, CatalogMovie } from '../core/catalog-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-catalog-page',
  imports: [RouterLink],
  styleUrl: './catalog.page.scss',
  template: `
    @if (spotlightMovie(); as movie) {
      <section class="spotlight" aria-labelledby="spotlight-title">
        @if (movie.backdropPath) { <img [src]="backdropUrl(movie)" [alt]="'Cena de ' + movie.title" /> }
        <div class="spotlight-shade"></div>
        <div class="spotlight-content">
          <h1 id="spotlight-title">{{ movie.title }}</h1>
          <p class="movie-meta">{{ year(movie) }} <span><i class="ph-fill ph-star"></i>{{ rating(movie) }}</span></p>
          @if (movie.overview) { <p class="spotlight-copy">{{ movie.overview }}</p> }
          <div class="spotlight-actions">
            <a class="btn btn-primary" href="#catalog-search"><i class="ph ph-magnifying-glass"></i>Explorar catálogo</a>
            <a class="btn btn-secondary" [routerLink]="['/catalog', movie.tmdbId]"><i class="ph ph-info"></i>Detalhes</a>
          </div>
        </div>
      </section>
    }

    <div class="page catalog-content">
      <section class="discovery" aria-labelledby="discovery-title">
        <div class="discovery-copy">
          <h2 id="discovery-title">O que você quer encontrar?</h2>
          <p>Pesquise o catálogo ou navegue pelos filmes em destaque.</p>
        </div>
        <label class="catalog-search">
          <span class="sr-only">Título do filme</span>
          <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <input id="catalog-search" type="search" placeholder="Título do filme" [value]="query()" (input)="onQuery($event)" (keyup.enter)="search()" />
          <button type="button" (click)="search()">Buscar</button>
        </label>
      </section>

      <div class="filters" aria-label="Filtros rápidos">
        @for (filter of filters; track filter.collection) {
          <button type="button" [class.active]="filter.collection === activeFilter()" (click)="selectFilter(filter.collection)">{{ filter.label }}</button>
        }
      </div>

      <section aria-labelledby="popular-title">
        <div class="section-heading">
          <h2 id="popular-title">{{ sectionTitle() }}</h2>
          <span class="catalog-count">{{ movies().length }} filmes</span>
        </div>

        @switch (viewState()) {
          @case ('loading') {
            <div class="poster-grid" aria-label="Carregando filmes">
              @for (item of skeletons; track item) { <div class="poster-skeleton"><span></span><i></i><i></i></div> }
            </div>
          }
          @case ('error') {
            <div class="state-message error-state">
              <i class="ph ph-warning-circle"></i><div><strong>Não foi possível carregar o catálogo.</strong><p>{{ errorMessage() }}</p></div>
              <div class="state-actions">
                @if (configurationMissing()) { <a class="btn btn-quiet" routerLink="/settings">Configurações</a> }
                <button class="btn btn-quiet" type="button" (click)="retry()">Tentar novamente</button>
              </div>
            </div>
          }
          @default {
            @if (movies().length) {
              <div class="poster-grid">
                @for (movie of movies(); track movie.tmdbId; let index = $index) {
                  <article class="movie-card" [style.--delay]="index * 45 + 'ms'">
                    <a class="movie-link" [routerLink]="['/catalog', movie.tmdbId]" [attr.aria-label]="'Abrir detalhes de ' + movie.title">
                      <div class="poster">
                        @if (movie.posterPath && !unavailablePosterIds().has(movie.tmdbId)) {
                          <img [src]="posterUrl(movie)" [alt]="'Pôster de ' + movie.title" (error)="hidePoster(movie)" />
                        } @else { <span class="poster-placeholder"><i class="ph ph-film-strip"></i></span> }
                      </div>
                      <div class="movie-title-row"><h3>{{ movie.title }}</h3><span><i class="ph-fill ph-star"></i>{{ rating(movie) }}</span></div>
                      <p>{{ year(movie) }} @if (movie.originalTitle && movie.originalTitle !== movie.title) { <span>{{ movie.originalTitle }}</span> }</p>
                    </a>
                  </article>
                }
              </div>
            } @else {
              <div class="state-message empty-state">
                <i class="ph ph-film-strip"></i><div><strong>Nenhum filme encontrado.</strong><p>Tente outro título ou limpe a busca.</p></div>
                <button class="btn btn-quiet" type="button" (click)="clearSearch()">Limpar busca</button>
              </div>
            }
          }
        }
      </section>
    </div>
  `,
})
export class CatalogPage {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private activeRequest?: Subscription;

  readonly filters: ReadonlyArray<{ collection: CatalogCollection; label: string }> = [
    { collection: 'ESTABLISHED', label: 'Catálogo consolidado' },
    { collection: 'POPULAR', label: 'Populares' },
    { collection: 'TOP_RATED', label: 'Bem avaliados' },
    { collection: 'RECENT', label: 'Lançamentos' },
  ];
  readonly skeletons = [1, 2, 3, 4];
  readonly activeFilter = signal<CatalogCollection>('ESTABLISHED');
  readonly query = signal('');
  readonly viewState = signal<'ready' | 'loading' | 'error'>('loading');
  readonly errorMessage = signal('Confira a conexão com o backend e tente novamente.');
  readonly configurationMissing = signal(false);
  readonly lastSubmittedQuery = signal('');
  readonly movies = signal<CatalogMovie[]>([]);
  readonly unavailablePosterIds = signal<ReadonlySet<number>>(new Set());
  readonly sectionTitle = computed(() => {
    if (this.lastSubmittedQuery()) {
      return `Resultados para “${this.lastSubmittedQuery()}”`;
    }
    return this.filters.find((filter) => filter.collection === this.activeFilter())?.label ?? 'Catálogo';
  });
  readonly spotlightMovie = computed(() => this.movies().find((movie) => Boolean(movie.backdropPath)) ?? this.movies()[0]);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const query = params.get('q')?.trim() ?? '';
      this.query.set(query);
      if (query) {
        this.lastSubmittedQuery.set(query);
        this.load(this.catalogApi.search(query));
      } else {
        this.loadTrending();
      }
    });
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  search(): void {
    const query = this.query().trim();
    if (query === this.lastSubmittedQuery()) {
      this.retry();
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query || null },
      queryParamsHandling: 'merge',
    });
  }

  retry(): void {
    const query = this.lastSubmittedQuery();
    this.load(query ? this.catalogApi.search(query) : this.catalogApi.discover(this.activeFilter()));
  }

  selectFilter(collection: CatalogCollection): void {
    if (this.lastSubmittedQuery()) {
      this.activeFilter.set(collection);
      this.clearSearch();
      return;
    }
    if (collection === this.activeFilter()) {
      return;
    }
    this.activeFilter.set(collection);
    this.loadCollection();
  }

  clearSearch(): void {
    this.query.set('');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null },
      queryParamsHandling: 'merge',
    });
  }

  posterUrl(movie: CatalogMovie): string {
    return movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '';
  }

  backdropUrl(movie: CatalogMovie): string {
    return movie.backdropPath ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}` : '';
  }

  hidePoster(movie: CatalogMovie): void {
    this.unavailablePosterIds.update((ids) => new Set(ids).add(movie.tmdbId));
  }

  year(movie: CatalogMovie): number | string {
    return movie.releaseDate ? Number(movie.releaseDate.slice(0, 4)) : 'Sem data';
  }

  rating(movie: CatalogMovie): string {
    return movie.voteAverage == null ? 'N/D' : movie.voteAverage.toFixed(1);
  }

  private loadTrending(): void {
    this.lastSubmittedQuery.set('');
    this.loadCollection();
  }

  private loadCollection(): void {
    this.load(this.catalogApi.discover(this.activeFilter()));
  }

  private load(request: Observable<CatalogMovie[]>): void {
    this.activeRequest?.unsubscribe();
    this.viewState.set('loading');
    this.configurationMissing.set(false);
    this.unavailablePosterIds.set(new Set());
    this.activeRequest = request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.viewState.set('ready');
      },
      error: (error: unknown) => {
        this.movies.set([]);
        this.describeError(error);
        this.viewState.set('error');
      },
    });
  }

  private describeError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 503) {
      this.configurationMissing.set(true);
      this.errorMessage.set(typeof error.error?.detail === 'string'
        ? error.error.detail
        : 'Configure o token do TMDB para carregar o catálogo.');
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.errorMessage.set('O backend local não está respondendo. Confira os serviços do Docker.');
      return;
    }
    this.errorMessage.set('O catálogo não respondeu como esperado. Tente novamente em instantes.');
  }
}
