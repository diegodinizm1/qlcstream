import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { LibraryApiService, LibraryItem } from '../core/library-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-library-page',
  imports: [RouterLink],
  styleUrl: './library.page.scss',
  template: `
    <div class="page library-page">
      <header class="page-heading"><div><h1>Minha biblioteca</h1><p>Filmes disponíveis no computador, organizados por versão e espaço ocupado.</p></div></header>
      <label class="library-search">
        <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
        <span class="sr-only">Filtrar arquivos da biblioteca</span>
        <input type="search" autocomplete="off" placeholder="Filtrar por título, qualidade ou arquivo" [value]="query()" (input)="updateQuery($event)" />
        @if (query()) { <button type="button" aria-label="Limpar filtro" (click)="query.set('')"><i class="ph ph-x"></i></button> }
      </label>
      @if (state() === 'loading') {
        <section class="empty-library"><i class="ph ph-spinner-gap" aria-hidden="true"></i><div><h2>Consultando a biblioteca</h2><p>Verificando os arquivos locais registrados.</p></div></section>
      } @else if (state() === 'error') {
        <section class="empty-library"><i class="ph ph-warning-circle" aria-hidden="true"></i><div><h2>Não foi possível abrir a biblioteca</h2><p>{{ errorMessage() }}</p><button class="btn btn-quiet" type="button" (click)="load()">Tentar novamente</button></div></section>
      } @else if (filteredItems().length) {
        <section class="library-list" aria-label="Arquivos disponíveis">
          @for (item of filteredItems(); track item.id) {
            <article class="library-row"><a [routerLink]="['/catalog', item.movieTmdbId]" class="library-poster">@if (item.posterPath) { <img [src]="posterUrl(item)" [alt]="'Pôster de ' + item.movieTitle" /> } @else { <i class="ph ph-film-strip"></i> }</a><div><a [routerLink]="['/catalog', item.movieTmdbId]">{{ item.movieTitle }}</a><p>{{ item.relativePath }}</p><span>{{ quality(item) }}</span></div><div class="library-actions"><strong>{{ size(item.sizeBytes) }}</strong><button class="icon-button delete-file" type="button" [disabled]="deletingId() === item.id" [attr.aria-label]="'Excluir ' + item.movieTitle" (click)="remove(item)"><i class="ph ph-trash"></i></button></div></article>
          }
        </section>
      } @else if (items().length) {
        <section class="empty-library" aria-labelledby="empty-search-title"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><div><h2 id="empty-search-title">Nenhum arquivo corresponde à busca</h2><p>Experimente usar parte do título, da qualidade ou do nome do arquivo.</p><button class="btn btn-quiet" type="button" (click)="query.set('')">Limpar filtro</button></div></section>
      } @else {
        <section class="empty-library" aria-labelledby="empty-library-title"><i class="ph ph-folder-open" aria-hidden="true"></i><div><h2 id="empty-library-title">A biblioteca está vazia</h2><p>Os arquivos locais serão listados aqui depois que os primeiros downloads forem concluídos.</p></div></section>
      }
    </div>
  `,
})
export class LibraryPage {
  private readonly libraryApi = inject(LibraryApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly items = signal<LibraryItem[]>([]);
  readonly query = signal('');
  readonly filteredItems = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    if (!query) return this.items();
    return this.items().filter((item) => [item.movieTitle, item.relativePath, this.quality(item)]
      .some((value) => value.toLocaleLowerCase().includes(query)));
  });
  readonly errorMessage = signal('Confira a conexão com o backend e tente novamente.');
  readonly deletingId = signal<number | null>(null);

  constructor() { this.load(); }
  updateQuery(event: Event): void { this.query.set((event.target as HTMLInputElement).value); }
  load(): void { this.state.set('loading'); this.libraryApi.browse().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (items) => { this.items.set(items); this.state.set('ready'); }, error: (error: unknown) => { if (error instanceof HttpErrorResponse && error.status === 0) this.errorMessage.set('O backend não está acessível.'); this.state.set('error'); } }); }
  posterUrl(item: LibraryItem): string { return `https://image.tmdb.org/t/p/w185${item.posterPath}`; }
  quality(item: LibraryItem): string { return [item.resolutionHeight ? `${item.resolutionHeight}p` : null, item.sourceType, item.dynamicRange].filter(Boolean).join(' · ') || 'Versão local'; }
  size(bytes: number): string { return bytes >= 1_000_000_000 ? `${(bytes / 1_000_000_000).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 1_000_000))} MB`; }
  remove(item: LibraryItem): void {
    if (!confirm(`Excluir o arquivo local de “${item.movieTitle}”? Esta ação não pode ser desfeita.`)) return;
    this.deletingId.set(item.id);
    this.libraryApi.remove(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.items.update((items) => items.filter((current) => current.id !== item.id)); this.deletingId.set(null); }, error: () => { this.errorMessage.set('Não foi possível excluir este arquivo.'); this.deletingId.set(null); } });
  }
}
