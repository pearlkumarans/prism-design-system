import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * nav — top vs left navigation mode + the icons-only module rail, backing
 * ShellCtx.setNavMode / setRailIcons (driven from Profile ▸ Preferences).
 * Toggles html.nav-left so the CSS relocates the module tabs to the left rail;
 * ShellChrome reads `mode`/`railIcons` (tracked) to render the rail.
 *
 * `mode` is the EFFECTIVE mode. It combines the user's Top/Left preference with a
 * product constraint: only Endpoint Central (the combined suite) has a top-tab
 * strip in ds-header-nav — every POINT product (Patch Manager Plus, DEX Manager
 * Plus, …) renders a centred search instead, so its modules have nowhere to go but
 * the LEFT rail. The shell flags that via setPointProduct on each product change,
 * and point products are forced to left-nav regardless of the stored preference.
 */
export default class NavService extends Service {
  @tracked userMode = 'top';     // the stored Top/Left preference ('top' | 'left')
  @tracked pointProduct = false; // current product has no top tabs → left-nav only
  @tracked railIcons = false;

  constructor() {
    super(...arguments);
    try {
      this.userMode = localStorage.getItem('uems-nav-mode') === 'left' ? 'left' : 'top';
    } catch (_) { /* private mode */ }
    this._reflect();
  }

  // Effective nav mode: a point product always uses the left rail; otherwise the
  // user's preference wins. ShellChrome + the shell template read this.
  get mode() {
    return (this.pointProduct || this.userMode === 'left') ? 'left' : 'top';
  }

  _reflect() {
    document.documentElement.classList.toggle('nav-left', this.mode === 'left');
  }

  setMode(mode) {
    this.userMode = mode === 'left' ? 'left' : 'top';
    this._reflect();
    try { localStorage.setItem('uems-nav-mode', this.userMode); } catch (_) { /* private mode */ }
  }

  // Called by the shell when the product changes. Point products (non-EC-family
  // header variants) have no top-tab strip, so their modules live in the left rail.
  setPointProduct(on) {
    on = !!on;
    if (this.pointProduct === on) return;
    this.pointProduct = on;
    this._reflect();
  }

  setRailIcons(on) {
    this.railIcons = !!on;
  }
}
