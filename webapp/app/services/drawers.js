import Service from '@ember/service';
import { injectViewInto } from 'prism-webapp/lib/inject-view';

/**
 * drawers — lazy-loads the shell's dual-mode overlay files (profile, help, search,
 * settings, apps, …) into a single body-level host and calls their registered
 * show()/hide(). This is Shell.html's `injectDrawer(name, 'body')` + showX() flow,
 * as a service. Each file is fetched once, then reused.
 */
export default class DrawersService extends Service {
  _host = null;
  _loaded = new Set();
  _loading = new Map();

  _hostEl() {
    if (!this._host) {
      this._host = document.createElement('div');
      this._host.id = 'poc-drawer-host';
      document.body.appendChild(this._host);
    }
    return this._host;
  }

  async open(name) {
    const firstLoad = !this._loaded.has(name);
    if (firstLoad) {
      if (!this._loading.has(name)) {
        this._loading.set(name, injectViewInto(this._hostEl(), name));
      }
      try {
        await this._loading.get(name);
        this._loaded.add(name);
        this._confineIfContentScoped();
      } catch (e) {
        this._loading.delete(name);
        console.warn('[drawers] load failed:', name, e); // eslint-disable-line no-console
        return;
      }
      // The drawer was just injected (and, if content-scoped, MOVED into .poc-area).
      // Paint that freshly-placed, still-closed element for a frame BEFORE toggling
      // it open — otherwise the slide-in keyframe (translateX 100%→0) starts from an
      // unpainted state and snaps instead of sliding. Vanilla avoids this by creating
      // the element in its final home; we relocate, so we wait two frames here.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.ShellDrawers?.[name]?.show?.();
  }

  /**
   * Content-scoped drawers (ds-drawer.ec-drawer — Help / Accessibility / Updates)
   * are confined to the content region in the vanilla shell, not the full viewport.
   * The shell injects them into .shell-area; here they land in the body host, so
   * relocate any into .poc-area, where `.poc-area ds-drawer.ec-drawer { inset:0 }`
   * frames them below the header and clear of the right rail. Full-viewport drawers
   * (profile/apps/settings/search) have no .ec-drawer class and stay in the host.
   */
  _confineIfContentScoped() {
    const area = document.querySelector('.poc-area');
    if (!area) return;
    this._host?.querySelectorAll('ds-drawer.ec-drawer').forEach((d) => {
      if (d.parentElement !== area) area.appendChild(d);
    });
  }

  close(name) {
    window.ShellDrawers?.[name]?.hide?.();
  }
}
