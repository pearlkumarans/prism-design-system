import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * nav — top vs left navigation mode + the icons-only module rail, backing
 * ShellCtx.setNavMode / setRailIcons (driven from Profile ▸ Preferences).
 * Toggles html.nav-left so the CSS relocates the module tabs to the left rail;
 * ShellChrome reads `mode`/`railIcons` (tracked) to render the rail.
 */
export default class NavService extends Service {
  @tracked mode = 'top'; // 'top' | 'left'
  @tracked railIcons = false;

  constructor() {
    super(...arguments);
    try {
      this.mode = localStorage.getItem('uems-nav-mode') === 'left' ? 'left' : 'top';
    } catch (_) { /* private mode */ }
    this._reflect();
  }

  _reflect() {
    document.documentElement.classList.toggle('nav-left', this.mode === 'left');
  }

  setMode(mode) {
    this.mode = mode === 'left' ? 'left' : 'top';
    this._reflect();
    try { localStorage.setItem('uems-nav-mode', this.mode); } catch (_) { /* private mode */ }
  }

  setRailIcons(on) {
    this.railIcons = !!on;
  }
}
