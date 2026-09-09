import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({ providedIn: 'root' })
export class DesktopFileService {
  openInVlc(relativePath: string): Promise<void> {
    return invoke('open_library_file', { relativePath });
  }

  revealInFinder(relativePath: string): Promise<void> {
    return invoke('reveal_library_file', { relativePath });
  }
}
