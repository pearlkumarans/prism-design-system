import { modifier } from 'ember-modifier';

/**
 * config-chart — configures the ds-chart that <ds-widget> renders inside its body.
 *
 * Why not slot a <ds-chart> child directly? ds-widget captures slotted children on
 * connect, but under Ember's incremental rendering the child isn't in the DOM yet —
 * so ds-widget injects its own default (demo) chart and ignores ours. (The vanilla
 * shell dodged this by injecting a fully-built subtree at once.)
 *
 * ds-widget also re-renders its body a beat after connect, which wipes any early
 * config. So we watch the widget with a MutationObserver and (re)apply type / legend /
 * data whenever a body chart appears — robust to those re-renders. `data` is a tracked
 * named arg, so a language flip re-runs the modifier and re-configures.
 *
 *   <ds-widget type="chart" title=… {{config-chart type="donut" legend="right" data=this.statusChart}}></ds-widget>
 */
export default modifier(function configChart(widget, _positional, opts) {
  let cancelled = false;

  const configure = (chart) => {
    if (!chart || chart.__cfgData === opts.data) return; // already set for this data → avoid loop
    if (opts.type) chart.setAttribute('type', opts.type);
    if (opts.monotone) chart.setAttribute('monotone', opts.monotone);
    chart.setAttribute('fit', opts.fit || 'contain');
    if (opts.legend) {
      chart.setAttribute('show-legend', '');
      chart.setAttribute('legend-position', opts.legend);
    }
    chart.data = opts.data;
    chart.__cfgData = opts.data;
    if (chart.refit) requestAnimationFrame(() => chart.refit());
  };

  const sweep = () => {
    if (cancelled) return;
    configure(widget.querySelector('.ds-widget__body ds-chart') || widget.querySelector('ds-chart'));
  };

  Promise.all([
    customElements.whenDefined('ds-widget'),
    customElements.whenDefined('ds-chart'),
  ]).then(() => { if (!cancelled) sweep(); });

  const observer = new MutationObserver(sweep);
  observer.observe(widget, { childList: true, subtree: true });

  return () => { cancelled = true; observer.disconnect(); };
});
