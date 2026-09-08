import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-catalog-page', template: `
  <section class="page"><p class="eyebrow">Catálogo pessoal</p><h1>Encontre o próximo filme da sua biblioteca.</h1>
  <p class="lede">Explore lançamentos e pesquise o catálogo do TMDB. A integração será conectada nesta sprint.</p>
  <div class="toolbar"><input class="search" type="search" placeholder="Busque por título ou ano" aria-label="Buscar filmes" /><button class="primary" type="button">Buscar</button></div>
  <h2 class="section-title">Lançamentos</h2><div class="empty-panel"><strong>O catálogo está pronto para ser conectado.</strong><p>Adicione o token do TMDB no arquivo de ambiente para carregar capas, notas, datas e sinopses.</p></div></section>` })
export class CatalogPage {}
