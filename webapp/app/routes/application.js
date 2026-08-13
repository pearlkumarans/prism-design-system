import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { DEFAULT_PRODUCT, CONTENT_VIEWS, landingForProduct } from 'prism-webapp/config/catalog';

/**
 * Two jobs Shell.html did inline at boot:
 *
 *  1. Backward-compat: old links use query params (?product=pmp&view=<slug>).
 *     Translate them to the new nested path ONCE, with replaceWith so the legacy
 *     URL doesn't linger in history (mirrors Shell's boot `history: 'replace'`).
 *
 *  2. Bare "/" → land on the default product's landing view (Shell's
 *     `applyNavMode` + `selectTab('home')` / product primary-tab boot logic).
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

    // 2. Bare "/" → default product landing.
    if (transition.to?.name === 'application' || transition.to?.name === 'index') {
      const { tab, view } = landingForProduct(DEFAULT_PRODUCT);
      return this.router.replaceWith('product.module.view', DEFAULT_PRODUCT, tab, view);
    }
    return undefined;
  }
}
