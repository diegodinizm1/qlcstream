import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CatalogApiService, MovieDetails } from '../core/catalog-api.service';
import { DownloadsApiService } from '../core/downloads-api.service';
import { ReleaseOption, ReleasesApiService } from '../core/releases-api.service';

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
                <button class="btn btn-primary release-button" type="button" (click)="openReleases(details)"><i class="ph ph-download-simple"></i>Opções de download</button>
                <section class="overview" aria-labelledby="overview-title"><h2 id="overview-title">Sinopse</h2><p>{{ details.overview || 'Sinopse ainda não disponível.' }}</p></section>
              </article>
            </div>
          </main>
          @if (showReleases()) { <div class="release-overlay" role="presentation" (click)="closeReleases()"><section class="release-modal" role="dialog" aria-modal="true" aria-labelledby="release-title" (click)="$event.stopPropagation()"><header><div><p>FONTES DISPONÍVEIS</p><h2 id="release-title">{{ details.title }}</h2></div><button class="icon-button" type="button" aria-label="Fechar" (click)="closeReleases()"><i class="ph ph-x"></i></button></header>@if (submissionMessage()) { <p class="submission-message">{{ submissionMessage() }}</p> } @if (releaseState() === 'loading') { <div class="release-state"><i class="ph ph-spinner-gap"></i>Buscando opções no Prowlarr.</div> } @else if (releaseState() === 'error') { <div class="release-state error">Não foi possível buscar opções. Confira o Prowlarr e tente novamente.</div> } @else if (!releases().length) { <div class="release-state">Nenhuma opção encontrada para este título.</div> } @else { <div class="release-list">@for (release of releases(); track releaseKey(release)) { <article><div><strong>{{ release.title }}</strong><p>{{ release.indexer || 'Indexador' }} · {{ release.seeders ?? 0 }} seeders · {{ size(release.size) }}</p></div><div class="release-actions"><a class="btn btn-quiet" [href]="release.infoUrl || acquisitionRef(release)" target="_blank" rel="noreferrer">Ver fonte</a><button class="btn btn-primary" type="button" [disabled]="!acquisitionRef(release) || submittingRelease() === acquisitionRef(release)" (click)="enqueue(details, release)">@if (submittingRelease() === acquisitionRef(release)) { Enviando… } @else { Baixar }</button></div></article> }</div> }</section></div> }
        }
      }
    }
  `,
})
export class MovieDetailsPage {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly releasesApi = inject(ReleasesApiService);
  private readonly downloadsApi = inject(DownloadsApiService);

  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly movie = signal<MovieDetails | null>(null);
  readonly errorMessage = signal('Confira a conexão com o TMDB e tente novamente.');
  readonly showReleases = signal(false);
  readonly releaseState = signal<'loading' | 'ready' | 'error'>('ready');
  readonly releases = signal<ReleaseOption[]>([]);
  readonly submittingRelease = signal<string | null>(null);
  readonly submissionMessage = signal<string | null>(null);

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
  openReleases(movie: MovieDetails): void { this.showReleases.set(true); this.releaseState.set('loading'); this.submissionMessage.set(null); const query = `${movie.originalTitle || movie.title} ${this.year(movie)}`; this.releasesApi.search(query, this.year(movie)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (releases) => { this.releases.set(releases); this.releaseState.set('ready'); }, error: () => this.releaseState.set('error') }); }
  closeReleases(): void { this.showReleases.set(false); }
  size(bytes: number | null): string { return bytes ? `${(bytes / 1_000_000_000).toFixed(1)} GB` : 'Tamanho não informado'; }
  enqueue(movie: MovieDetails, release: ReleaseOption): void {
    const acquisitionRef = this.acquisitionRef(release);
    if (!acquisitionRef) return;
    this.submittingRelease.set(acquisitionRef);
    this.submissionMessage.set(null);
    const title = release.title.toLowerCase();
    const resolution = title.includes('2160p') ? 2160 : title.includes('1080p') ? 1080 : title.includes('720p') ? 720 : null;
    const source = title.includes('web-dl') ? 'WEB-DL' : title.includes('webrip') ? 'WEBRip' : title.includes('bluray') ? 'BluRay' : null;
    const dynamicRange = title.includes('hdr') ? 'HDR' : null;
    this.downloadsApi.enqueue({ movieTmdbId: movie.tmdbId, releaseTitle: release.title, acquisitionRef, indexerName: release.indexer, resolutionHeight: resolution, sourceType: source, dynamicRange }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.submissionMessage.set('Enviado ao qBittorrent. Acompanhe o andamento em Downloads.'); this.submittingRelease.set(null); }, error: () => { this.submissionMessage.set('Não foi possível enviar esta fonte ao qBittorrent.'); this.submittingRelease.set(null); } });
  }
  acquisitionRef(release: ReleaseOption): string { return release.magnetUrl || release.downloadUrl || ''; }
  releaseKey(release: ReleaseOption): string { return this.acquisitionRef(release) || release.infoUrl || release.title; }

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
