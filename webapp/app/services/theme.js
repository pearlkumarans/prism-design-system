import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * theme — Phase A. Backs ShellCtx.applyTheme. Accepts the shell's value grammar:
 * 'light' | 'dark' | 'system' | 'green-light' | 'green-dark'. Sets data-theme on
 * <html> (the design system's light/dark switch) and toggles the accent family.
 */
export default class ThemeService extends Service {
  @tracked appr = 'light';

  constructor() {
    super(...arguments);
    // Sync `appr` with the theme index.html already applied at boot (and re-assert
    // data-theme in case this service is looked up before that script ran).
    let stored = 'light';
    try { stored = localStorage.getItem('uems-theme') || 'light'; } catch (_) { /* private mode */ }
    this.applyTheme(stored);
  }

  get family() {
    return String(this.appr).includes('green') ? 'green' : 'blue';
  }

  applyTheme(value) {
    this.appr = value || 'light';
    // Mirror Shell.html's applyTheme: the design system's green family is a real
    // data-theme value (green-light / green-dark), NOT a stripped base + class.
    let theme = value;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (value === 'system') theme = prefersDark ? 'dark' : 'light';
    else if (value === 'green-system') theme = prefersDark ? 'green-dark' : 'green-light';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('uems-theme', theme); } catch (_) { /* private mode */ }
  }
}
