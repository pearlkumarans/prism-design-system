import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * login controller — form state + submit for the native sign-in route. Reads the
 * field values straight from the <ds-text-input> inner inputs on submit (same as
 * the vanilla login.html), so it doesn't fight the custom element over control.
 */
export default class LoginController extends Controller {
  @service session;
  @service router;

  queryParams = ['next'];
  @tracked next = null;
  @tracked error = '';
  @tracked submitting = false;

  // Demo sign-in is active when in mock mode OR no live login endpoint is wired
  // (PrismAPI.auth.login then accepts any credentials).
  get showDemoHint() {
    try {
      return !!(window.PrismAPI.isMock || !(window.PrismAPI.config.auth && window.PrismAPI.config.auth.endpoint));
    } catch (_) {
      return false;
    }
  }
  // The demo account the (non-live) sign-in accepts — surfaced in the hint so it
  // stays in sync if CONFIG.auth.demoUser/demoPass are re-keyed.
  get demoUser() {
    try { return window.PrismAPI.config.auth.demoUser || 'admin'; } catch (_) { return 'admin'; }
  }
  get demoPass() {
    try { return window.PrismAPI.config.auth.demoPass || 'admin'; } catch (_) { return 'admin'; }
  }
  get brandName() {
    try { return window.PrismAPI.branding.name(); } catch (_) { return 'Endpoint Central'; }
  }
  get brandLogo() {
    try { return window.PrismAPI.branding.logoSrc(); } catch (_) { return ''; }
  }

  _valueOf(id) {
    const el = document.getElementById(id);
    const inp = el && el.querySelector('input');
    return inp ? inp.value : '';
  }

  @action
  onKeydown(e) {
    if (e.key === 'Enter') this.submit();
  }

  @action
  async submit() {
    if (this.submitting) return;
    this.error = '';
    const u = this._valueOf('lg-user').trim();
    const p = this._valueOf('lg-pass');
    if (!u || !p) { this.error = 'Enter your username and password.'; return; }
    this.submitting = true;
    try {
      await this.session.login(u, p);
      const dest = this.next || '/';
      try { this.router.replaceWith(dest); } catch (_) { this.router.replaceWith('/'); }
    } catch (err) {
      this.error = (err && err.message) ? err.message : 'Sign in failed. Check your credentials and the API connection.';
    } finally {
      this.submitting = false;
    }
  }
}
