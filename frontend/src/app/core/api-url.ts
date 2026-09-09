const DESKTOP_API_ORIGIN = 'http://127.0.0.1:8080';

export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function apiUrl(path: string): string {
  return isDesktopApp() ? `${DESKTOP_API_ORIGIN}${path}` : path;
}
