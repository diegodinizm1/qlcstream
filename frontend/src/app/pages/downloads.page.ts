import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-downloads-page',
  styleUrl: './downloads.page.scss',
  template: `
    <div class="page downloads-page">
      <header class="page-heading"><div><h1>Downloads</h1><p>Acompanhe transferências e organize o que entra na biblioteca.</p></div></header>
      <section class="empty-downloads" aria-labelledby="empty-downloads-title">
        <i class="ph ph-download-simple" aria-hidden="true"></i>
        <div><h2 id="empty-downloads-title">Nenhum download em andamento</h2><p>As transferências aparecerão aqui quando o motor de downloads estiver conectado.</p></div>
      </section>
    </div>
  `,
})
export class DownloadsPage {}
