import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * theme — Phase A. Backs ShellCtx.applyTheme. Accepts the shell's value grammar:
 * 'light' | 'dark' | 'night' | 'system' and their 'green-' counterparts.
 * Sets data-theme on <html> (the design system's theme switch) and toggles the
 * accent family. `night` is the deepest neutral theme (Grey palette, Charoite
 * for error); it exists in both accent families (night / green-night) and, like
 * light and dark, passes straight through — only `system` needs resolving.
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

  /* light | dark | night | system — the mode half of the appearance grammar,
     read off the value with the accent prefix stripped. */
  get mode() {
    const v = String(this.appr);
    if (/system$/.test(v)) return 'system';
    if (/night$/.test(v)) return 'night';
    return /dark$/.test(v) ? 'dark' : 'light';
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
