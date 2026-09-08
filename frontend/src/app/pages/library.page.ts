import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-library-page', template: `
  <section class="page"><p class="eyebrow">Arquivos locais</p><h1>Sua biblioteca, organizada no disco.</h1><p class="lede">Filmes concluídos aparecerão aqui com suas versões, tamanho e localização.</p>
  <div class="empty-panel"><strong>A biblioteca ainda está vazia.</strong><p>Quando um download terminar, o backend verificará os arquivos antes de registrar o filme como disponível.</p></div></section>` })
export class LibraryPage {}
