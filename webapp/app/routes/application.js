import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { DEFAULT_PRODUCT, CONTENT_VIEWS, landingForProduct } from 'prism-webapp/config/catalog';

/**
 * Backward-compat that Shell.html did inline at boot: old links use query params
 * (?product=pmp&view=<slug>). Translate them to the new nested path ONCE, with
 * replaceWith so the legacy URL doesn't linger in history (mirrors Shell's boot
 * `history: 'replace'`).
 *
 * Bare "/" → default landing is NOT handled here — it lives in the index route
 * (routes/index.js), so it also fires on client-side transitions to "/" (e.g.
 * the login page's post-sign-in redirect), which never re-enter this parent.
 */
export default class ApplicationRoute extends Route {
  @service router;

  beforeModel(transition) {
    const qp = transition.to?.queryParams ?? {};
    const legacyProduct = (qp.product || '').toLowerCase();
    const legacyView = qp.view;

    // 1. Legacy ?view=<slug> → /:product/:tab/:view
    if (legacyView && CONTENT_VIEWS[legacyView]) {
      const productId = legacyProduct || DEFAULT_PRODUCT;
      const { tab } = CONTENT_VIEWS[legacyView];
      return this.router.replaceWith('product.module.view', productId, tab, legacyView);
    }

    // 1b. Legacy ?product=<id> with no view → that product's landing.
    if (legacyProduct) {
      const { tab, view } = landingForProduct(legacyProduct);
      return this.router.replaceWith('product.module.view', legacyProduct, tab, view);
    }

    // Bare "/" (no legacy params) → default landing is handled by the index route.
    return undefined;
  }
}
