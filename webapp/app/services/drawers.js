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
    if (!this._loaded.has(name)) {
      if (!this._loading.has(name)) {
        this._loading.set(name, injectViewInto(this._hostEl(), name));
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
    window.ShellDrawers?.[name]?.show?.();
  }

  close(name) {
    window.ShellDrawers?.[name]?.hide?.();
  }
}
