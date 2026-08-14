import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TAB_DEFAULT_VIEW, CONTENT_VIEWS, FULL_PAGE_TABS } from 'prism-webapp/config/catalog';

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
 */
export default class ProductModuleIndexRoute extends Route {
  @service router;

  redirect() {
    const tabId = this.paramsFor('product.module').tab_id.toLowerCase();
    if (FULL_PAGE_TABS.has(tabId)) return; // full-page module (e.g. Support) renders itself
    const productId = this.paramsFor('product').product_id.toLowerCase();
    const defaultView = TAB_DEFAULT_VIEW[tabId];
    if (defaultView && CONTENT_VIEWS[defaultView]) {
      this.router.replaceWith('product.module.view', productId, tabId, defaultView);
    }
  }
}
