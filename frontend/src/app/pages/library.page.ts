import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-library-page',
  styleUrl: './library.page.scss',
  template: `
    <div class="page library-page">
      <header class="page-heading"><div><h1>Minha biblioteca</h1><p>Filmes disponíveis no computador, organizados por versão e espaço ocupado.</p></div></header>
      <section class="empty-library" aria-labelledby="empty-library-title">
        <i class="ph ph-folder-open" aria-hidden="true"></i>
        <div><h2 id="empty-library-title">A biblioteca está vazia</h2><p>Os arquivos locais serão listados aqui depois que os primeiros downloads forem concluídos.</p></div>
      </section>
    </div>
  `,
})
export class LibraryPage {}
