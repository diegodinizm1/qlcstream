import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface CatalogMovie {
  title: string;
  originalTitle: string;
  year: number;
  genre: string;
  rating: string;
  poster: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-catalog-page',
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
          <h2 id="popular-title">Em alta nesta semana</h2>
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
              <i class="ph ph-warning-circle"></i><div><strong>Não foi possível carregar o catálogo.</strong><p>Confira a conexão com o TMDB e tente novamente.</p></div>
              <button class="btn btn-quiet" type="button" (click)="retry()">Tentar novamente</button>
            </div>
          }
          @default {
            @if (filteredMovies().length) {
              <div class="poster-grid">
                @for (movie of filteredMovies(); track movie.title; let index = $index) {
                  <article class="movie-card" [style.--delay]="index * 45 + 'ms'">
                    <button class="poster" type="button" [attr.aria-label]="'Abrir ' + movie.title">
                      <img [src]="movie.poster" [alt]="'Pôster de ' + movie.title" />
                      <span class="poster-action"><i class="ph ph-download-simple"></i></span>
                    </button>
                    <div class="movie-title-row"><h3>{{ movie.title }}</h3><span><i class="ph-fill ph-star"></i>{{ movie.rating }}</span></div>
                    <p>{{ movie.year }} <span>{{ movie.genre }}</span></p>
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
  readonly filters = ['Todos', 'Lançamentos', 'Mais bem avaliados', 'Ficção científica', 'Drama'];
  readonly skeletons = [1, 2, 3, 4];
  readonly activeFilter = signal('Todos');
  readonly query = signal('');
  readonly viewState = signal<'ready' | 'loading' | 'error'>('ready');

  private readonly movies: CatalogMovie[] = [
    { title: 'Maré profunda', originalTitle: 'Deep Water', year: 2026, genre: 'Ficção científica', rating: '8.1', poster: '/posters/deep-water.png' },
    { title: 'Quilômetro branco', originalTitle: 'White Mile', year: 2025, genre: 'Drama', rating: '7.7', poster: '/posters/white-mile.png' },
    { title: 'Depois da imagem', originalTitle: 'Afterimage', year: 2026, genre: 'Suspense', rating: '7.9', poster: '/posters/afterimage.png' },
    { title: 'Vento do alto', originalTitle: 'High Wind', year: 2025, genre: 'Drama', rating: '8.4', poster: '/posters/vento-do-alto.png' },
  ];

  readonly filteredMovies = computed(() => {
    const term = this.query().trim().toLocaleLowerCase('pt-BR');
    const filter = this.activeFilter();
    return this.movies.filter((movie) => {
      const matchesTerm = !term || `${movie.title} ${movie.originalTitle} ${movie.year}`.toLocaleLowerCase('pt-BR').includes(term);
      const matchesFilter = filter === 'Todos'
        || (filter === 'Lançamentos' && movie.year === 2026)
        || (filter === 'Mais bem avaliados' && Number(movie.rating) >= 8)
        || movie.genre === filter;
      return matchesTerm && matchesFilter;
    });
  });

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  search(): void {
    this.viewState.set('loading');
    window.setTimeout(() => this.viewState.set('ready'), 320);
  }

  retry(): void {
    this.search();
  }

  clearSearch(): void {
    this.query.set('');
    this.activeFilter.set('Todos');
  }
}
