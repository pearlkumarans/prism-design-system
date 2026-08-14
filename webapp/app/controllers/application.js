import Controller from '@ember/controller';
import { service } from '@ember/service';

// Gives the application template access to live nav state for the header chrome.
export default class ApplicationController extends Controller {
  @service shell;
  @service router;

  // The /patterns gallery and the /login route render standalone (no shell chrome).
  get isStandalone() {
    const n = this.router.currentRouteName || '';
    if (n) return n.startsWith('patterns') || n === 'login';
    // Initial load, before the route name settles: fall back to the URL so a
    // standalone page renders standalone from the first paint — otherwise the shell
    // chrome flashes in, then tears down as the route resolves, tripping a Glimmer
    // removeChild error on the shell's imperatively-mounted DOM.
    const p = (typeof window !== 'undefined' && window.location.pathname) || '';
    const root = (typeof this.router.rootURL === 'string' ? this.router.rootURL : '/');
    const rel = p.startsWith(root) ? p.slice(root.length - 1) : p; // keep a leading '/'
    return rel === '/login' || rel.startsWith('/patterns');
  }
}
