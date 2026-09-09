import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IntegrationStatus, SystemApiService } from '../core/system-api.service';
import { LibraryApiService } from '../core/library-api.service';
import { DesktopFileService } from '../core/desktop-file.service';
import { isDesktopApp } from '../core/api-url';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-page',
  styleUrl: './settings.page.scss',
  template: `
    <div class="page settings-page">
      <header class="settings-header">
        <div><p class="settings-label">Neste computador</p><h1>Configurações</h1><p>Escolha onde os novos downloads serão guardados e confira se o aplicativo está pronto para usar.</p></div>
        <button class="icon-button refresh-button" type="button" [disabled]="state() === 'loading'" aria-label="Atualizar status" (click)="load()"><i class="ph ph-arrows-clockwise"></i></button>
      </header>

      <section class="readiness" [class.needs-attention]="!allConfigured()" aria-live="polite">
        <div class="readiness-icon"><i [class]="allConfigured() ? 'ph ph-check-circle' : 'ph ph-warning-circle'"></i></div>
        <div><p>Status do aplicativo</p><h2>{{ readinessTitle() }}</h2><span>{{ readinessDescription() }}</span></div>
        <strong>{{ configuredCount() }}/{{ integrationList.length }} prontos</strong>
      </section>

      <section class="settings-section storage-section" aria-labelledby="storage-title">
        <header><div><h2 id="storage-title">Pasta dos downloads</h2><p>Os próximos filmes serão organizados nesta pasta da sua biblioteca.</p></div></header>
        <div class="storage-panel">
          <label class="field"><span>Nome da pasta</span><div class="folder-input"><i class="ph ph-folder-simple"></i><span>Biblioteca /</span><input [value]="downloadDirectory()" (input)="downloadDirectory.set($any($event.target).value)" placeholder="filmes" /></div></label>
          @if (desktop()) { <button class="choose-folder" type="button" [disabled]="choosingDirectory()" (click)="chooseDownloadDirectory()"><i class="ph ph-folder-open"></i>{{ choosingDirectory() ? 'Abrindo pastas' : 'Escolher pasta' }}</button> }
          <p class="storage-help"><i class="ph ph-info"></i>Use subpastas se quiser, como <code>filmes/4k</code> ou <code>filmes/para-ver</code>.</p>
          <div class="storage-footer"><button class="btn btn-primary" type="button" [disabled]="savingStorage()" (click)="saveStorage()">{{ savingStorage() ? 'Salvando' : 'Salvar pasta' }}</button>@if (storageMessage()) { <span class="storage-message"><i class="ph ph-check-circle"></i>{{ storageMessage() }}</span> }</div>
        </div>
      </section>

      <section class="settings-section connections-section" aria-labelledby="connections-title">
        <header><div><h2 id="connections-title">O que está disponível</h2><p>Esses recursos permitem buscar filmes, encontrar opções e acompanhar seus downloads.</p></div></header>
        <div class="connection-list">
          @for (integration of integrationList; track integration.id) {
            <article><div class="connection-icon"><i [class]="integration.icon"></i></div><div><h3>{{ integration.name }}</h3><p>{{ integration.description }}</p></div><span class="connection-state" [class.ready]="configured(integration.id)" [class.waiting]="!configured(integration.id)"><i [class]="configured(integration.id) ? 'ph ph-check' : 'ph ph-warning'"></i>{{ connectionLabel(integration.id) }}</span></article>
          }
        </div>
      </section>
    </div>
  `,
})
export class SettingsPage {
  private readonly systemApi = inject(SystemApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly libraryApi = inject(LibraryApiService);
  private readonly desktopFile = inject(DesktopFileService);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly integrations = signal<IntegrationStatus[]>([]);
  readonly downloadDirectory = signal('incoming');
  readonly savingStorage = signal(false);
  readonly storageMessage = signal<string | null>(null);
  readonly desktop = signal(isDesktopApp());
  readonly choosingDirectory = signal(false);
  readonly integrationList = [
    { id: 'tmdb' as const, name: 'Catálogo de filmes', description: 'Capas, sinopses, notas e detalhes.', icon: 'ph ph-film-strip' },
    { id: 'prowlarr' as const, name: 'Opções de download', description: 'Encontra versões disponíveis para os filmes.', icon: 'ph ph-binoculars' },
    { id: 'qbittorrent' as const, name: 'Downloads', description: 'Inicia e acompanha os arquivos que você escolher.', icon: 'ph ph-download-simple' },
  ];
  readonly configuredCount = computed(() => this.integrationList.filter((item) => this.configured(item.id)).length);
  readonly allConfigured = computed(() => this.state() === 'ready' && this.configuredCount() === this.integrationList.length);

  constructor() { this.load(); this.loadStorage(); }
  readinessTitle(): string { return this.allConfigured() ? 'Tudo pronto' : this.state() === 'loading' ? 'Verificando recursos' : 'Alguns recursos precisam de atenção'; }
  readinessDescription(): string { return this.allConfigured() ? 'Você já pode explorar filmes, escolher uma versão e acompanhar seus downloads.' : this.state() === 'error' ? 'Não foi possível confirmar o status agora. Atualize para tentar novamente.' : 'Algumas ações podem ficar indisponíveis até que a configuração seja concluída.'; }
  load(): void { this.state.set('loading'); this.systemApi.integrations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (integrations) => { this.integrations.set(integrations); this.state.set('ready'); }, error: () => this.state.set('error') }); }
  configured(id: IntegrationStatus['id']): boolean { return this.integrations().some((integration) => integration.id === id && integration.configured); }
  connectionLabel(id: IntegrationStatus['id']): string { return this.state() === 'loading' ? 'Verificando' : this.configured(id) ? 'Disponível' : 'Indisponível'; }
  loadStorage(): void { this.libraryApi.storage().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (storage) => this.downloadDirectory.set(storage.downloadDirectory), error: () => this.storageMessage.set('Não foi possível carregar a pasta atual.') }); }
  chooseDownloadDirectory(): void { this.choosingDirectory.set(true); this.storageMessage.set(null); this.desktopFile.chooseDownloadDirectory().then((directory) => { if (directory) this.downloadDirectory.set(directory); }).catch((error: unknown) => this.storageMessage.set(error instanceof Error ? error.message : 'Não foi possível usar essa pasta.')).finally(() => this.choosingDirectory.set(false)); }
  saveStorage(): void { this.savingStorage.set(true); this.storageMessage.set(null); this.libraryApi.updateStorage(this.downloadDirectory()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (storage) => { this.downloadDirectory.set(storage.downloadDirectory); this.storageMessage.set('Pasta salva para os próximos downloads.'); this.savingStorage.set(false); }, error: () => { this.storageMessage.set('Escolha um nome de pasta válido, como filmes/4k.'); this.savingStorage.set(false); } }); }
}
