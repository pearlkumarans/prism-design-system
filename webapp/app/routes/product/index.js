import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { landingForProduct } from 'prism-webapp/config/catalog';

/**
 * product.index — a bare product URL (e.g. /dxm) lands on that product's landing
 * view (its explicit defaultView, else Home). This is Shell.html's per-product
 * primary-tab boot logic, scoped to one product.
 *
 * Like index and product.module.index, the redirect lives in the INDEX route (not
 * the parent product route) so it fires on every entry to /:product — including
 * client-side transitions that don't re-run the parent's hooks. Without it, /dxm
 * resolves to an empty product.index (branding applied, but no tab strip or
 * content). The parent product route has already validated the id and set the
 * branding by the time we get here.
 */
export default class ProductIndexRoute extends Route {
  @service router;

  redirect() {
    const productId = this.paramsFor('product').product_id.toLowerCase();
    const { tab, view } = landingForProduct(productId);
    this.router.replaceWith('product.module.view', productId, tab, view);
  }
}
