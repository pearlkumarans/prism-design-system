import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { PRODUCTS, CONTENT_VIEWS, TAB_LABELS, tabsForProduct } from 'prism-webapp/config/catalog';

// ds-header-nav renders a top-tab strip ONLY for these (combined Endpoint Central)
// variants; every other variant is a point product that navigates via the left rail.
const TOP_NAV_VARIANTS = new Set(['endpoint-central', 'endpoint-central-msp', 'msp-central']);

// Framework-agnostic EC menu map, loaded natively from the vendored copy (same
// path ShellChrome uses) so ember-auto-import doesn't try to bundle it. Used only
// to harvest the view→label lookup that names the document title's page segment.
const ORIGIN = globalThis.location?.origin ?? '';
const _nativeImport = new Function('u', 'return import(u);');

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
  @service nav;

  @tracked productId = null;
  @tracked tabId = null;
  @tracked viewSlug = null;

  // { viewSlug: { label, labelAr } } harvested from ec-menus (async); null until loaded.
  _viewLabels = null;

  constructor() {
    super(...arguments);
    this._loadViewLabels();
  }

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
    // Point products have no top-tab strip → force the left module rail.
    const variant = PRODUCTS[productId]?.variant ?? null;
    this.nav.setPointProduct(variant ? !TOP_NAV_VARIANTS.has(variant) : false);
    this._syncTitle();
  }

  setTab(tabId) {
    this.tabId = tabId;
    this._syncTitle();
  }

  // Replaces openView()'s "inject the file into ds-content and show it". Here we
  // only record the slug; a <ContentOutlet> component reacts to `viewSlug` and does
  // the fetch+inject (the app-chrome piece, not the router's concern).
  setView(slug) {
    this.viewSlug = slug;
    this.tabId = CONTENT_VIEWS[slug]?.tab ?? this.tabId;
    this._syncTitle();
  }

  // ── Document title ────────────────────────────────────────────────────────
  // "<page name> - ManageEngine <product>", where <page name> mirrors the active
  // top/sidebar navigation: the open view's L2 sub-item label (or its drill-down
  // parent's, via CONTENT_VIEWS[slug].nav), else the active header tab / L1 label.
  // Parity with Layout/Shell.html's setDocTitle + syncNavTitle.
  async _loadViewLabels() {
    try {
      const mod = await _nativeImport(`${ORIGIN}/vendor/ds/data/ec-menus.js`);
      const map = {};
      (function harvest(node) {
        if (Array.isArray(node)) return node.forEach(harvest);
        if (node && typeof node === 'object') {
          if (node.view && node.label) map[node.view] = { label: node.label, labelAr: node.labelAr };
          Object.values(node).forEach(harvest);
        }
        return undefined;
      })(mod.EC_TAB_L2_MENUS ?? {});
      this._viewLabels = map;
      this._syncTitle(); // upgrade the title now that sub-item labels are known
    } catch (_) {
      /* menus unavailable — the tab-label fallback still applies */
    }
  }

  // Deepest active nav label for the current view, or null (→ tab-label fallback).
  get _pageName() {
    const labels = this._viewLabels;
    if (labels && this.viewSlug) {
      if (labels[this.viewSlug]) return labels[this.viewSlug].label;
      const parent = CONTENT_VIEWS[this.viewSlug]?.nav;
      if (parent && labels[parent]) return labels[parent].label;
    }
    return this.tabId ? (TAB_LABELS[this.tabId] ?? null) : null;
  }

  _syncTitle() {
    const brand = 'ManageEngine ' + (this.product?.name ?? 'Endpoint Central');
    const page = this._pageName;
    document.title = (page ? `${page} - ` : '') + brand;
  }
}
