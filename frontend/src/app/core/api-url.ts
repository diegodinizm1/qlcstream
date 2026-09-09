const DESKTOP_API_ORIGIN = 'http://127.0.0.1:8080';

export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI_INTERNALS__' in window
    || window.location.hostname === 'tauri.localhost'
    || window.location.port === '4201';
}

export function apiUrl(path: string): string {
  return isDesktopApp() ? `${DESKTOP_API_ORIGIN}${path}` : path;
}
