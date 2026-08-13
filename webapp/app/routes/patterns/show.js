import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { previewById, PATTERN_PREVIEWS } from 'prism-webapp/config/pattern-previews';

// /patterns/<id> → the pattern's preview entry (unknown id → first pattern).
export default class PatternsShowRoute extends Route {
  @service router;

  model(params) {
    const entry = previewById(params.pattern_id);
    if (!entry) { this.router.replaceWith('patterns.show', PATTERN_PREVIEWS[0].id); return null; }
    return entry;
  }
}
