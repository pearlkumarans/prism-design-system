import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { PRODUCTS, CONTENT_VIEWS, tabsForProduct } from 'prism-webapp/config/catalog';

/**
 * shell — the single source of nav truth, replacing Shell.html's module-scoped
 * `_product` / `_tab` / current-view variables and the imperative side effects of
 * `selectTab()` / `openView()`.
 *
 * The ROUTES call these setters from their model/afterModel hooks; TEMPLATES read
 * the tracked getters to render the header variant, active tab, L1/L2 highlight,
 * and to inject the view file into <ds-content>. Ember's router owns the URL and
 * history — so `syncUrl()`, the `popstate` listener, and the `_navReady` guard in
 * the vanilla shell all disappear.
 */
export default class ShellService extends Service {
  @tracked productId = null;
  @tracked tabId = null;
  @tracked viewSlug = null;

  get product() {
    return PRODUCTS[this.productId] ?? null;
  }

  // Header tab strip for the current product (id + label objects).
  get tabs() {
    return this.productId ? tabsForProduct(this.productId) : [];
  }

  // Header rebrands off this (ds-header-nav variant), same as applyNavMode/product scope.
  get variant() {
    return this.product?.variant ?? null;
  }

  get view() {
    return CONTENT_VIEWS[this.viewSlug] ?? null;
  }

  // Drill-down: the LIST view whose sidebar item stays highlighted (Shell's `nav`).
  get activeNavSlug() {
    return this.view?.nav ?? this.viewSlug;
  }

  setProduct(productId) {
    this.productId = productId;
  }

  setTab(tabId) {
    this.tabId = tabId;
  }

  // Replaces openView()'s "inject the file into ds-content and show it". Here we
  // only record the slug; a <ContentOutlet> component reacts to `viewSlug` and does
  // the fetch+inject (the app-chrome piece, not the router's concern).
  setView(slug) {
    this.viewSlug = slug;
    this.tabId = CONTENT_VIEWS[slug]?.tab ?? this.tabId;
  }
}
