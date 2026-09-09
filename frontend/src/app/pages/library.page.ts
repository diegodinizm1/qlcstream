import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-library-page',
  styleUrl: './library.page.scss',
  template: `
    <div class="page library-page">
      <header class="page-heading">
        <div><h1>Minha biblioteca</h1><p>Filmes disponíveis no computador, organizados por versão e espaço ocupado.</p></div>
        <button class="btn btn-quiet" type="button"><i class="ph ph-arrows-clockwise"></i>Verificar arquivos</button>
      </header>

      <section class="library-summary" aria-label="Resumo da biblioteca">
        <div><strong>4</strong><span>filmes</span></div><div><strong>61,7 GB</strong><span>em arquivos</span></div><div><strong>4K</strong><span>melhor qualidade</span></div>
        <label class="sort-control"><span>Ordenar por</span><select class="select"><option>Adicionados recentemente</option><option>Título</option><option>Tamanho</option></select></label>
      </section>

      <section class="library-grid" aria-label="Filmes na biblioteca">
        @for (movie of movies; track movie.title) {
          <article>
            <button class="library-poster" type="button" [attr.aria-label]="'Abrir ' + movie.title"><img [src]="movie.poster" [alt]="'Pôster de ' + movie.title" /><span><i class="ph ph-folder-open"></i></span></button>
            <div><h2>{{ movie.title }}</h2><p>{{ movie.year }} <span>{{ movie.quality }}</span></p><small>{{ movie.size }}</small></div>
          </article>
        }
      </section>
    </div>
  `,
})
export class LibraryPage {
  readonly movies = [
    { title: 'Vento do alto', year: 2025, quality: '1080p', size: '8,9 GB', poster: '/posters/vento-do-alto.png' },
    { title: 'Quilômetro branco', year: 2025, quality: '2160p HDR', size: '23,1 GB', poster: '/posters/white-mile.png' },
    { title: 'Depois da imagem', year: 2026, quality: '1080p', size: '7,2 GB', poster: '/posters/afterimage.png' },
    { title: 'Maré profunda', year: 2026, quality: '2160p HDR', size: '22,5 GB', poster: '/posters/deep-water.png' },
  ];
}
