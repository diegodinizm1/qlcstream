import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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

  readonly globalQuery = signal('');
  readonly theme = signal<'dark' | 'light'>(
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.globalQuery.set(params.get('q') ?? '');
    });
  }

  toggleTheme(): void {
    this.theme.update((current) => current === 'dark' ? 'light' : 'dark');
  }

  updateGlobalQuery(event: Event): void {
    this.globalQuery.set((event.target as HTMLInputElement).value);
  }

  searchCatalog(event: Event): void {
    event.preventDefault();
    const query = this.globalQuery().trim();
    void this.router.navigate(['/catalog'], { queryParams: { q: query || null } });
  }
}
