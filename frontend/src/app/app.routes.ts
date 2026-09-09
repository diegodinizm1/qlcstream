import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'catalog', loadComponent: () => import('./pages/catalog.page').then((m) => m.CatalogPage) },
  { path: 'catalog/:tmdbId', loadComponent: () => import('./pages/movie-details.page').then((m) => m.MovieDetailsPage) },
  { path: 'downloads', loadComponent: () => import('./pages/downloads.page').then((m) => m.DownloadsPage) },
  { path: 'library', loadComponent: () => import('./pages/library.page').then((m) => m.LibraryPage) },
  { path: 'settings', loadComponent: () => import('./pages/settings.page').then((m) => m.SettingsPage) },
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  { path: '**', redirectTo: 'catalog' },
];
