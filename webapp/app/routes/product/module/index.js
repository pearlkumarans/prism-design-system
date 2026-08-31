import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { defaultViewFor, CONTENT_VIEWS, FULL_PAGE_TABS, TAB_LABELS, landingForProduct } from 'prism-webapp/config/catalog';

/**
 * product.module.index — landing on a bare module (e.g. /ec/home) redirects to
 * that tab's default view.
 *
 * This lives in the INDEX route rather than the parent product.module afterModel
 * on purpose: clicking the ALREADY-ACTIVE tab transitions to product.module with
 * unchanged product+module params, so Ember skips those routes' hooks and drops
 * straight onto the (empty) index — the parent afterModel never re-runs. The
 * index route's redirect, by contrast, fires every time we land here, so the
 * default view is always restored instead of leaving a blank content area.
 *
 * Three outcomes, none of which is a silent blank:
 *   • tab has a default view      → redirect to it
 *   • full-page tab (e.g. Support) → drawer overlay with no standalone page, so a
 *                                    direct URL redirects to the product landing
 *   • tab has no view yet          → render the "module unavailable" empty state
 *                                    (templates/product/module/index.hbs)
 */
export default class ProductModuleIndexRoute extends Route {
  @service router;

  redirect() {
    const tabId = this.paramsFor('product.module').tab_id.toLowerCase();
    const productId = this.paramsFor('product').product_id.toLowerCase();

    // Full-page tabs are drawer overlays opened from the header — a direct URL to
    // one has nothing to render, so send it to the product's real landing.
    if (FULL_PAGE_TABS.has(tabId)) {
      const { tab, view } = landingForProduct(productId);
      this.router.replaceWith('product.module.view', productId, tab, view);
      return;
    }

    const defaultView = defaultViewFor(productId, tabId);
    if (defaultView && CONTENT_VIEWS[defaultView]) {
      this.router.replaceWith('product.module.view', productId, tabId, defaultView);
    }
    // else: no default view for this tab → fall through and render the empty state.
  }

  // Names the tab in the empty state (only reached when redirect() doesn't bounce).
  model() {
    const tabId = this.paramsFor('product.module').tab_id.toLowerCase();
    return { tabId, label: TAB_LABELS[tabId] ?? tabId };
  }
}
