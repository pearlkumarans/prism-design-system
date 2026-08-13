import Helper from '@ember/component/helper';
import { service } from '@ember/service';

/**
 * {{t "some.key"}} — resolves a message through the i18n service. Reads i18n.lang
 * so it re-renders automatically when the language flips (native reactivity, the
 * replacement for the legacy applyStrings() re-localization pass).
 */
export default class THelper extends Helper {
  @service i18n;

  compute([key]) {
    this.i18n.lang; // consume tracked lang → recompute on language change
    return this.i18n.t(key);
  }
}
