import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { PATTERN_PREVIEWS } from 'prism-webapp/config/pattern-previews';

/**
 * patterns — the preview gallery. Renders standalone (application.hbs skips the
 * shell chrome for this branch). Sets a default product so the example views'
 * navigation still resolves if a control is clicked.
 */
export default class PatternsRoute extends Route {
  @service shell;

  activate() {
    if (!this.shell.productId) this.shell.setProduct('ec');
  }

  model() {
    return PATTERN_PREVIEWS;
  }
}
