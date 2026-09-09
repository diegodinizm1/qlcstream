import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';
import { open } from '@tauri-apps/plugin-dialog';

@Injectable({ providedIn: 'root' })
export class DesktopFileService {
  openInVlc(relativePath: string): Promise<void> {
    return invoke('open_library_file', { relativePath });
  }

  revealInFinder(relativePath: string): Promise<void> {
    return invoke('reveal_library_file', { relativePath });
  }

  openExternalUrl(url: string): Promise<void> {
    return invoke('open_external_url', { url });
  }

  confirmDeletion(title: string): Promise<boolean> {
    return confirm(`Excluir o arquivo local de “${title}”? Esta ação não pode ser desfeita.`, {
      title: 'Excluir arquivo',
      kind: 'warning',
      okLabel: 'Excluir',
      cancelLabel: 'Cancelar',
    });
  }

  async chooseDownloadDirectory(): Promise<string | null> {
    const selection = await open({ directory: true, multiple: false, title: 'Escolha a pasta dos downloads' });
    if (!selection || Array.isArray(selection)) return null;
    return invoke<string>('relative_library_directory', { path: selection });
  }
}
