import Service from '@ember/service';
import { injectViewInto } from 'prism-webapp/lib/inject-view';

/**
 * drawers — lazy-loads the shell's dual-mode overlay files and calls their
 * registered show()/hide(). Mirrors Shell.html's injectDrawer(name, mount) + showX().
 *
 * Two mount targets, matching the vanilla shell:
 *  • Content-scoped drawers (ds-drawer.ec-drawer — Help / Accessibility / Updates)
 *    inject straight into .poc-area, so `.poc-area ds-drawer.ec-drawer { inset:0 }`
 *    confines them to the content region (below the header, clear of the right rail).
 *    Injecting them here (rather than into the body host and relocating) is what
 *    keeps the slide-in smooth: the panel's one-shot slide keyframe runs on first
 *    open. Relocating a live element consumed that keyframe, so it popped instead.
 *  • Everything else (profile / settings / apps / search) is a full-viewport overlay
 *    in a body-level host.
 */
const CONTENT_SCOPED = new Set(['help', 'accessibility', 'updates']);

// A few drawer FILES register their ShellDrawers handle under a different KEY than
// their file name (a quirk carried over from the vanilla shell). Map name → key so
// show()/hide() target the right handle. (e.g. accessibility.html → ShellDrawers.a11y)
const DRAWER_KEY = { accessibility: 'a11y' };
const keyFor = (name) => DRAWER_KEY[name] || name;

export default class DrawersService extends Service {
  _bodyHost = null;
  _loaded = new Set();
  _loading = new Map();
  // Optional hook run before any drawer opens — lets the shell close non-drawer
  // surfaces (e.g. the rail notification popover) so only one thing is ever open.
  beforeOpen = null;

  // Close every open drawer except `exceptName` — drawers are mutually exclusive.
  closeAll(exceptName) {
    for (const name of this._loaded) {
      if (name === exceptName) continue;
      window.ShellDrawers?.[keyFor(name)]?.hide?.();
    }
  }

  _bodyHostEl() {
    if (!this._bodyHost) {
      this._bodyHost = document.createElement('div');
      this._bodyHost.id = 'poc-drawer-host';
      document.body.appendChild(this._bodyHost);
    }
    return this._bodyHost;
  }

  _hostFor(name) {
    if (CONTENT_SCOPED.has(name)) {
      const area = document.querySelector('.poc-area');
      if (area) return area; // inject into the framed content region (like .shell-area)
    }
    return this._bodyHostEl();
  }

  async open(name) {
    if (!this._loaded.has(name)) {
      if (!this._loading.has(name)) {
        this._loading.set(name, injectViewInto(this._hostFor(name), name));
      }
      try {
        await this._loading.get(name);
        this._loaded.add(name);
      } catch (e) {
        this._loading.delete(name);
        console.warn('[drawers] load failed:', name, e); // eslint-disable-line no-console
        return;
      }
    }
    this.beforeOpen?.();      // close the rail popover / other non-drawer surfaces
    this.closeAll(name);      // close any other open drawer — one at a time
    window.ShellDrawers?.[keyFor(name)]?.show?.();
  }

  close(name) {
    window.ShellDrawers?.[keyFor(name)]?.hide?.();
  }
}
