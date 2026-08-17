import { modifier } from 'ember-modifier';

/**
 * set-prop — the ONE bridge Ember needs for Web Components.
 *
 * HTML attributes can only carry strings. Rich `ds-*` components take arrays and
 * objects as JS *properties* (e.g. `table.columns = [...]`, `select.options = [...]`).
 * Handlebars can't set a JS property directly, so this modifier does it — and
 * because it's a tracked-aware modifier, it re-runs whenever `value` changes,
 * keeping the element in sync with Ember state.
 *
 * Usage:
 *   <ds-data-table {{set-prop "columns" this.columns}} {{set-prop "rows" this.rows}} />
 */
export default modifier(function setProp(element, [name, value]) {
  const tag = element.tagName?.toLowerCase();
  // A ds-* element registered by the async module script may not be upgraded yet
  // when this first runs; assigning a property pre-upgrade is silently lost (the
  // element keeps its defaults — e.g. a chart shows placeholder data). Wait for the
  // definition, then set. Once defined, subsequent re-runs set synchronously.
  if (tag && tag.includes('-') && !customElements.get(tag)) {
    customElements.whenDefined(tag).then(() => { element[name] = value; });
  } else {
    element[name] = value;
  }
});

