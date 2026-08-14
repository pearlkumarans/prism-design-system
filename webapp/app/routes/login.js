import Route from '@ember/routing/route';
import { service } from '@ember/service';

/**
 * login — native sign-in route. Renders standalone, WITHOUT the shell chrome
 * (see ApplicationController.isStandalone), and reuses PrismAPI.auth through the
 * session service. An already-authenticated visitor never sees it — they're sent
 * to their intended `next` (or the app root).
 */
export default class LoginRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    if (this.session.isAuthenticated) {
      const next = transition.to?.queryParams?.next;
      if (next) {
        try { this.router.replaceWith(next); return; } catch (_) { /* fall through */ }
      }
      this.router.replaceWith('/');
    }
  }
}
