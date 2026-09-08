import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-settings-page', template: `
  <section class="page"><p class="eyebrow">Configurações locais</p><h1>Integrações e armazenamento.</h1><p class="lede">O estado do TMDB, dos indexadores, do motor de download e dos diretórios será reunido nesta tela.</p>
  <div class="empty-panel"><strong>Biblioteca principal</strong><p>O contêiner usa <code>/data</code>. O caminho do computador é definido por <code>MEDIA_HOST_PATH</code>.</p></div></section>` })
export class SettingsPage {}
