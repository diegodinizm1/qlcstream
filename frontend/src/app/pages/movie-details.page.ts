import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CatalogApiService, MovieDetails } from '../core/catalog-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-movie-details-page',
  imports: [RouterLink],
  styleUrl: './movie-details.page.scss',
  template: `
    @switch (state()) {
      @case ('loading') {
        <div class="page details-state" aria-live="polite"><i class="ph ph-spinner-gap"></i><p>Carregando detalhes do filme.</p></div>
      }
      @case ('error') {
        <div class="page details-state details-error"><i class="ph ph-warning-circle"></i><div><strong>Não foi possível carregar este filme.</strong><p>{{ errorMessage() }}</p><a class="btn btn-quiet" routerLink="/catalog">Voltar ao catálogo</a></div></div>
      }
      @default {
        @if (movie(); as details) {
          <section class="details-hero" aria-labelledby="movie-title">
            @if (details.backdropPath) { <img [src]="backdropUrl(details)" [alt]="'Cena de ' + details.title" /> }
            <div class="details-shade"></div>
            <div class="page details-hero-content"><a class="back-link" routerLink="/catalog"><i class="ph ph-arrow-left"></i>Catálogo</a></div>
          </section>

          <main class="page details-content">
            <div class="details-layout">
              <aside class="detail-poster">
                @if (details.posterPath) { <img [src]="posterUrl(details)" [alt]="'Pôster de ' + details.title" /> }
                @else { <span><i class="ph ph-film-strip"></i></span> }
              </aside>
              <article class="details-copy">
                <p class="detail-kicker">{{ year(details) }} @if (details.runtimeMinutes) { <span>{{ runtime(details.runtimeMinutes) }}</span> } <span><i class="ph-fill ph-star"></i>{{ rating(details) }}</span></p>
                <h1 id="movie-title">{{ details.title }}</h1>
                @if (details.originalTitle && details.originalTitle !== details.title) { <p class="original-title">{{ details.originalTitle }}</p> }
                @if (details.tagline) { <p class="tagline">{{ details.tagline }}</p> }
                @if (details.genres.length) { <ul class="genre-list" aria-label="Gêneros">@for (genre of details.genres; track genre) { <li>{{ genre }}</li> }</ul> }
                <section class="overview" aria-labelledby="overview-title"><h2 id="overview-title">Sinopse</h2><p>{{ details.overview || 'Sinopse ainda não disponível.' }}</p></section>
              </article>
            </div>
          </main>
        }
      }
    }
  `,
})
export class MovieDetailsPage {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly movie = signal<MovieDetails | null>(null);
  readonly errorMessage = signal('Confira a conexão com o TMDB e tente novamente.');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tmdbId = Number(params.get('tmdbId'));
      if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
        this.errorMessage.set('O identificador do filme é inválido.');
        this.state.set('error');
        return;
      }
      this.load(tmdbId);
    });
  }

  backdropUrl(movie: MovieDetails): string {
    return movie.backdropPath ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}` : '';
  }

  posterUrl(movie: MovieDetails): string {
    return movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '';
  }

  year(movie: MovieDetails): string {
    return movie.releaseDate ? movie.releaseDate.slice(0, 4) : 'Sem data';
  }

  runtime(minutes: number): string {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  }

  rating(movie: MovieDetails): string {
    return movie.voteAverage == null ? 'N/D' : movie.voteAverage.toFixed(1);
  }

  private load(tmdbId: number): void {
    this.state.set('loading');
    this.catalogApi.details(tmdbId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (details) => {
        this.movie.set(details);
        this.state.set('ready');
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.errorMessage.set('O filme não foi encontrado no TMDB.');
        } else if (error instanceof HttpErrorResponse && error.status === 503) {
          this.errorMessage.set('A integração TMDB não está configurada.');
        }
        this.state.set('error');
      },
    });
  }
}
