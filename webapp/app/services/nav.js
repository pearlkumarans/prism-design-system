import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * nav — top vs left navigation mode + the icons-only module rail, backing
 * ShellCtx.setNavMode / setRailIcons (driven from Profile ▸ Preferences).
 * Toggles html.nav-left so the CSS relocates the module tabs to the left rail;
 * ShellChrome reads `mode`/`railIcons` (tracked) to render the rail.
 *
 * `mode` is the EFFECTIVE nav mode and follows the user's Top/Left preference for
 * EVERY product, point products included — ds-header-nav now renders a point
 * product's tabs on top as well, so its modules have somewhere to go in top mode
 * (mirrors Shell.html's applyNavMode, which never force-locks a side). `pointProduct`
 * is still tracked so the header shows a right-cluster search icon instead of the
 * centred field, but it no longer constrains the nav mode.
 */
export default class NavService extends Service {
  @tracked userMode = 'top';     // the stored Top/Left preference ('top' | 'left')
  @tracked pointProduct = false; // current product uses the search-icon header (not nav mode)
  @tracked railIcons = false;

  constructor() {
    super(...arguments);
    try {
      this.userMode = localStorage.getItem('uems-nav-mode') === 'left' ? 'left' : 'top';
      // Persisted like the vanilla shell (localStorage 'uems-rail-icons') so the
      // icon-only sidebar preference survives reloads and is consistent across
      // products — without this it reset to icon+label on every fresh load.
      this.railIcons = localStorage.getItem('uems-rail-icons') === '1';
    } catch (_) { /* private mode */ }
    this._reflect();
  }

  // Effective nav mode: the user's Top/Left preference, for every product
  // (point products included). ShellChrome + the shell template read this.
  get mode() {
    return this.userMode === 'left' ? 'left' : 'top';
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
    try { localStorage.setItem('uems-rail-icons', this.railIcons ? '1' : '0'); } catch (_) { /* private mode */ }
  }
}
