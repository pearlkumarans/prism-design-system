import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  tabAllowedForProduct,
  TAB_DEFAULT_VIEW,
  CONTENT_VIEWS,
  FULL_PAGE_TABS,
  landingForProduct,
} from 'prism-webapp/config/catalog';

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

  afterModel(tabId, transition) {
    const productId = this.paramsFor('product').product_id.toLowerCase();

    // Tab not offered by this product → bounce to the product's landing.
    if (!tabAllowedForProduct(productId, tabId)) {
      const { tab, view } = landingForProduct(productId);
      return this.router.replaceWith('product.module.view', productId, tab, view);
    }

    this.shell.setTab(tabId);

    // Full-page module (Support) renders itself — no default view child.
    if (FULL_PAGE_TABS.has(tabId)) return undefined;

    // Bare module landing (no /:view_slug child in the transition) → default view.
    const goingToLeaf = transition.to?.name === 'product.module.index';
    const defaultView = TAB_DEFAULT_VIEW[tabId];
    if (goingToLeaf && defaultView && CONTENT_VIEWS[defaultView]) {
      return this.router.replaceWith('product.module.view', productId, tabId, defaultView);
    }
    return undefined;
  }
}
