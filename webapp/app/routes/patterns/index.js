import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { PATTERN_PREVIEWS } from 'prism-webapp/config/pattern-previews';

// Bare /patterns → the first pattern in the gallery.
export default class PatternsIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('patterns.show', PATTERN_PREVIEWS[0].id);
  }
}
