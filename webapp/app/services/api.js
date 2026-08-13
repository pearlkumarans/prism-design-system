import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * api — the Ember-idiomatic wrapper over window.PrismAPI (the app's existing,
 * framework-agnostic data layer). It does NOT reimplement data access — PrismAPI
 * already owns endpoints, mock↔live switch, mapping, and auth. This adds only:
 *   • dependency-injectable access (testable/mockable), and
 *   • load(): turn an imperative `await PrismAPI.x()` into tracked
 *     { isLoading, data, error } that templates can bind + show loading/error UX.
 */
export default class ApiService extends Service {
  constructor() {
    super(...arguments);
    // Point PrismAPI at the local BFF (server/bff.mjs) — live, direct via baseUrl.
    // useMock() reads CONFIG live, so this takes effect immediately. If the BFF
    // isn't running, calls fail and views show their error state (honest). Prod:
    // set BFF_ORIGIN to the deployed BFF, or front it with the shell's proxy.
    const p = globalThis.PrismAPI;
    if (p && p.config) {
      p.config.proxyPrefix = '';
      p.config.baseUrl = globalThis.BFF_ORIGIN || 'http://localhost:8787';
    }
  }

  get prism() {
    return globalThis.PrismAPI ?? null;
  }

  get isMock() {
    return this.prism ? this.prism.isMock : true;
  }

  /**
   * Run an async producer and expose its lifecycle as tracked state.
   *   const r = this.api.load(() => this.api.prism.listDevices(params));
   *   r.isLoading · r.data · r.error   (all @tracked)
   */
  load(producer) {
    const state = new Loadable();
    Promise.resolve()
      .then(producer)
      .then((data) => { state.data = data; state.isLoading = false; })
      .catch((error) => { state.error = error; state.isLoading = false; });
    return state;
  }
}

class Loadable {
  @tracked isLoading = true;
  @tracked data = null;
  @tracked error = null;
}
