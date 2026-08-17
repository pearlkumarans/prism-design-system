import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { DEFAULT_PRODUCT, landingForProduct } from 'prism-webapp/config/catalog';

/**
 * index — bare "/" lands on the default product's landing view (Shell's
 * `applyNavMode` + primary-tab boot logic).
 *
 * This redirect lives in the INDEX route, not the parent application route,
 * for the same reason product.module.index owns its redirect: `login` and
 * `index` are BOTH children of `application`, so a client-side transition
 * between them (e.g. the login page's post-sign-in `replaceWith('/')`) does
 * NOT re-run application.beforeModel — only a full page load does. The index
 * route's redirect fires on every entry, so "/" always resolves to the landing
 * whether reached by boot or by an in-app transition.
 */
export default class IndexRoute extends Route {
  @service router;

  redirect() {
    const { tab, view } = landingForProduct(DEFAULT_PRODUCT);
    this.router.replaceWith('product.module.view', DEFAULT_PRODUCT, tab, view);
  }
}
