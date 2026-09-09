import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IntegrationStatus, SystemApiService } from '../core/system-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-page',
  styleUrl: './settings.page.scss',
  template: `
    <div class="page settings-page">
      <header class="page-heading"><div><h1>Configurações</h1><p>Conexões e diretórios usados pelo QLC Stream neste computador.</p></div><button class="icon-button" type="button" aria-label="Atualizar integrações" (click)="load()"><i class="ph ph-arrows-clockwise"></i></button></header>
      <div class="settings-layout">
        <aside><a href="#integrations" class="active">Integrações</a><a href="#storage">Armazenamento</a></aside>
        <div class="settings-content">
          <section id="integrations">
            <div class="section-heading"><h2>Integrações</h2><span class="status" [class.status-offline]="state() === 'error'">{{ state() === 'error' ? 'Backend indisponível' : 'Estado do ambiente' }}</span></div>
            <div class="integration-list">
              @for (integration of integrationList; track integration.id) {
                <article>
                  <div class="integration-icon"><i [class]="integration.icon"></i></div>
                  <div><h3>{{ integration.name }}</h3><p>{{ integration.description }}</p></div>
                  <span class="connection" [class.connected]="configured(integration.id)" [class.pending]="!configured(integration.id)">{{ configured(integration.id) ? 'Configurado' : 'Falta configurar' }}</span>
                </article>
              }
            </div>
            <p class="environment-note"><i class="ph ph-terminal-window"></i>Preencha as variáveis no arquivo <code>.env</code> e atualize os contêineres. As credenciais não são exibidas aqui.</p>
          </section>
          <section id="storage">
            <div class="section-heading"><h2>Armazenamento</h2></div>
            <div class="storage-form">
              <label class="field"><span>Nome do diretório</span><input class="input" value="Biblioteca principal" readonly /></label>
              <label class="field"><span>Caminho no contêiner</span><input class="input mono" value="/data" readonly /></label>
              <p><i class="ph ph-info"></i>O caminho do computador é definido por <code>MEDIA_HOST_PATH</code> no ambiente local.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class SettingsPage {
  private readonly systemApi = inject(SystemApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly integrations = signal<IntegrationStatus[]>([]);
  readonly integrationList = [
    { id: 'tmdb' as const, name: 'TMDB', description: 'Metadados, capas e lançamentos.', icon: 'ph ph-film-strip' },
    { id: 'prowlarr' as const, name: 'Prowlarr', description: 'Busca nos indexadores configurados.', icon: 'ph ph-binoculars' },
    { id: 'qbittorrent' as const, name: 'qBittorrent', description: 'Motor de downloads e monitoramento.', icon: 'ph ph-download-simple' },
  ];

  constructor() { this.load(); }
  load(): void { this.state.set('loading'); this.systemApi.integrations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (integrations) => { this.integrations.set(integrations); this.state.set('ready'); }, error: () => this.state.set('error') }); }
  configured(id: IntegrationStatus['id']): boolean { return this.integrations().some((integration) => integration.id === id && integration.configured); }
}
