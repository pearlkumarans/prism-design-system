/* ds-chart — from-scratch SVG chart renderer.
   Two sections:
   1. resize-reflow coalescing (the original stub — preserved verbatim below).
   2. geometry / a11y / injection coverage. ds-chart is LIGHT-DOM: everything is
      queried via el.querySelector(...), never a shadow root. Data is set through
      the `data` JS property. The internal math (_niceMax, barPath, arc `d`
      builders) is not exported, so every assertion reads the EMITTED SVG and
      compares it numerically against the input — the visually-hidden a11y
      <table> doubles as the numeric oracle. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/chart/chart.js';

const twoFrames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/* --- geometry helpers ---------------------------------------------------- */
const root = (el) => el.querySelector('.ds-chart');
const bars = (el) => [...el.querySelectorAll('.ds-chart__bar')];
const ticks = (el) => [...el.querySelectorAll('.ds-chart__tick')].map((t) => t.textContent);
const dAttrs = (el) => [...el.querySelectorAll('path')].map((p) => p.getAttribute('d') || '');

/* Extract every "x,y" coordinate pair from an SVG path `d`. For the bar/funnel
   (barPath) and line commands used here, every number pair is a real coordinate,
   so this yields a correct bounding box. */
function pathBox(d) {
  const xs = [], ys = [];
  const re = /(-?\d*\.?\d+),(-?\d*\.?\d+)/g;
  let m;
  while ((m = re.exec(d))) { xs.push(parseFloat(m[1])); ys.push(parseFloat(m[2])); }
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

async function make(attrs, data) {
  const el = await fixture(html`<ds-chart></ds-chart>`);
  // apply attributes explicitly (keeps the fixture template simple/robust)
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v === true) el.setAttribute(k, '');
    else if (v != null && v !== false) el.setAttribute(k, String(v));
  });
  if (data) el.data = data;
  await nextFrame();
  return el;
}

/* =============================================================================
   SECTION 1 — resize-reflow coalescing (preserved from the original stub)
   ============================================================================= */
describe('ds-chart — resize reflow coalescing', () => {
  it('collapses a burst of resize callbacks into a single reflow', async () => {
    const el = await fixture(html`<ds-chart></ds-chart>`);
    await nextFrame();
    // Isolate from the real ResizeObserver/IntersectionObserver so we measure
    // only the coalescing of our own _scheduleReflow() burst.
    el._ro?.disconnect(); el._ro = null;
    el._io?.disconnect(); el._io = null;

    let reflows = 0;
    const orig = el._reflow.bind(el);
    el._reflow = () => { reflows++; return orig(); };

    el._scheduleReflow();
    el._scheduleReflow();
    el._scheduleReflow();
    el._scheduleReflow();
    expect(reflows, 'should not reflow synchronously per tick').to.equal(0);

    await twoFrames();
    expect(reflows, 'burst should coalesce to exactly one reflow').to.equal(1);
  });

  it('cancels a pending reflow when disconnected', async () => {
    const el = await fixture(html`<ds-chart></ds-chart>`);
    await nextFrame();
    el._ro?.disconnect(); el._ro = null;
    el._io?.disconnect(); el._io = null;

    let reflows = 0;
    const orig = el._reflow.bind(el);
    el._reflow = () => { reflows++; return orig(); };

    el._scheduleReflow();
    el.remove(); // disconnectedCallback cancels the queued frame
    await twoFrames();
    expect(reflows, 'a queued reflow must not fire after disconnect').to.equal(0);
  });
});

/* =============================================================================
   SECTION 2 — structure, a11y, roles
   ============================================================================= */
describe('ds-chart — structure & a11y', () => {
  it('renders into a light-DOM .ds-chart root (no shadow) with the default sample', async () => {
    const el = await make();
    expect(el.shadowRoot, 'ds-chart is light-DOM').to.equal(null);
    const r = root(el);
    expect(r, 'renders a .ds-chart root').to.exist;
    expect(r.classList.contains('ds-chart--column'), 'default type is column').to.be.true;
    // default SAMPLE_CARTESIAN = 4 categories × 3 series
    expect(bars(el).length).to.equal(12);
  });

  it('exposes role=img + aria-label on the plot GRAPHIC (not the root, so the legend + data-table stay accessible)', async () => {
    const el = await make({}, { categories: ['A', 'B'], series: [{ name: 'S', values: [1, 2] }] });
    // role=img belongs on the SVG's wrapper so it doesn't trap the focusable legend
    // buttons or hide the data-table fallback (both are exposed siblings).
    const graphic = el.querySelector('.ds-chart__plot-wrap');
    expect(graphic, 'plot-wrap graphic').to.exist;
    expect(graphic.getAttribute('role')).to.equal('img');
    expect(root(el).hasAttribute('role'), 'root is not role=img').to.be.false;
    const label = graphic.getAttribute('aria-label');
    expect(label).to.contain('column chart');
    expect(label).to.contain('1 series');
    expect(label).to.contain('A, B');
  });

  it('renders a visually-hidden data table: one row per category, cells match input', async () => {
    const data = { categories: ['Q1', 'Q2', 'Q3'], series: [
      { name: 'Rev', values: [10, 20, 30] },
      { name: 'Cost', values: [4, 5, 6] },
    ] };
    const el = await make({}, data);
    const table = el.querySelector('.ds-chart__a11y-table');
    expect(table, 'a11y fallback table exists').to.exist;
    const bodyRows = [...table.querySelectorAll('tbody tr')];
    expect(bodyRows.length, 'one row per category').to.equal(3);
    // header: Category + each series name
    const heads = [...table.querySelectorAll('thead th')].map((t) => t.textContent);
    expect(heads).to.deep.equal(['Category', 'Rev', 'Cost']);
    // row 2 (Q2) → row header + 20 + 5
    const cells = [...bodyRows[1].querySelectorAll('th,td')].map((c) => c.textContent);
    expect(cells).to.deep.equal(['Q2', '20', '5']);
  });
});

/* =============================================================================
   SECTION 3 — axis "nice max" ticks & degenerate data
   ============================================================================= */
describe('ds-chart — axis ticks', () => {
  it('rounds the axis to a nice max (47 → top tick 50) with 6 ticks and 5 gridlines', async () => {
    const el = await make({}, { categories: ['A', 'B'], series: [{ name: 'S', values: [47, 12] }] });
    const labels = ticks(el);
    expect(labels.length, 'TICKS+1 tick labels').to.equal(6);
    expect(labels).to.deep.equal(['0', '10', '20', '30', '40', '50']);
    // gridlines drawn for t>0 only
    expect(el.querySelectorAll('.ds-chart__gridline').length).to.equal(5);
  });

  it('floors the axis without NaN when every value is zero', async () => {
    const el = await make({}, { categories: ['A', 'B'], series: [{ name: 'S', values: [0, 0] }] });
    // _niceMax(0) → TICKS (5): labels 0..5, never NaN
    expect(ticks(el)).to.deep.equal(['0', '1', '2', '3', '4', '5']);
    // no NaN leaks into any emitted path geometry either
    dAttrs(el).forEach((d) => expect(d).to.not.contain('NaN'));
    ticks(el).forEach((t) => expect(t).to.not.contain('NaN'));
  });

  it('recomputes the axis max after a series is toggled off via legend', async () => {
    const el = await make({ mode: 'grouped' }, { categories: ['A'], series: [
      { name: 'Big', values: [90] },
      { name: 'Small', values: [12] },
    ] });
    expect(ticks(el).pop(), 'axis fits the 90 series').to.equal('100');
    // hide the "Big" series (classIdx 0)
    const btn = el.querySelectorAll('.ds-chart__legend-item')[0];
    btn.click();
    await nextFrame();
    // now max visible is 12 → _niceMax(12) = 25 (step 5 × TICKS 5)
    expect(ticks(el).pop(), 'axis re-floors to the remaining series').to.equal('25');
  });
});

/* =============================================================================
   SECTION 4 — bar / column geometry
   ============================================================================= */
describe('ds-chart — column & bar geometry', () => {
  it('renders one bar per (category × series) with a rounded top corner (Q curve)', async () => {
    const el = await make({}, { categories: ['A', 'B'], series: [{ name: 'S', values: [10, 20] }] });
    const b = bars(el);
    expect(b.length, '2 categories × 1 series').to.equal(2);
    // barPath rounds the growing end (top) → the `d` carries a quadratic corner
    b.forEach((p) => expect(p.getAttribute('d')).to.match(/Q/));
  });

  it('maps values linearly to bar height against the nice axis', async () => {
    // categories ['A'], value 50 → axisMax 50, plotH 160, baseY 172 → top y = 12
    const el = await make({}, { categories: ['A'], series: [{ name: 'S', values: [50] }] });
    const box = pathBox(bars(el)[0].getAttribute('d'));
    expect(box.maxY, 'bottom sits on the baseline').to.be.closeTo(172, 0.5);
    expect(box.minY, 'full-axis bar tops out at padT').to.be.closeTo(12, 0.5);
    expect(box.height, 'height spans the whole plot').to.be.closeTo(160, 0.5);
  });

  it('stacks segments so the top of the stack equals the single-bar height for the total', async () => {
    // two segments 20 + 30 = 50 → axisMax 50 → total len 160, top at y=12
    const el = await make({ mode: 'stacked' }, { categories: ['A'], series: [
      { name: 'S1', values: [20] },
      { name: 'S2', values: [30] },
    ] });
    const boxes = bars(el).map((p) => pathBox(p.getAttribute('d')));
    expect(boxes.length).to.equal(2);
    const topOfStack = Math.min(...boxes.map((b) => b.minY));
    const bottomOfStack = Math.max(...boxes.map((b) => b.maxY));
    const stackedHeight = boxes.reduce((sum, b) => sum + b.height, 0);
    expect(bottomOfStack, 'stack sits on the baseline').to.be.closeTo(172, 0.5);
    // top-of-top-segment == baseline − full-total height (segments meet flush)
    expect(topOfStack).to.be.closeTo(172 - stackedHeight, 0.5);
    expect(topOfStack, '20+30 fills the 50-axis').to.be.closeTo(12, 0.5);
  });

  it('offsets grouped bars side by side within the category slot', async () => {
    const el = await make({ mode: 'grouped' }, { categories: ['A'], series: [
      { name: 'S1', values: [10] },
      { name: 'S2', values: [20] },
    ] });
    const xs = bars(el).map((p) => pathBox(p.getAttribute('d')).minX);
    expect(bars(el).length).to.equal(2);
    expect(xs[0], 'grouped bars do not share an x').to.not.be.closeTo(xs[1], 1);
  });

  it('renders horizontal bars (type=bar) rounded on the growing (right) end', async () => {
    const el = await make({ type: 'bar' }, { categories: ['A', 'B'], series: [{ name: 'S', values: [30, 60] }] });
    expect(root(el).classList.contains('ds-chart--bar')).to.be.true;
    const b = bars(el);
    expect(b.length).to.equal(2);
    b.forEach((p) => expect(p.getAttribute('d')).to.match(/Q/)); // right-end rounding
    // the longer value (60) produces the wider bar
    const widths = b.map((p) => pathBox(p.getAttribute('d')).width);
    expect(widths[1]).to.be.greaterThan(widths[0]);
  });
});

/* =============================================================================
   SECTION 5 — line geometry & data labels
   ============================================================================= */
describe('ds-chart — line & data labels', () => {
  it('draws one polyline path per series plus a dot per point', async () => {
    const el = await make({ type: 'line' }, { categories: ['A', 'B', 'C'], series: [
      { name: 'S1', values: [1, 2, 3] },
      { name: 'S2', values: [3, 2, 1] },
    ] });
    const lines = el.querySelectorAll('.ds-chart__line');
    expect(lines.length, 'one path per series').to.equal(2);
    // M then two L for three points
    expect((lines[0].getAttribute('d').match(/L/g) || []).length).to.equal(2);
    expect(el.querySelectorAll('.ds-chart__dot').length, '3 points × 2 series').to.equal(6);
  });

  it('renders value data-labels when show-data-labels is set', async () => {
    const el = await make({ 'show-data-labels': true }, { categories: ['A', 'B'], series: [{ name: 'S', values: [10, 20] }] });
    const labels = [...el.querySelectorAll('.ds-chart__data-label')].map((t) => t.textContent);
    expect(labels).to.include.members(['10', '20']);
  });
});

/* =============================================================================
   SECTION 6 — part-to-whole (pie / donut / funnel)
   ============================================================================= */
describe('ds-chart — pie / donut', () => {
  it('renders one arc slice per value; pie slices carry a single arc command', async () => {
    const el = await make({ type: 'pie' }, { categories: ['A', 'B', 'C'], series: [{ name: 'S', values: [30, 40, 30] }] });
    const slices = el.querySelectorAll('.ds-chart__slice');
    expect(slices.length, 'one path per non-zero slice').to.equal(3);
    slices.forEach((p) => expect((p.getAttribute('d').match(/A/g) || []).length, 'pie wedge = one arc').to.equal(1));
  });

  it('gives donut slices an inner arc (a hole) and a center total', async () => {
    const el = await make({ type: 'donut' }, { categories: ['A', 'B', 'C'], series: [{ name: 'Sessions', values: [30, 40, 30] }] });
    const slices = el.querySelectorAll('.ds-chart__slice');
    expect(slices.length).to.equal(3);
    // donut ring = outer arc + inner arc → two 'A' commands
    slices.forEach((p) => expect((p.getAttribute('d').match(/A/g) || []).length, 'donut segment = two arcs').to.equal(2));
    const center = el.querySelector('.ds-chart__center-value');
    expect(center, 'donut center total').to.exist;
    expect(center.textContent, 'total = 30+40+30').to.equal('100');
  });

  it('drops a slice path when its category is toggled off via legend', async () => {
    const el = await make({ type: 'pie' }, { categories: ['A', 'B', 'C'], series: [{ name: 'S', values: [30, 40, 30] }] });
    expect(el.querySelectorAll('.ds-chart__slice').length).to.equal(3);
    el.querySelectorAll('.ds-chart__legend-item')[0].click();
    await nextFrame();
    expect(el.querySelectorAll('.ds-chart__slice').length, 'hidden slice is not drawn').to.equal(2);
  });
});

describe('ds-chart — funnel', () => {
  it('renders one polygon per stage with monotonically decreasing widths', async () => {
    const el = await make({ type: 'funnel' }, { categories: ['Visit', 'Signup', 'Trial', 'Paid'], series: [{ name: 'F', values: [100, 74, 52, 34] }] });
    const segs = [...el.querySelectorAll('.ds-chart__funnel')];
    expect(segs.length, 'one path per stage').to.equal(4);
    const widths = segs.map((p) => pathBox(p.getAttribute('d')).width);
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i], `stage ${i} narrower than ${i - 1}`).to.be.lessThan(widths[i - 1]);
    }
  });

  it('labels each stage as a percentage of the top (100%) stage', async () => {
    const el = await make({ type: 'funnel' }, { categories: ['A', 'B', 'C', 'D'], series: [{ name: 'F', values: [100, 74, 52, 34] }] });
    const pcts = [...el.querySelectorAll('.ds-chart__data-label--funnel')].map((t) => t.textContent);
    expect(pcts).to.deep.equal(['100%', '74%', '52%', '34%']);
  });
});

/* =============================================================================
   SECTION 7 — gauge
   ============================================================================= */
describe('ds-chart — gauge', () => {
  it('draws a value arc and an escaped center value + label, free of NaN', async () => {
    const el = await make({ type: 'gauge' }, { value: 68, label: 'Capacity' });
    const arc = el.querySelector('.ds-chart__gauge-value');
    expect(arc, 'value arc path').to.exist;
    const d = arc.getAttribute('d');
    expect(d).to.match(/^M/);
    expect(d, 'arc geometry has no NaN').to.not.contain('NaN');
    expect(el.querySelector('.ds-chart__center-value').textContent).to.equal('68%');
    expect(el.querySelector('.ds-chart__center-label').textContent).to.equal('Capacity');
    // gauge uses its own tight viewBox (200×110)
    expect(el.querySelector('.ds-chart__plot').getAttribute('viewBox')).to.equal('0 0 200 110');
  });

  it('clamps the gauge value into 0–100', async () => {
    const el = await make({ type: 'gauge' }, { value: 150, label: 'Over' });
    expect(el.querySelector('.ds-chart__center-value').textContent).to.equal('100%');
  });
});

/* =============================================================================
   SECTION 8 — counter-scaled text sizing
   ============================================================================= */
describe('ds-chart — counter-scaled font sizing', () => {
  it('sets --ds-chart-fs-fixed to a true-px value (10 / renderScale), not the SVG scale', async () => {
    // The component measures the plot's rendered width to counter-scale text.
    // The chart's own stylesheet is not loaded under the test harness, so we
    // pin the measured width deterministically (320 → scale 1) and re-fit; this
    // exercises the exact counter-scale math independent of headless layout.
    const el = await make({}, { categories: ['A', 'B'], series: [{ name: 'S', values: [10, 20] }] });
    const svg = el.querySelector('.ds-chart__plot');
    svg.getBoundingClientRect = () => ({ width: 320, height: 200, top: 0, left: 0, right: 320, bottom: 200, x: 0, y: 0 });
    el.refit(); // → _fitFonts() with scale = 320 / vbW(320) = 1

    // fixed font var is a true-px size = 10 / scale (renders a true ~10px at any scale)
    expect(root(el).style.getPropertyValue('--ds-chart-fs-fixed')).to.equal('10.000px');
    // line stroke likewise counter-scaled to a true 2px
    expect(root(el).style.getPropertyValue('--ds-chart-stroke')).to.equal('2.000px');
    // and the marker dot to a true 3px
    expect(root(el).style.getPropertyValue('--ds-chart-dot')).to.equal('3.000px');
  });
});

/* =============================================================================
   SECTION 9 — injection safety
   ============================================================================= */
describe('ds-chart — injection safety', () => {
  it('renders hostile category & series names as literal text, never as HTML', async () => {
    const hostile = '"><img src=x onerror=alert(1)>';
    const el = await make({}, { categories: [hostile, 'Safe'], series: [{ name: hostile, values: [10, 20] }] });
    // no live element is created from the payload anywhere in the chart
    expect(el.querySelector('img'), 'no injected <img>').to.equal(null);
    expect(el.querySelector('img[onerror]')).to.equal(null);
    // the hidden a11y table shows the literal string
    const table = el.querySelector('.ds-chart__a11y-table');
    expect(table.textContent).to.contain('<img');
    // the SVG category axis label is the literal string too (textContent sink)
    const cat = [...el.querySelectorAll('.ds-chart__cat')].map((t) => t.dataset.full);
    expect(cat).to.contain(hostile);
    // legend label is literal
    const legend = [...el.querySelectorAll('.ds-chart__legend-label')].map((t) => t.textContent);
    expect(legend).to.contain(hostile);
  });
});

/* =============================================================================
   SECTION 10 — legend toggling
   ============================================================================= */
describe('ds-chart — legend', () => {
  it('renders a legend button per series with aria-pressed=true by default', async () => {
    const el = await make({ mode: 'grouped' }, { categories: ['A', 'B'], series: [
      { name: 'S1', values: [1, 2] },
      { name: 'S2', values: [3, 4] },
    ] });
    const btns = [...el.querySelectorAll('.ds-chart__legend-item')];
    expect(btns.length).to.equal(2);
    btns.forEach((b) => expect(b.getAttribute('aria-pressed')).to.equal('true'));
  });

  it('toggling a legend button flips aria-pressed and removes that series geometry', async () => {
    const el = await make({ mode: 'grouped' }, { categories: ['A', 'B'], series: [
      { name: 'S1', values: [1, 2] },
      { name: 'S2', values: [3, 4] },
    ] });
    expect(bars(el).length, '2 categories × 2 series').to.equal(4);
    el.querySelectorAll('.ds-chart__legend-item')[0].click();
    await nextFrame();
    expect(bars(el).length, 'one series hidden → half the bars').to.equal(2);
    expect(el.querySelectorAll('.ds-chart__legend-item')[0].getAttribute('aria-pressed')).to.equal('false');
  });
});

/* =============================================================================
   SECTION 11 — options & data property
   ============================================================================= */
describe('ds-chart — options & data property', () => {
  it('hides gridlines when show-gridlines="false"', async () => {
    const on = await make({}, { categories: ['A'], series: [{ name: 'S', values: [10] }] });
    expect(on.querySelectorAll('.ds-chart__gridline').length).to.equal(5);
    const off = await make({ 'show-gridlines': 'false' }, { categories: ['A'], series: [{ name: 'S', values: [10] }] });
    expect(off.querySelectorAll('.ds-chart__gridline').length).to.equal(0);
  });

  it('clears legend-hidden series when the data property is reassigned', async () => {
    const el = await make({ mode: 'grouped' }, { categories: ['A'], series: [
      { name: 'S1', values: [1] },
      { name: 'S2', values: [2] },
    ] });
    el.querySelectorAll('.ds-chart__legend-item')[0].click();
    await nextFrame();
    expect(el._hidden.size, 'one series hidden').to.equal(1);
    // reassigning data resets the hidden set (set data { … _hidden.clear() })
    el.data = { categories: ['X'], series: [{ name: 'N1', values: [5] }, { name: 'N2', values: [6] }] };
    await nextFrame();
    expect(el._hidden.size, 'hidden set cleared on new data').to.equal(0);
    expect(bars(el).length, 'both new series render').to.equal(2);
  });
});
