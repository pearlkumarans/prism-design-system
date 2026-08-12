import EmberRouter from '@ember/routing/router';
import config from 'prism-webapp/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType; // 'history' → clean paths, real back/forward
  rootURL = config.rootURL;
}

/**
 * Maps Shell.html's ?product / tab / ?view model onto NESTED routes:
 *
 *   Shell.html?product=pmp&view=bitlocker-dashboard   (query params)
 *        │            │            └── CONTENT_VIEWS slug
 *        │            └── product scope
 *        └── (tab is implied by the view's `.tab`)
 *
 *   →  /pmp/bitlocker/bitlocker-dashboard              (path segments)
 *        │     │          └── view  (product.module.view)
 *        │     └── tab    (product.module)
 *        └── product      (product)
 *
 * The hierarchy product → module → view becomes the route nesting, so each level
 * owns its slice of nav state. Legacy ?product/?view URLs still resolve — the
 * application route redirects them (see routes/application.js).
 */
Router.map(function () {
  this.route('product', { path: '/:product_id' }, function () {
    this.route('module', { path: '/:tab_id' }, function () {
      this.route('view', { path: '/:view_slug' });
    });
  });
});
