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
    if (opts.area) chart.setAttribute('area', '');   // line charts: fill under the line
    chart.setAttribute('fit', opts.fit || 'contain');
    if (opts.legend) {
      chart.setAttribute('show-legend', '');
      chart.setAttribute('legend-position', opts.legend);
    }
    chart.data = opts.data;
    chart.__cfgData = opts.data;
    if (chart.refit) requestAnimationFrame(() => chart.refit());
  };

  const chartEl = () => widget.querySelector('.ds-widget__body ds-chart') || widget.querySelector('ds-chart');

  const sweep = () => {
    if (cancelled) return;
    configure(chartEl());
  };

  Promise.all([
    customElements.whenDefined('ds-widget'),
    customElements.whenDefined('ds-chart'),
  ]).then(() => { if (!cancelled) sweep(); });

  const observer = new MutationObserver(sweep);
  observer.observe(widget, { childList: true, subtree: true });

  /* Refit the chart whenever the widget's box changes size. A chart sizes its
     drawing to the container at draw time, so if it first renders before the
     layout settles — e.g. entering a point product flips the shell to left-nav,
     which narrows the content column AFTER the chart's initial fit — the arcs
     draw to a stale (or zero) width and vanish. Observing the box and refitting
     (debounced to an animation frame) makes charts self-heal on nav-mode switches,
     window resizes, and responsive breakpoints. refit() only redraws within the
     existing box, so it can't grow the widget and feed back into the observer. */
  let rafId = 0;
  const resize = new ResizeObserver(() => {
    if (cancelled) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const chart = chartEl();
      if (chart && chart.refit) chart.refit();
    });
  });
  resize.observe(widget);

  return () => {
    cancelled = true;
    observer.disconnect();
    resize.disconnect();
    if (rafId) cancelAnimationFrame(rafId);
  };
});
