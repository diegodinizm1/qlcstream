import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { CatalogApiService, CatalogMovie } from './core/catalog-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly queryChanges = new Subject<string>();

  readonly globalQuery = signal('');
  readonly suggestions = signal<CatalogMovie[]>([]);
  readonly autocompleteOpen = signal(false);
  readonly theme = signal<'dark' | 'light'>(
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.globalQuery.set(params.get('q') ?? '');
    });
    this.queryChanges.pipe(
      debounceTime(220),
      distinctUntilChanged(),
      switchMap((query) => query.length < 2
        ? of([])
        : this.catalogApi.search(query).pipe(catchError(() => of([])))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((movies) => this.suggestions.set(movies.slice(0, 6)));
  }

  toggleTheme(): void {
    this.theme.update((current) => current === 'dark' ? 'light' : 'dark');
  }

  updateGlobalQuery(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.globalQuery.set(query);
    this.autocompleteOpen.set(true);
    this.queryChanges.next(query.trim());
  }

  openAutocomplete(): void {
    this.autocompleteOpen.set(true);
  }

  closeAutocomplete(): void {
    window.setTimeout(() => this.autocompleteOpen.set(false), 140);
  }

  selectSuggestion(movie: CatalogMovie): void {
    this.globalQuery.set(movie.title);
    this.suggestions.set([]);
    this.autocompleteOpen.set(false);
    void this.router.navigate(['/catalog', movie.tmdbId]);
  }

  searchCatalog(event: Event): void {
    event.preventDefault();
    const query = this.globalQuery().trim();
    this.autocompleteOpen.set(false);
    void this.router.navigate(['/catalog'], { queryParams: { q: query || null } });
  }
}
