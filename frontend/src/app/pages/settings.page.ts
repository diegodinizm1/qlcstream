import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-page',
  styleUrl: './settings.page.scss',
  template: `
    <div class="page settings-page">
      <header class="page-heading"><div><h1>Configurações</h1><p>Conexões e diretórios usados pelo QLC Stream neste computador.</p></div></header>

      <div class="settings-layout">
        <aside><a href="#integrations" class="active">Integrações</a><a href="#storage">Armazenamento</a><a href="#downloads">Downloads</a></aside>
        <div class="settings-content">
          <section id="integrations">
            <div class="section-heading"><h2>Integrações</h2><span class="status">Backend conectado</span></div>
            <div class="integration-list">
              <article><div class="integration-icon"><i class="ph ph-film-strip"></i></div><div><h3>TMDB</h3><p>Metadados, capas e lançamentos.</p></div><span class="connection pending">Aguardando token</span><button class="icon-button" type="button" aria-label="Configurar TMDB"><i class="ph ph-caret-right"></i></button></article>
              <article><div class="integration-icon"><i class="ph ph-binoculars"></i></div><div><h3>Prowlarr</h3><p>Busca nos indexadores configurados.</p></div><span class="connection">Não configurado</span><button class="icon-button" type="button" aria-label="Configurar Prowlarr"><i class="ph ph-caret-right"></i></button></article>
              <article><div class="integration-icon"><i class="ph ph-download-simple"></i></div><div><h3>qBittorrent</h3><p>Motor de downloads e monitoramento.</p></div><span class="connection">Não configurado</span><button class="icon-button" type="button" aria-label="Configurar qBittorrent"><i class="ph ph-caret-right"></i></button></article>
            </div>
          </section>

          <section id="storage">
            <div class="section-heading"><h2>Armazenamento</h2></div>
            <div class="storage-form">
              <label class="field"><span>Nome do diretório</span><input class="input" value="Biblioteca principal" /></label>
              <label class="field"><span>Caminho no contêiner</span><input class="input mono" value="/data" readonly /></label>
              <p><i class="ph ph-info"></i>O caminho do computador é definido por <code>MEDIA_HOST_PATH</code> no ambiente local.</p>
              <button class="btn btn-primary" type="button">Salvar alterações</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class SettingsPage {}
