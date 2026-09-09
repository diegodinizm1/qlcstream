import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';

@Injectable({ providedIn: 'root' })
export class DesktopFileService {
  openInVlc(relativePath: string): Promise<void> {
    return invoke('open_library_file', { relativePath });
  }

  revealInFinder(relativePath: string): Promise<void> {
    return invoke('reveal_library_file', { relativePath });
  }

  confirmDeletion(title: string): Promise<boolean> {
    return confirm(`Excluir o arquivo local de “${title}”? Esta ação não pode ser desfeita.`, {
      title: 'Excluir arquivo',
      kind: 'warning',
      okLabel: 'Excluir',
      cancelLabel: 'Cancelar',
    });
  }
}
