import { modifier } from 'ember-modifier';

/**
 * refit-charts — after render (and whenever the dep changes, e.g. language flip),
 * tell every ds-chart in the element to re-measure. Replaces the legacy view's
 * requestAnimationFrame(refit) in show()/onLangChange.
 */
export default modifier(function refitCharts(element /* , [dep] */) {
  requestAnimationFrame(() => {
    element.querySelectorAll('ds-chart').forEach((c) => c.refit?.());
  });
});
