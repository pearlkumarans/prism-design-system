import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { CONTENT_VIEWS } from 'prism-webapp/config/catalog';

/**
 * product.module.view == Shell.html's `openView(slug)`.
 *
 * openView(slug) did: selectTab(view.tab) → inject file → show → highlight L2/L1 →
 * syncUrl. Here the router already put us under the right product+tab segments, so
 * the route just validates the slug and records it; the tracked `shell.viewSlug`
 * drives the <ds-content> injection and the sidebar highlight (incl. drill-down
 * parent via shell.activeNavSlug === view.nav).
 *
 * Guard: if the URL's tab segment disagrees with the view's real owning tab
 * (a hand-edited link), canonicalize to the correct tab — the vanilla openView
 * always trusted `view.tab`, so we do too.
 */
export default class ProductModuleViewRoute extends Route {
  @service shell;
  @service router;

  model(params) {
    const slug = params.view_slug;
    const view = CONTENT_VIEWS[slug];
    if (!view) {
      this.router.replaceWith('product.module', this.paramsFor('product').product_id, this.paramsFor('product.module').tab_id);
      return null;
    }
    return { slug, view };
  }

  afterModel(resolved) {
    if (!resolved) return undefined;
    const { slug, view } = resolved;
    const urlTab = this.paramsFor('product.module').tab_id.toLowerCase();

    // Canonicalize: the view's declared tab wins (mirrors openView trusting view.tab).
    if (view.tab && view.tab !== urlTab) {
      const productId = this.paramsFor('product').product_id.toLowerCase();
      return this.router.replaceWith('product.module.view', productId, view.tab, slug);
    }

    this.shell.setView(slug); // → injects file, highlights L2/L1 + drill-down parent
    return undefined;
  }
}
