import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { CatalogApiService, CatalogMovie } from '../core/catalog-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-catalog-page',
  imports: [RouterLink],
  styleUrl: './catalog.page.scss',
  template: `
    <section class="spotlight" aria-labelledby="spotlight-title">
      <img src="/posters/deep-water.png" alt="Cidade costeira sob chuva durante a noite" />
      <div class="spotlight-shade"></div>
      <div class="spotlight-content">
        <h1 id="spotlight-title">Maré profunda</h1>
        <p class="movie-meta">2026 <span>Ficção científica</span> <span>2h 14min</span></p>
        <p class="spotlight-copy">Uma cartógrafa encontra uma cidade que desaparece do mapa a cada amanhecer.</p>
        <div class="spotlight-actions">
          <button class="btn btn-primary" type="button"><i class="ph ph-magnifying-glass"></i>Encontrar arquivo</button>
          <button class="btn btn-secondary" type="button"><i class="ph ph-info"></i>Detalhes</button>
        </div>
      </div>
    </section>

    <div class="page catalog-content">
      <section class="discovery" aria-labelledby="discovery-title">
        <div class="discovery-copy">
          <h2 id="discovery-title">O que você quer encontrar?</h2>
          <p>Pesquise o catálogo ou navegue pelos filmes em destaque.</p>
        </div>
        <label class="catalog-search">
          <span class="sr-only">Título do filme</span>
          <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <input type="search" placeholder="Título do filme" [value]="query()" (input)="onQuery($event)" (keyup.enter)="search()" />
          <button type="button" (click)="search()">Buscar</button>
        </label>
      </section>

      <div class="filters" aria-label="Filtros rápidos">
        @for (filter of filters; track filter) {
          <button type="button" [class.active]="filter === activeFilter()" (click)="activeFilter.set(filter)">{{ filter }}</button>
        }
      </div>

      <section aria-labelledby="popular-title">
        <div class="section-heading">
          <h2 id="popular-title">{{ sectionTitle() }}</h2>
          <span class="catalog-count">{{ filteredMovies().length }} filmes</span>
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
            @if (filteredMovies().length) {
              <div class="poster-grid">
                @for (movie of filteredMovies(); track movie.tmdbId; let index = $index) {
                  <article class="movie-card" [style.--delay]="index * 45 + 'ms'">
                    <button class="poster" type="button" [attr.aria-label]="'Abrir ' + movie.title">
                      <img [src]="posterUrl(movie, index)" [alt]="'Pôster de ' + movie.title" (error)="usePosterFallback($event, index)" />
                      <span class="poster-action"><i class="ph ph-download-simple"></i></span>
                    </button>
                    <div class="movie-title-row"><h3>{{ movie.title }}</h3><span><i class="ph-fill ph-star"></i>{{ rating(movie) }}</span></div>
                    <p>{{ year(movie) }} @if (movie.originalTitle && movie.originalTitle !== movie.title) { <span>{{ movie.originalTitle }}</span> }</p>
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
  private readonly posterFallbacks = ['/posters/deep-water.png', '/posters/white-mile.png', '/posters/afterimage.png', '/posters/vento-do-alto.png'];
  private activeRequest?: Subscription;

  readonly filters = ['Todos', 'Lançamentos', 'Mais bem avaliados'];
  readonly skeletons = [1, 2, 3, 4];
  readonly activeFilter = signal('Todos');
  readonly query = signal('');
  readonly viewState = signal<'ready' | 'loading' | 'error'>('loading');
  readonly errorMessage = signal('Confira a conexão com o backend e tente novamente.');
  readonly configurationMissing = signal(false);
  readonly lastSubmittedQuery = signal('');
  readonly movies = signal<CatalogMovie[]>([]);
  readonly sectionTitle = computed(() => this.lastSubmittedQuery()
    ? `Resultados para “${this.lastSubmittedQuery()}”`
    : 'Em alta nesta semana');

  readonly filteredMovies = computed(() => {
    const filter = this.activeFilter();
    const currentYear = new Date().getFullYear();
    return this.movies().filter((movie) => {
      return filter === 'Todos'
        || (filter === 'Lançamentos' && this.year(movie) === currentYear)
        || (filter === 'Mais bem avaliados' && (movie.voteAverage ?? 0) >= 8);
    });
  });

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
    this.load(query ? this.catalogApi.search(query) : this.catalogApi.trending());
  }

  clearSearch(): void {
    this.query.set('');
    this.activeFilter.set('Todos');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null },
      queryParamsHandling: 'merge',
    });
  }

  posterUrl(movie: CatalogMovie, index: number): string {
    return movie.posterPath
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
      : this.posterFallbacks[index % this.posterFallbacks.length];
  }

  usePosterFallback(event: Event, index: number): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = this.posterFallbacks[index % this.posterFallbacks.length];
  }

  year(movie: CatalogMovie): number | string {
    return movie.releaseDate ? Number(movie.releaseDate.slice(0, 4)) : 'Sem data';
  }

  rating(movie: CatalogMovie): string {
    return movie.voteAverage == null ? 'N/D' : movie.voteAverage.toFixed(1);
  }

  private loadTrending(): void {
    this.lastSubmittedQuery.set('');
    this.load(this.catalogApi.trending());
  }

  private load(request: Observable<CatalogMovie[]>): void {
    this.activeRequest?.unsubscribe();
    this.viewState.set('loading');
    this.configurationMissing.set(false);
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
