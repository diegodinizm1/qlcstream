import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-downloads-page', template: `
  <section class="page"><p class="eyebrow">Transferências</p><h1>Downloads sob controle.</h1><p class="lede">Acompanhe progresso, velocidade e tempo restante quando o qBittorrent for conectado.</p>
  <div class="stat-grid"><div class="stat"><span>Ativos</span><strong>0</strong></div><div class="stat"><span>Velocidade</span><strong>0 MB/s</strong></div><div class="stat"><span>Na fila</span><strong>0</strong></div></div></section>` })
export class DownloadsPage {}
