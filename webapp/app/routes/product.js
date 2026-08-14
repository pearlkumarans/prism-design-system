import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { isValidProduct, DEFAULT_PRODUCT } from 'prism-webapp/config/catalog';

/**
 * product route == Shell.html's `_product` scoping (PRODUCTS[id] → header variant,
 * allowed tabs, landing view). Validating here means an unknown /:product_id
 * fails fast instead of the vanilla shell's silent `|| 'ec'` fallback.
 */
export default class ProductRoute extends Route {
  @service shell;
  @service router;
  @service session;

  // Auth gate for the whole app: every real page lives under `product`, so one
  // guard here covers them all (the `login` and dev `patterns` routes sit outside
  // it, so they're never gated — no redirect loop). Off unless requireLogin is on.
  beforeModel() {
    if (this.session.requireLogin && !this.session.isAuthenticated) {
      const next = (typeof window !== 'undefined') ? window.location.pathname + window.location.search : null;
      return this.router.replaceWith('login', { queryParams: { next } });
    }
    return undefined;
  }

  model(params) {
    const productId = params.product_id.toLowerCase();
    if (!isValidProduct(productId)) {
      // Unknown product → fall back to the default (Shell did this implicitly).
      this.router.replaceWith('product', DEFAULT_PRODUCT);
      return null;
    }
    return productId;
  }

  afterModel(productId) {
    if (productId) this.shell.setProduct(productId); // header rebrands off shell.variant
  }
}
