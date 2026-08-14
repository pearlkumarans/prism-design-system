import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { tabAllowedForProduct, landingForProduct } from 'prism-webapp/config/catalog';

/**
 * product.module == Shell.html's `selectTab(tabId)`.
 *
 * Landing on a bare module (/pmp/tp) redirects to that tab's default view — the
 * Ember equivalent of selectTab injecting TAB_DEFAULT_VIEW into <ds-content>.
 * Because a `redirect` uses replaceWith, "/pmp/tp" never sticks in history as its
 * own entry — exactly like Shell's default-view `syncUrl(..., 'replace')`.
 */
export default class ProductModuleRoute extends Route {
  @service shell;
  @service router;

  model(params) {
    return params.tab_id.toLowerCase();
  }

  afterModel(tabId) {
    const productId = this.paramsFor('product').product_id.toLowerCase();

    // Tab not offered by this product → bounce to the product's landing.
    if (!tabAllowedForProduct(productId, tabId)) {
      const { tab, view } = landingForProduct(productId);
      return this.router.replaceWith('product.module.view', productId, tab, view);
    }

    this.shell.setTab(tabId);

    // The bare-module → default-view redirect lives in product.module.index so it
    // fires even when the already-active tab is re-clicked (parent params unchanged
    // → these hooks don't re-run, but the index route's redirect always does).
    return undefined;
  }
}
