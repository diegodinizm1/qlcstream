import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-downloads-page',
  styleUrl: './downloads.page.scss',
  template: `
    <div class="page downloads-page">
      <header class="page-heading">
        <div><h1>Downloads</h1><p>Acompanhe transferências e organize o que entra na biblioteca.</p></div>
        <button class="btn btn-quiet" type="button"><i class="ph ph-pause"></i>Pausar todos</button>
      </header>

      <!-- Dados ilustrativos enquanto qBittorrent não está conectado. -->
      <section class="transfer-overview" aria-label="Resumo das transferências">
        <div><span>Velocidade atual</span><strong>8,6 <small>MB/s</small></strong></div>
        <div><span>Tempo restante</span><strong>42 <small>min</small></strong></div>
        <div class="storage"><span>Biblioteca principal</span><strong>1,8 TB livres</strong><p>de 4 TB</p></div>
      </section>

      <section class="queue" aria-labelledby="active-title">
        <div class="section-heading"><h2 id="active-title">Em andamento</h2><span class="status">Motor disponível</span></div>
        <article class="download-row">
          <img src="/posters/deep-water.png" alt="Pôster de Maré profunda" />
          <div class="download-info"><h3>Maré profunda</h3><p>2160p WEB-DL <span>HDR10</span> <span>HEVC</span></p><strong>18,4 GB</strong></div>
          <div class="progress-block"><div><span>64%</span><span>8,6 MB/s</span><span>42 min</span></div><progress value="64" max="100">64%</progress><p>11,8 GB de 18,4 GB</p></div>
          <div class="row-actions"><button class="icon-button" type="button" aria-label="Pausar"><i class="ph ph-pause"></i></button><button class="icon-button" type="button" aria-label="Mais ações"><i class="ph ph-dots-three"></i></button></div>
        </article>
      </section>

      <section class="queue" aria-labelledby="waiting-title">
        <div class="section-heading"><h2 id="waiting-title">Na fila</h2><span class="queue-count">1 item</span></div>
        <article class="download-row queued">
          <img src="/posters/afterimage.png" alt="Pôster de Depois da imagem" />
          <div class="download-info"><h3>Depois da imagem</h3><p>1080p BluRay <span>AVC</span></p><strong>7,2 GB</strong></div>
          <div class="progress-block"><div><span>Aguardando</span><span>0 MB/s</span></div><progress value="0" max="100">0%</progress><p>Inicia após Maré profunda</p></div>
          <div class="row-actions"><button class="icon-button" type="button" aria-label="Iniciar agora"><i class="ph ph-play"></i></button><button class="icon-button" type="button" aria-label="Mais ações"><i class="ph ph-dots-three"></i></button></div>
        </article>
      </section>
    </div>
  `,
})
export class DownloadsPage {}
