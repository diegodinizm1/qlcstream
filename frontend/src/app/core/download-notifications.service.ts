import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import { apiUrl } from './api-url';

export interface DownloadNotification {
  id: string;
  type: 'COMPLETED' | 'ERROR';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class DownloadNotificationsService {
  private readonly destroyRef = inject(DestroyRef);
  private source?: EventSource;

  readonly notifications = signal<DownloadNotification[]>([]);

  start(): void {
    if (this.source || typeof EventSource === 'undefined') return;
    this.source = new EventSource(apiUrl('/api/downloads/events'));
    this.source.addEventListener('download-notification', (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as Omit<DownloadNotification, 'id' | 'createdAt' | 'read'>;
      this.notifications.update((items) => [{ ...payload, id: crypto.randomUUID(), createdAt: new Date(), read: false }, ...items].slice(0, 12));
    });
    this.destroyRef.onDestroy(() => this.source?.close());
  }

  markAllRead(): void { this.notifications.update((items) => items.map((item) => ({ ...item, read: true }))); }
  clear(): void { this.notifications.set([]); }
}
