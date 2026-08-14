import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * session — thin wrapper over the framework-agnostic PrismAPI.auth (Layout/data/
 * prism-api.js), the same auth layer the vanilla shell + login.html use. It holds
 * the app-side "am I signed in / who am I", drives the /login route and the
 * product-route guard, and installs a global `window.ShellAuth.signOut()` so the
 * SHARED profile drawer's Sign-out button routes through Ember (transition to
 * /login) instead of the vanilla shell's relative `location.href` redirect (which
 * would 404 under the Ember app's nested paths).
 */
export default class SessionService extends Service {
  @service router;
  @tracked user = null;

  constructor() {
    super(...arguments);
    // The shared profile.html Sign-out button calls this hook when present.
    (window.ShellAuth = window.ShellAuth || {}).signOut = () => this.signOut();
  }

  get _auth() {
    return (typeof window !== 'undefined' && window.PrismAPI && window.PrismAPI.auth) || null;
  }

  // Gate flag (PrismAPI.config.requireLogin). Off ⇒ the guard is a no-op.
  get requireLogin() {
    return !!(window.PrismAPI && window.PrismAPI.config && window.PrismAPI.config.requireLogin);
  }

  // Fast, synchronous "is a token present" check (matches the vanilla shell gate).
  get isAuthenticated() {
    return !!(this._auth && this._auth.isAuthenticated());
  }

  async login(username, password) {
    if (!this._auth) throw new Error('Auth layer not loaded (Layout/data/prism-api.js).');
    await this._auth.login(username, password); // mock: any credentials → 'mock-token'
    await this.loadUser();
  }

  // Resolve the current session to a user (whoami). Mock ⇒ a demo admin.
  async loadUser() {
    try {
      this.user = this._auth ? await this._auth.whoami() : null;
    } catch (_) {
      this.user = null;
    }
    return this.user;
  }

  logout() {
    try { this._auth && this._auth.logout(); } catch (_) { /* ignore */ }
    this.user = null;
  }

  // Sign out and return to the login route (used by window.ShellAuth.signOut).
  // Hard navigation (not an in-app transition): tearing the shell chrome down
  // mid-session otherwise trips a Glimmer removeChild error, because the shell
  // imperatively mounts DOM (injected views, drawers, custom elements) that Ember
  // can't cleanly unwind. A full reload of /login is clean and, for a rare
  // destructive action, entirely appropriate.
  signOut() {
    this.logout();
    let url = '/login';
    try { url = this.router.urlFor('login'); } catch (_) { /* keep default */ }
    window.location.assign(url);
  }
}
