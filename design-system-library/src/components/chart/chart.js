/* =============================================================================
   <ds-chart type="column" mode="grouped" show-legend show-gridlines
             show-data-labels legend-position="bottom" loading rtl></ds-chart>

   Self-contained SVG chart renderer — NO external charting library.

   - type ∈ column | bar | line | pie | donut | funnel | gauge   (default column)
   - mode ∈ single | grouped | stacked   (column/bar only, default single)
   - show-legend       default true   (set show-legend="false" to hide)
   - show-gridlines    default true   (set show-gridlines="false" to hide)
   - show-data-labels  default false
   - legend-position ∈ top | bottom | left | right   (default bottom)
   - loading           boolean — render a chart-shaped skeleton
   - rtl               mirror axis side / legend / labels

   Data via JS property (or setData):
     chart.data = { categories:[...], series:[{ name, values:[...] }] };
   Pie/donut/funnel use the first series' values (each value = a slice).
   Gauge uses a single value 0–100:  chart.data = { value, label };

   The component ships with default sample data so it renders standalone.

   Bare by design: no header / surface / padding — the host widget owns chrome.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const TYPES = ['column', 'bar', 'line', 'pie', 'donut', 'funnel', 'gauge'];
const MODES = ['single', 'grouped', 'stacked'];

/* Unique-id counter for per-series area gradients (line charts, opt-in `area`). */
let _areaSeq = 0;
const LEGEND_POS = ['top', 'bottom', 'left', 'right'];

/* Default sample data so <ds-chart> renders with nothing set. */
const SAMPLE_CARTESIAN = {
  categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    { name: 'Revenue', values: [42, 58, 50, 71] },
    { name: 'Profit', values: [22, 30, 28, 45] },
    { name: 'Forecast', values: [18, 24, 26, 33] },
  ],
};
const SAMPLE_PART = {
  categories: ['Direct', 'Organic', 'Referral', 'Social', 'Email'],
  series: [{ name: 'Sessions', values: [38, 27, 18, 12, 9] }],
};
const SAMPLE_GAUGE = { value: 68, label: 'Capacity' };

const NS = 'http://www.w3.org/2000/svg';

/* viewBox reference geometry (the SVG scales to 100% width via CSS). */
const VB_W = 320;
const VB_H = 200;
/* The gauge gets its own tight viewBox that hugs the semicircle — inside the
   shared 320×200 box the arc only spans ~52% of the width, so a gauge in an
   80px slot painted at ~42px. Tight box → the arc fills the container. */
const GAUGE_VB_W = 200;
const GAUGE_VB_H = 110;
const TICKS = 5;

/* Build an SVG path string for a bar rect with per-corner rounding. SVG's
   native <rect rx=…> rounds all four corners; bars need to round only the end
   that grows away from the baseline (top for columns, right or left for
   horizontal bars). For stacked mode, interior segments render with no
   corners so segments meet flush. `corners` is an object like
   `{ tl?, tr?, br?, bl? }` — omitted corners default to 0 (sharp). */
function barPath(x, y, w, h, corners) {
  const cap = Math.min(w / 2, h / 2);
  const tl = Math.min(corners.tl || 0, cap);
  const tr = Math.min(corners.tr || 0, cap);
  const br = Math.min(corners.br || 0, cap);
  const bl = Math.min(corners.bl || 0, cap);
  return [
    `M${x + tl},${y}`,
    `L${x + w - tr},${y}`,
    tr ? `Q${x + w},${y} ${x + w},${y + tr}` : `L${x + w},${y}`,
    `L${x + w},${y + h - br}`,
    br ? `Q${x + w},${y + h} ${x + w - br},${y + h}` : `L${x + w},${y + h}`,
    `L${x + bl},${y + h}`,
    bl ? `Q${x},${y + h} ${x},${y + h - bl}` : `L${x},${y + h}`,
    `L${x},${y + tl}`,
    tl ? `Q${x},${y} ${x + tl},${y}` : `L${x},${y}`,
    'Z',
  ].join(' ');
}

let _uid = 0;

export class DsChart extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'mode', 'show-legend', 'show-gridlines', 'show-data-labels',
            'legend-position', 'loading', 'rtl', 'color-by-category', 'area', 'monotone', 'fit'];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    this._data = null;            // user-set data (null → use sample)
    this._hidden = new Set();     // series indices toggled off via legend
  }

  connectedCallback() {
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
      /* Tooltip is a single reused HTML element. */
      this._tip = document.createElement('div');
      this._tip.className = 'ds-chart__tooltip';
      this._tip.hidden = true;
      this._root.appendChild(this._tip);
    }
    /* SVG text rides the viewBox scale; counter-scale it back to a fixed
       point size whenever the chart's rendered width changes. */
    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this._reflow());
      this._ro.observe(this);
    }
    /* A chart rendered while hidden (tab / drawer / below-fold) has no layout,
       so the initial font-fit + label-truncation can't measure. Re-run the fit
       the moment it becomes visible. */
    if (!this._io && typeof IntersectionObserver !== 'undefined') {
      this._io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) this._reflow();
      }, { threshold: 0 });
      this._io.observe(this);
    }
    this._render();
  }

  disconnectedCallback() {
    if (this._tip) this._tip.hidden = true;
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._io) { this._io.disconnect(); this._io = null; }
  }

  attributeChangedCallback() {
    if (this._root) this._render();
  }

  // ---- Public API ---------------------------------------------------------
  set data(value) { this._data = value || null; this._hidden.clear(); if (this._root) this._render(); }
  get data() { return this._data || this._defaultData(); }
  setData(value) { this.data = value; }

  /* Re-run the post-layout fit. Call after revealing a chart rendered while
     hidden (tab/drawer). Safe to call any time. */
  refit() { this._reflow(); }

  /* Responsive charts re-render (to recompute the aspect-matched viewBox);
     others just re-fit fonts. Guarded against re-entrancy. */
  _reflow() {
    if (this._reflowing) return;
    this._reflowing = true;
    try { if (this._fitResponsive) this._render(); else this._fitFonts(); }
    finally { this._reflowing = false; }
  }

  _defaultData() {
    const type = enumAttr(this, 'type', TYPES, 'column');
    if (type === 'gauge') return SAMPLE_GAUGE;
    if (type === 'pie' || type === 'donut' || type === 'funnel') return SAMPLE_PART;
    return SAMPLE_CARTESIAN;
  }

  // ---- Helpers ------------------------------------------------------------
  _seriesColorClass(i) { return `ds-chart__series-${(i % 7) + 1}`; }

  /* Funnel uses a 6-step single-hue sequential ramp (lightest → darkest, per
     Figma's Charts / Part-to-whole → Shape=Funnel) instead of the categorical
     7-hue palette — stages read as one continuous drop-off, not unrelated
     series. */
  _funnelColorClass(i) { return `ds-chart__funnel-${(i % 6) + 1}`; }

  /* Map a semantic palette name → the matching series color class, so data can
     request meaningful per-bar colors (e.g. severity: red/orange/yellow). */
  _namedColorClass(name) {
    const map = { blue: 1, green: 2, orange: 3, purple: 4, charoite: 4, red: 5, yellow: 6, grey: 7, gray: 7 };
    return `ds-chart__series-${map[String(name).toLowerCase()] || 1}`;
  }

  /* SVG text is authored in viewBox user units, so it scales up with the
     plot. Counter-scale the font vars by the live render scale so axis ticks,
     category and data labels read at a true ~11px (and the donut/gauge total
     at ~22px) at the viewBox's reference width or wider.

     Below that reference width (a chart squeezed into a slot smaller than
     its natural size, e.g. a KPI card's compact gauge), the text shrinks
     along with the plot instead of staying pinned at the same constant
     true-pixel size — that's what made it balloon past the shrunken arc.
     But it only shrinks down to MIN_FS/MIN_FS_LG: a legible floor, so a very
     small slot doesn't render the value unreadably tiny either. Sizes:
       true px = clamp(MIN, 22·min(scale,1), 22)   — capped at the default,
       floored at a readable minimum, linear in between. */
  _fitFonts() {
    if (!this._root) return;
    const svg = this._root.querySelector('.ds-chart__plot');
    const w = svg ? svg.getBoundingClientRect().width : 0;
    if (!w) return;
    const scale = w / (this._vbW || VB_W);   // user-unit → screen-px factor
    if (!isFinite(scale) || scale <= 0) return;
    const MIN_FS = 10, MIN_FS_LG = 14;
    const trueFs = Math.max(MIN_FS, Math.min(13, 13 * scale));
    const trueFsLg = Math.max(MIN_FS_LG, Math.min(22, 22 * scale));
    this._root.style.setProperty('--ds-chart-fs', (trueFs / scale).toFixed(3) + 'px');
    this._root.style.setProperty('--ds-chart-fs-lg', (trueFsLg / scale).toFixed(3) + 'px');
    /* Counter-scaled fixed size: renders a true 10px on screen at any chart
       scale (tick + category labels are pinned to this). */
    this._root.style.setProperty('--ds-chart-fs-fixed', (10 / scale).toFixed(3) + 'px');
    /* Line stroke: counter-scale so it renders a true 2px at any chart size. */
    this._root.style.setProperty('--ds-chart-stroke', (2 / scale).toFixed(3) + 'px');
    /* Line dot radius: counter-scale to a light ~3px marker at any chart size. */
    this._root.style.setProperty('--ds-chart-dot', (3 / scale).toFixed(3) + 'px');

    /* Gauge center value + label: reposition now that the real (floor/cap-
       clamped) font sizes are known, so the gap between the two lines — and
       the value's distance from the ring — tracks the actual rendered text
       size instead of a fixed guess that only worked at the reference scale.

       Two candidate positions for the value's baseline, and we take
       whichever sits LOWER (further from the ring, safer):
       - "nice": a fixed small offset above cy — the original design intent,
         which looks right once the container is at/near the gauge's own
         reference size (there's plenty of room above it).
       - "safe": anchored to the ring's inner edge with a real margin, using
         the text's own (floor-clamped) ascent — guarantees the value text's
         top never rises into the ring even when the container is squeezed
         well below the reference size and the floored font is proportionally
         big relative to the shrunken arc. */
    if (this._gaugeCy != null && this._gaugeInnerR != null) {
      const valueEl = this._root.querySelector('.ds-chart__center-value');
      const labelEl = this._root.querySelector('.ds-chart__center-label');
      const lineGapTrue = trueFsLg * 0.9 + 2;
      const lineGapUser = lineGapTrue / scale;

      const labelOffsetTrue = 2;
      const niceValueY = this._gaugeCy - (labelOffsetTrue + lineGapTrue) / scale;

      const topOfHoleUser = this._gaugeCy - this._gaugeInnerR;
      const marginTrue = 9;
      const ascentUser = (trueFsLg / scale) * 0.75;
      const safeValueY = topOfHoleUser + marginTrue / scale + ascentUser;

      let valueY = Math.max(niceValueY, safeValueY);
      /* At extreme squeezes (well below the ~80px case this was tuned for)
         there's genuinely not enough of the tight GAUGE_VB_H box left for
         both lines plus every margin — pushing the value down to clear the
         ring can push the label past the box's bottom edge instead. Clamp so
         the label never overflows; a few px of top margin lost here is far
         less broken-looking than text spilling outside the chart entirely. */
      const bottomMarginUser = 2 / scale;
      const maxLabelY = GAUGE_VB_H - bottomMarginUser;
      valueY = Math.min(valueY, maxLabelY - lineGapUser);
      const labelY = valueY + lineGapUser;

      if (valueEl) valueEl.setAttribute('y', valueY);
      if (labelEl) labelEl.setAttribute('y', labelY);
    }

    /* Donut center value + label: counter-scale the vertical offsets so the
       value→caption gap (and the value's offset from center) render at a
       constant true px at any chart scale. The fonts are already counter-scaled;
       without this the fixed user-unit offsets grew with the SVG scale, so a
       wide card (large scale) spaced the caption too far below the value. */
    if (this._donutCy != null) {
      const dv = this._root.querySelector('.ds-chart__center-value');
      const dl = this._root.querySelector('.ds-chart__center-label');
      if (dv) dv.setAttribute('y', (this._donutCy + 1 / scale).toFixed(3));
      if (dl) dl.setAttribute('y', (this._donutCy + 13 / scale).toFixed(3));
    }

    this._fitCatLabels();
  }

  /* Ellipsis-truncate axis category labels that exceed their available width
     (column: bar slot; horizontal: the left label gutter). Measured in user
     units via getComputedTextLength once fonts are applied. The full label is
     kept in a <title> so it stays available on hover. */
  _fitCatLabels() {
    if (!this._root) return;
    const labels = this._root.querySelectorAll('.ds-chart__cat[data-full]');
    labels.forEach((t) => {
      const full = t.dataset.full || '';
      const maxw = parseFloat(t.dataset.maxw || '0');
      const oldTitle = t.querySelector('title');
      if (oldTitle) oldTitle.remove();
      t.textContent = full;
      if (!maxw || typeof t.getComputedTextLength !== 'function') return;
      /* Small tolerance so a near-fit word (a couple px into the gutter) is left
         whole rather than clipped; only genuinely-too-long labels truncate. */
      if (t.getComputedTextLength() <= maxw * 1.12) return;
      let s = full;
      while (s.length > 1) {
        s = s.slice(0, -1);
        t.textContent = s + '…';
        if (t.getComputedTextLength() <= maxw) break;
      }
      const title = document.createElementNS(NS, 'title');
      title.textContent = full;
      t.appendChild(title);
    });
  }

  _el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  _niceMax(raw) {
    if (raw <= 0) return TICKS;
    const rough = raw / TICKS;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    let step;
    if (norm <= 1) step = 1; else if (norm <= 2) step = 2; else if (norm <= 5) step = 5; else step = 10;
    step *= mag;
    return step * TICKS;
  }

  // ---- Render -------------------------------------------------------------
  _render() {
    const type = enumAttr(this, 'type', TYPES, 'column');
    const mode = enumAttr(this, 'mode', MODES, 'single');
    const showLegend = this.getAttribute('show-legend') !== 'false';
    const showGrid = this.getAttribute('show-gridlines') !== 'false';
    const showLabels = boolAttr(this, 'show-data-labels');
    const legendPos = enumAttr(this, 'legend-position', LEGEND_POS, 'bottom');
    const loading = boolAttr(this, 'loading');
    const rtl = boolAttr(this, 'rtl');

    /* fit: 'fill' stretches to the box (cartesian charts); 'contain' fills the
       box height while keeping aspect + centering (donut/pie stay circular). */
    const fit = this.getAttribute('fit');
    const fitFill = fit === 'fill';
    const fitContain = fit === 'contain';
    const fitClass = fitFill ? ' ds-chart--fit-fill' : (fitContain ? ' ds-chart--fit-contain' : '');
    this._root.className = `ds-chart ds-chart--${type} ds-chart--legend-${legendPos}${fitClass}`;
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    if (loading) {
      this._renderSkeleton();
      return;
    }

    const data = this.data;
    const isPart = type === 'pie' || type === 'donut' || type === 'funnel';
    const isGauge = type === 'gauge';
    this._gaugeCy = null;      // set by _drawGauge; read back in _fitFonts()
    this._gaugeInnerR = null;

    /* Build SVG plot. The gauge uses its own tight viewBox so the semicircle
       fills the rendered width instead of floating in the shared 320×200 box. */
    this._vbW = isGauge ? GAUGE_VB_W : VB_W;
    /* Responsive height: when fit is set, match the viewBox height to the
       container's ACTUAL aspect ratio, so the chart fills any card height at its
       true proportions — no stretch (text stays undistorted) and no letterbox.
       Width stays the 320-unit reference, so text scales uniformly + readably. */
    const responsive = (fitFill || fitContain) && !isGauge;
    this._fitResponsive = responsive;
    let vbH = isGauge ? GAUGE_VB_H : VB_H;
    if (responsive) {
      /* Prefer the actual plot area (the prior render's wrapper) so the aspect
         excludes the legend/chrome — no residual stretch. Fall back to the host
         on first paint, then a reflow corrects it. */
      let cw = this.clientWidth, ch = this.clientHeight;
      const priorWrap = this._root && this._root.querySelector('.ds-chart__plot-wrap');
      if (priorWrap) {
        const b = priorWrap.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) { cw = b.width; ch = b.height; }
      }
      if (cw > 0 && ch > 0) vbH = Math.max(60, Math.round(this._vbW * ch / cw));
    }
    this._vbH = vbH;
    const svg = this._el('svg', {
      class: 'ds-chart__plot',
      viewBox: `0 0 ${this._vbW} ${this._vbH}`,
      /* viewBox now matches the container aspect, so 'none' fills exactly WITHOUT
         distorting; 'meet' (contain) keeps pie/donut centered. */
      preserveAspectRatio: fitContain ? 'xMidYMid meet' : (fitFill ? 'none' : 'xMidYMid meet'),
      'aria-hidden': 'true',
      focusable: 'false',
    });

    let legendSeries = [];   // [{ name, classIdx }]

    if (isGauge) {
      this._drawGauge(svg, data, showLabels);
    } else if (isPart) {
      legendSeries = this._drawPart(svg, type, data, showLabels, rtl);
    } else {
      legendSeries = this._drawCartesian(svg, type, mode, data, { showGrid, showLabels, rtl });
    }

    /* Legend (HTML buttons). */
    const legend = document.createElement('div');
    legend.className = 'ds-chart__legend';
    if (showLegend && legendSeries.length) {
      legendSeries.forEach((s) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const colorCls = s.colorCls || (s.colorVar ? '' : (type === 'funnel' ? this._funnelColorClass(s.classIdx) : this._seriesColorClass(s.classIdx)));
        btn.className = `ds-chart__legend-item ${colorCls}`.trim();
        if (s.colorVar) btn.style.setProperty('--ds-chart-color', s.colorVar);
        const off = this._hidden.has(s.classIdx);
        btn.setAttribute('aria-pressed', off ? 'false' : 'true');
        if (off) btn.classList.add('is-off');
        const swatchClass = type === 'line' ? 'ds-chart__swatch--line' : 'ds-chart__swatch--dot';
        btn.innerHTML = `<span class="ds-chart__swatch ${swatchClass}" aria-hidden="true"></span><span class="ds-chart__legend-label"></span>`;
        btn.querySelector('.ds-chart__legend-label').textContent = s.name;
        btn.addEventListener('click', () => {
          if (this._hidden.has(s.classIdx)) this._hidden.delete(s.classIdx);
          else this._hidden.add(s.classIdx);
          this._render();
        });
        legend.appendChild(btn);
      });
    }

    /* Visually-hidden data table fallback + container role/label. */
    const table = this._buildTable(type, data, isGauge, isPart);
    const ariaLabel = this._ariaSummary(type, data, isGauge, isPart);
    this._root.setAttribute('role', 'img');
    this._root.setAttribute('aria-label', ariaLabel);

    /* Re-attach (keep the persistent tooltip element). The SVG lives in a plain
       <div> wrapper: a div grows via flexbox (an inline <svg> does not), so with
       fit="fill"/"contain" the wrapper fills the card and the SVG fills it. */
    this._root.innerHTML = '';
    const plotWrap = document.createElement('div');
    plotWrap.className = 'ds-chart__plot-wrap';
    plotWrap.appendChild(svg);
    this._root.appendChild(plotWrap);
    if (showLegend && legendSeries.length) this._root.appendChild(legend);
    this._root.appendChild(table);
    this._root.appendChild(this._tip);

    this._fitFonts();
    this._wireTooltip();
  }

  // ---- Cartesian (column / bar / line) ------------------------------------
  _drawCartesian(svg, type, mode, data, opts) {
    const { showGrid, showLabels, rtl } = opts;
    const categories = (data && data.categories) || [];
    let series = (data && data.series) || [];
    /* Filter out legend-toggled series for geometry, but keep indices stable. */
    const allSeries = series;
    /* Categorical coloring (opt-in): in a single-series column/bar chart, color
       each bar by its category index instead of all sharing the series color. */
    const colorByCat = boolAttr(this, 'color-by-category') && allSeries.length === 1;
    const horizontal = type === 'bar';

    /* Plot inset: ~40px left for Y labels, ~24px bottom for X labels. */
    const padL = horizontal ? 90 : (rtl ? 16 : 40);
    const padR = horizontal ? 12 : (rtl ? 40 : 16);
    const padT = 12;
    const padB = 28;
    const plotW = this._vbW - padL - padR;
    const plotH = this._vbH - padT - padB;
    const x0 = padL;
    const y0 = padT;
    const baseY = padT + plotH;     // x-axis baseline
    const baseX = x0;               // y-axis line

    /* Determine max value (respect stacked + visible series). */
    const visIdx = allSeries.map((_, i) => i).filter((i) => !this._hidden.has(i));
    let maxVal = 0;
    if (mode === 'stacked') {
      categories.forEach((_, ci) => {
        let sum = 0;
        visIdx.forEach((si) => { sum += Number(allSeries[si].values[ci]) || 0; });
        if (sum > maxVal) maxVal = sum;
      });
    } else {
      visIdx.forEach((si) => {
        (allSeries[si].values || []).forEach((v) => { if (Number(v) > maxVal) maxVal = Number(v); });
      });
    }
    const axisMax = this._niceMax(maxVal) || TICKS;

    /* Map a value 0..axisMax to a length along the value axis. */
    const valLen = (v) => (Number(v) || 0) / axisMax * (horizontal ? plotW : plotH);

    /* --- Gridlines + value ticks --- */
    for (let t = 0; t <= TICKS; t++) {
      const frac = t / TICKS;
      const tickVal = Math.round(axisMax * frac);
      if (horizontal) {
        const gx = rtl ? (x0 + plotW - frac * plotW) : (x0 + frac * plotW);
        if (showGrid && t > 0) this._el('line', { class: 'ds-chart__gridline', x1: gx, y1: y0, x2: gx, y2: baseY }, svg);
        this._el('text', { class: 'ds-chart__tick', x: gx, y: baseY + 14, 'text-anchor': 'middle' }, svg).textContent = tickVal;
      } else {
        const gy = baseY - frac * plotH;
        if (showGrid && t > 0) this._el('line', { class: 'ds-chart__gridline', x1: x0, y1: gy, x2: x0 + plotW, y2: gy }, svg);
        const tx = rtl ? (x0 + plotW + 6) : (x0 - 6);
        this._el('text', { class: 'ds-chart__tick', x: tx, y: gy + 3, 'text-anchor': rtl ? 'start' : 'end' }, svg).textContent = tickVal;
      }
    }

    /* --- Axis line + baseline --- */
    const yLineX = rtl && !horizontal ? x0 + plotW : x0;
    this._el('line', { class: 'ds-chart__axis', x1: yLineX, y1: y0, x2: yLineX, y2: baseY }, svg); // value/Y axis
    this._el('line', { class: 'ds-chart__axis', x1: x0, y1: baseY, x2: x0 + plotW, y2: baseY }, svg); // baseline

    const nCat = categories.length || 1;
    const slot = (horizontal ? plotH : plotW) / nCat;

    /* --- Category labels --- (full text + available width recorded so
       _fitCatLabels() can ellipsis-truncate them once fonts are measured, so
       long labels never overlap a neighbour or spill off the plot). */
    categories.forEach((cat, ci) => {
      let t;
      if (horizontal) {
        const cy = y0 + slot * ci + slot / 2;
        const tx = rtl ? (x0 + plotW + 8) : (x0 - 8);
        t = this._el('text', { class: 'ds-chart__cat', x: tx, y: cy + 3, 'text-anchor': rtl ? 'start' : 'end' }, svg);
        t.dataset.maxw = String(Math.max(0, padL - 12));
      } else {
        const cx = rtl ? (x0 + plotW - slot * ci - slot / 2) : (x0 + slot * ci + slot / 2);
        t = this._el('text', { class: 'ds-chart__cat', x: cx, y: baseY + 16, 'text-anchor': 'middle' }, svg);
        t.dataset.maxw = String(Math.max(0, slot - 2));
      }
      t.dataset.full = String(cat);
      t.textContent = cat;
    });

    /* A line series may name its own color via series.color (e.g. 'red') — same
       named palette as bar/donut. Absent → the categorical series colour. */
    const lineCls = (s, i) => (s && typeof s.color === 'string') ? this._namedColorClass(s.color) : this._seriesColorClass(i);
    const legendSeries = allSeries.map((s, i) => ({
      name: s.name || `Series ${i + 1}`, classIdx: i,
      colorCls: (type === 'line' && typeof s.color === 'string') ? this._namedColorClass(s.color) : null,
    }));

    /* --- Series geometry --- */
    if (type === 'line') {
      const useArea = boolAttr(this, 'area');
      let defs = null;
      visIdx.forEach((si) => {
        const s = allSeries[si];
        const colorCls = lineCls(s, si);
        const pts = categories.map((_, ci) => {
          const cx = rtl ? (x0 + plotW - slot * ci - slot / 2) : (x0 + slot * ci + slot / 2);
          const cy = baseY - valLen(s.values[ci]);
          return [cx, cy];
        });
        /* Opt-in gradient area under the line: series colour → transparent. */
        if (useArea && pts.length) {
          if (!defs) defs = this._el('defs', {}, svg);
          const gid = `ds-chart-area-${++_areaSeq}`;
          const grad = this._el('linearGradient', { id: gid, class: colorCls, x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
          this._el('stop', { offset: '0', style: 'stop-color: var(--ds-chart-color); stop-opacity: .28' }, grad);
          this._el('stop', { offset: '1', style: 'stop-color: var(--ds-chart-color); stop-opacity: 0' }, grad);
          const fx = pts[0][0];
          const lx = pts[pts.length - 1][0];
          const aD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ` L${lx},${baseY} L${fx},${baseY} Z`;
          this._el('path', { class: 'ds-chart__area', d: aD, fill: `url(#${gid})` }, svg);
        }
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
        const path = this._el('path', { class: `ds-chart__line ${colorCls}`, d, pathLength: '1' }, svg);
        pts.forEach((p, ci) => {
          const dot = this._el('circle', {
            class: `ds-chart__dot ${colorCls}`,
            cx: p[0], cy: p[1], r: 3,
          }, svg);
          this._tagInteractive(dot, categories[ci], allSeries, ci, si);
          if (showLabels) this._el('text', { class: 'ds-chart__data-label', x: p[0], y: p[1] - 6, 'text-anchor': 'middle' }, svg).textContent = s.values[ci];
        });
      });
    } else {
      /* column / bar rects */
      const grouped = mode === 'grouped';
      const stacked = mode === 'stacked';
      const nVis = visIdx.length || 1;
      const groupPad = slot * 0.18;
      const groupInner = slot - groupPad * 2;
      const barThick = grouped ? groupInner / nVis : groupInner;

      categories.forEach((cat, ci) => {
        let stackAcc = 0;
        visIdx.forEach((si, vi) => {
          const s = allSeries[si];
          const len = valLen(s.values[ci]);
          let rectAttrs;
          if (horizontal) {
            const bandStart = y0 + slot * ci + groupPad;
            const by = grouped ? bandStart + barThick * vi : bandStart;
            const bh = barThick;
            let bx, bw = len;
            if (stacked) {
              bx = rtl ? (x0 + plotW - stackAcc - len) : (x0 + stackAcc);
              stackAcc += len;
            } else {
              bx = rtl ? (x0 + plotW - len) : x0;
            }
            rectAttrs = { x: bx, y: by, width: Math.max(0, bw), height: Math.max(0, bh - 1) };
          } else {
            const bandStart = rtl
              ? (x0 + plotW - slot * ci - slot + groupPad)
              : (x0 + slot * ci + groupPad);
            const bx = grouped ? bandStart + barThick * vi : bandStart;
            let by, bh = len;
            if (stacked) { by = baseY - stackAcc - len; stackAcc += len; }
            else { by = baseY - len; }
            rectAttrs = { x: bx, y: by, width: Math.max(0, barThick - 1), height: Math.max(0, bh) };
          }
          /* Per-bar color precedence: explicit data color (single series) →
             category palette (color-by-category) → series color. */
          const _named = (allSeries.length === 1 && Array.isArray(s.colors)) ? s.colors[ci] : null;
          const _barCls = _named ? this._namedColorClass(_named) : this._seriesColorClass(colorByCat ? ci : si);
          /* Round only the corner(s) at the end that grows away from the axis.
             Columns → top; horizontal bars → right (LTR) or left (RTL). In
             stacked mode only the outermost segment (last visIdx) rounds;
             interior segments stay sharp so they butt against neighbors. */
          const R = 2;
          const isEnd = !stacked || (vi === visIdx.length - 1);
          const corners = !isEnd ? {}
            : horizontal
              ? (rtl ? { tl: R, bl: R } : { tr: R, br: R })
              : { tl: R, tr: R };
          const _d = barPath(rectAttrs.x, rectAttrs.y, rectAttrs.width, rectAttrs.height, corners);
          const rect = this._el('path', { class: `ds-chart__bar ${_barCls}`, d: _d }, svg);
          this._tagInteractive(rect, cat, allSeries, ci, si);

          if (showLabels && len > 1) {
            if (horizontal) {
              const lx = rtl ? (rectAttrs.x - 4) : (rectAttrs.x + rectAttrs.width + 4);
              this._el('text', { class: 'ds-chart__data-label', x: lx, y: rectAttrs.y + rectAttrs.height / 2 + 3, 'text-anchor': rtl ? 'end' : 'start' }, svg).textContent = s.values[ci];
            } else {
              this._el('text', { class: 'ds-chart__data-label', x: rectAttrs.x + rectAttrs.width / 2, y: rectAttrs.y - 4, 'text-anchor': 'middle' }, svg).textContent = s.values[ci];
            }
          }
        });
      });
    }

    return legendSeries;
  }

  // ---- Part-to-whole (pie / donut / funnel) -------------------------------
  _drawPart(svg, type, data, showLabels, rtl) {
    const series0 = (data && data.series && data.series[0]) || { values: [] };
    const categories = (data && data.categories) || [];
    const values = series0.values || [];

    /* Monotone (pie/donut): step through ONE hue's shade ramp instead of the
       categorical palette — use for plain category breakdowns (e.g. OS split)
       where colour carries no status/severity meaning. `monotone` (boolean →
       blue) or `monotone="green|orange|red|…"` picks the hue. */
    const hasMono = type !== 'funnel' && this.hasAttribute('monotone');
    const monoAttr = this.getAttribute('monotone');
    const monoHue = (!monoAttr || monoAttr === 'true') ? 'blue' : monoAttr;
    const MONO_SHADES = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary', 'senary'];
    const monoVar = (i) => `var(--uems-bg-chart-${monoHue}-${MONO_SHADES[i % MONO_SHADES.length]})`;

    /* Per-slice colors (pie/donut) via series[0].colors — same opt-in contract as
       column/bar. Each entry is either a named palette key (blue|green|…) OR a raw
       CSS color (#hex / rgb() / var()) for an exact match. Absent → categorical. */
    const PALETTE = ['blue', 'green', 'orange', 'purple', 'charoite', 'red', 'yellow', 'grey', 'gray'];
    const named = (type !== 'funnel' && Array.isArray(series0.colors)) ? series0.colors : null;
    /* → { cls, color }: cls = a series/named class, color = an inline --ds-chart-color. */
    const partColor = (i) => {
      if (hasMono) return { cls: '', color: monoVar(i) };
      const c = named && named[i];
      if (c) return PALETTE.includes(String(c).toLowerCase())
        ? { cls: this._namedColorClass(c), color: null }
        : { cls: '', color: c };            // raw CSS color
      return { cls: this._seriesColorClass(i), color: null };
    };

    const legendSeries = values.map((v, i) => {
      if (type === 'funnel') return { name: categories[i] || `Slice ${i + 1}`, classIdx: i, colorCls: null, colorVar: null };
      const pc = partColor(i);
      return { name: categories[i] || `Slice ${i + 1}`, classIdx: i, colorCls: pc.cls || null, colorVar: pc.color };
    });

    if (type === 'funnel') {
      const cx = this._vbW / 2;
      const top = 16;
      const segH = (this._vbH - 32) / (values.length || 1);
      const maxV = Math.max(...values.map((v) => Number(v) || 0), 1);
      const maxW = this._vbW * 0.7;
      /* Corner radius per Figma spec (Charts / Part-to-whole → Shape=Funnel):
         the topmost visible segment rounds all four corners (it's the outer
         edge of the whole shape); every segment below it rounds only its
         bottom corners — the top stays sharp so it sits flush under the
         segment above, while the rounded bottom reads as a "step" down to
         the next (narrower) stage. */
      const R_TOP = 3;
      const R_REST = 4;
      let firstVisibleIdx = -1;
      for (let i = 0; i < values.length; i++) {
        if (!this._hidden.has(i)) { firstVisibleIdx = i; break; }
      }
      /* Percentage labels are relative to the top VISIBLE stage (the funnel's
         100% baseline) — matches Figma's reference values (100% / 74% / 52% /
         34%) and stays correct if the top stage is toggled off via legend. */
      const baseVal = firstVisibleIdx >= 0 ? (Number(values[firstVisibleIdx]) || 1) : 1;
      values.forEach((v, i) => {
        if (this._hidden.has(i)) return;
        const w = (Number(v) || 0) / maxV * maxW;
        const y = top + segH * i;
        const isTop = i === firstVisibleIdx;
        const corners = isTop
          ? { tl: R_TOP, tr: R_TOP, bl: R_TOP, br: R_TOP }
          : { bl: R_REST, br: R_REST };
        const d = barPath(cx - w / 2, y, Math.max(0, w), Math.max(0, segH), corners);
        const seg = this._el('path', {
          class: `ds-chart__funnel ${this._funnelColorClass(i)}`,
          d,
        }, svg);
        this._tagInteractive(seg, categories[i] || `Slice ${i + 1}`, [series0], i, 0);
        /* Stage percentage always renders (like the gauge's center value) —
           it's core to reading a funnel, not an optional data-label overlay. */
        const pct = Math.round((Number(v) || 0) / baseVal * 100);
        this._el('text', {
          class: 'ds-chart__data-label ds-chart__data-label--funnel',
          x: cx, y: y + segH / 2 + 3, 'text-anchor': 'middle',
        }, svg).textContent = `${pct}%`;
      });
      return legendSeries;
    }

    /* Pie / Donut: arc paths. */
    const cx = this._vbW / 2;
    const cy = this._vbH / 2;
    const rOuter = Math.min(this._vbW, this._vbH) / 2 - 16;
    const rInner = type === 'donut' ? rOuter * 0.58 : 0;
    const visValues = values.map((v, i) => (this._hidden.has(i) ? 0 : Number(v) || 0));
    const total = visValues.reduce((a, b) => a + b, 0) || 1;

    let angle = -Math.PI / 2;   // start at 12 o'clock
    const dir = rtl ? -1 : 1;
    values.forEach((v, i) => {
      if (this._hidden.has(i) || !(Number(v) > 0)) return;
      const frac = (Number(v) || 0) / total;
      const sweep = frac * Math.PI * 2 * dir;
      const a0 = angle;
      const a1 = angle + sweep;
      angle = a1;
      const large = Math.abs(sweep) > Math.PI ? 1 : 0;
      const sweepFlag = dir > 0 ? 1 : 0;
      const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      const [ox0, oy0] = p(rOuter, a0);
      const [ox1, oy1] = p(rOuter, a1);
      let d;
      let fillRule = null;
      if (frac >= 0.999999) {
        /* Single slice at 100% — an arc from a point back to itself collapses to
           nothing, so draw a full circle (pie) / full ring (donut) instead. */
        d = `M${cx - rOuter},${cy} A${rOuter},${rOuter} 0 1 1 ${cx + rOuter},${cy} A${rOuter},${rOuter} 0 1 1 ${cx - rOuter},${cy} Z`;
        if (rInner > 0) {
          d += ` M${cx - rInner},${cy} A${rInner},${rInner} 0 1 0 ${cx + rInner},${cy} A${rInner},${rInner} 0 1 0 ${cx - rInner},${cy} Z`;
          fillRule = 'evenodd';   // punch the donut hole
        }
      } else if (rInner > 0) {
        const [ix1, iy1] = p(rInner, a1);
        const [ix0, iy0] = p(rInner, a0);
        d = `M${ox0},${oy0} A${rOuter},${rOuter} 0 ${large} ${sweepFlag} ${ox1},${oy1} `
          + `L${ix1},${iy1} A${rInner},${rInner} 0 ${large} ${sweepFlag ? 0 : 1} ${ix0},${iy0} Z`;
      } else {
        d = `M${cx},${cy} L${ox0},${oy0} A${rOuter},${rOuter} 0 ${large} ${sweepFlag} ${ox1},${oy1} Z`;
      }
      const pc = partColor(i);
      const path = this._el('path', {
        class: `ds-chart__slice${pc.cls ? ' ' + pc.cls : ''}`, d,
        'fill-rule': fillRule,
        style: pc.color ? `--ds-chart-color: ${pc.color}` : null,
      }, svg);
      this._tagInteractive(path, categories[i] || `Slice ${i + 1}`, [series0], i, 0);

      if (showLabels) {
        const mid = (a0 + a1) / 2;
        const lr = rInner > 0 ? (rOuter + rInner) / 2 : rOuter * 0.62;
        const [lx, ly] = p(lr, mid);
        this._el('text', { class: 'ds-chart__data-label ds-chart__data-label--on-fill', x: lx, y: ly + 3, 'text-anchor': 'middle' }, svg)
          .textContent = `${Math.round(frac * 100)}%`;
      }
    });

    /* Donut center total. Value baseline just above center, label snug beneath.
       (y positions are refined in _fitFonts — counter-scaled so the value→label
       gap stays a constant true px at any chart scale.) */
    this._donutCy = (type === 'donut') ? cy : null;
    if (type === 'donut') {
      this._el('text', { class: 'ds-chart__center-value', x: cx, y: cy + 1, 'text-anchor': 'middle' }, svg).textContent = total;
      this._el('text', { class: 'ds-chart__center-label', x: cx, y: cy + 13, 'text-anchor': 'middle' }, svg)
        .textContent = series0.name || 'Total';
    }

    return legendSeries;
  }

  // ---- Gauge --------------------------------------------------------------
  _drawGauge(svg, data, showLabels) {
    const value = Math.max(0, Math.min(100, Number(data && data.value != null ? data.value : 0)));
    const label = (data && data.label) || '';
    /* Geometry fills the tight GAUGE_VB box edge-to-edge: the arc's outer edge
       (radius + half stroke, incl. the round caps) touches the viewBox sides. */
    const sw = 20;
    const cx = GAUGE_VB_W / 2;
    const r = (GAUGE_VB_W - sw) / 2;
    const cy = r + sw / 2;

    const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const aStart = Math.PI;            // 180°  (left)
    const aEnd = Math.PI * 2;          // 360°  (right) → semicircle over the top
    const aVal = aStart + (value / 100) * Math.PI;

    const [sx, sy] = p(aStart);
    const [ex, ey] = p(aEnd);
    /* Track (full semicircle). */
    this._el('path', {
      class: 'ds-chart__gauge-track',
      d: `M${sx},${sy} A${r},${r} 0 0 1 ${ex},${ey}`,
      fill: 'none', 'stroke-width': sw, 'stroke-linecap': 'round',
    }, svg);
    /* Value arc. */
    const [vx, vy] = p(aVal);
    const large = (aVal - aStart) > Math.PI ? 1 : 0;
    this._el('path', {
      class: 'ds-chart__gauge-value ds-chart__series-1',
      d: `M${sx},${sy} A${r},${r} 0 ${large} 1 ${vx},${vy}`,
      fill: 'none', 'stroke-width': sw, 'stroke-linecap': 'round',
    }, svg);
    /* Center value + label — inside the arc's inner hole (cy is the box bottom,
       so the label sits just above it rather than below, which would clip).
       y placeholders here; `_fitFonts()` repositions both once the actual
       (floor/cap-clamped) font sizes are known, so the gap between them
       tracks the real rendered text size instead of a fixed guess. */
    this._el('text', { class: 'ds-chart__center-value', x: cx, y: cy - 22, 'text-anchor': 'middle' }, svg).textContent = `${Math.round(value)}%`;
    if (label) this._el('text', { class: 'ds-chart__center-label', x: cx, y: cy - 2, 'text-anchor': 'middle' }, svg).textContent = label;
    this._gaugeCy = cy;
    this._gaugeInnerR = r - sw / 2;   // inner edge of the ring — the text's safe ceiling
  }

  // ---- Skeleton -----------------------------------------------------------
  _renderSkeleton() {
    this._root.removeAttribute('role');
    this._root.setAttribute('aria-busy', 'true');
    this._root.setAttribute('aria-label', 'Loading chart');
    const svg = this._el('svg', {
      class: 'ds-chart__plot ds-chart__skeleton',
      viewBox: `0 0 ${VB_W} ${VB_H}`,
      preserveAspectRatio: 'xMidYMid meet',
      'aria-hidden': 'true', focusable: 'false',
    });
    /* Title bar. */
    this._el('rect', { class: 'ds-chart__skeleton-rect', x: 8, y: 8, width: 120, height: 12, rx: 4 }, svg);
    /* ~5 bars rising. */
    const n = 5;
    const gap = 8;
    const left = 8;
    const usable = VB_W - 16;
    const bw = (usable - gap * (n - 1)) / n;
    const heights = [60, 92, 74, 120, 100];
    heights.forEach((h, i) => {
      this._el('rect', {
        class: 'ds-chart__skeleton-rect',
        x: left + i * (bw + gap), y: VB_H - 24 - h, width: bw, height: h, rx: 4,
      }, svg);
    });
    this._root.innerHTML = '';
    this._root.appendChild(svg);
    this._root.appendChild(this._tip);
  }

  // ---- Tooltip wiring -----------------------------------------------------
  _tagInteractive(node, category, allSeries, ci, si) {
    node.dataset.cat = category != null ? String(category) : '';
    node.dataset.ci = ci;
    node.dataset.si = si;
  }

  _wireTooltip() {
    const show = (e) => {
      const t = e.target;
      if (!(t instanceof SVGElement) || t.dataset.ci == null) { this._hideTip(); return; }
      const ci = Number(t.dataset.ci);
      const si = Number(t.dataset.si);
      const data = this.data;
      const allSeries = (data && data.series) || [];
      const cat = t.dataset.cat || '';
      /* For cartesian: list every visible series at this category.
         For part-to-whole/funnel: a single slice. */
      const type = enumAttr(this, 'type', TYPES, 'column');
      const single = type === 'pie' || type === 'donut' || type === 'funnel';
      let rows = '';
      if (single) {
        const s = allSeries[0] || { values: [] };
        const colorCls = type === 'funnel' ? this._funnelColorClass(ci) : this._seriesColorClass(ci);
        rows = `<div class="ds-chart__tip-row"><span class="ds-chart__swatch ds-chart__swatch--dot ${colorCls}"></span><span class="ds-chart__tip-name">${this._esc(cat)}</span><span class="ds-chart__tip-val">${this._esc(s.values[ci])}</span></div>`;
      } else if (allSeries.length === 1) {
        /* Single series → one row whose swatch matches the bar's own color
           (explicit data color → category palette → series color). */
        const s = allSeries[0];
        const named = Array.isArray(s.colors) ? s.colors[ci] : null;
        const cls = named ? this._namedColorClass(named)
          : this._seriesColorClass(boolAttr(this, 'color-by-category') ? ci : 0);
        rows = `<div class="ds-chart__tip-row"><span class="ds-chart__swatch ds-chart__swatch--dot ${cls}"></span><span class="ds-chart__tip-name">${this._esc(cat)}</span><span class="ds-chart__tip-val">${this._esc(s.values[ci])}</span></div>`;
      } else {
        allSeries.forEach((s, i) => {
          if (this._hidden.has(i)) return;
          rows += `<div class="ds-chart__tip-row"><span class="ds-chart__swatch ds-chart__swatch--dot ${this._seriesColorClass(i)}"></span><span class="ds-chart__tip-name">${this._esc(s.name || `Series ${i + 1}`)}</span><span class="ds-chart__tip-val">${this._esc(s.values[ci])}</span></div>`;
        });
      }
      this._tip.innerHTML = `<div class="ds-chart__tip-head">${this._esc(cat)}</div>${rows}`;
      this._tip.hidden = false;
      this._moveTip(e);
    };
    this._onPlotMove = (e) => {
      const t = e.target;
      if (t instanceof SVGElement && t.dataset.ci != null) { show(e); }
      else this._hideTip();
    };
    this._onPlotLeave = () => this._hideTip();
    const svg = this._root.querySelector('.ds-chart__plot');
    if (svg && !svg.classList.contains('ds-chart__skeleton')) {
      svg.addEventListener('mousemove', this._onPlotMove);
      svg.addEventListener('mouseleave', this._onPlotLeave);
    }
  }

  _moveTip(e) {
    const rootRect = this._root.getBoundingClientRect();
    let x = e.clientX - rootRect.left + 12;
    let y = e.clientY - rootRect.top + 12;
    const tw = this._tip.offsetWidth;
    if (x + tw > rootRect.width) x = e.clientX - rootRect.left - tw - 12;
    this._tip.style.left = `${x}px`;
    this._tip.style.top = `${y}px`;
  }

  _hideTip() { if (this._tip) this._tip.hidden = true; }

  // ---- Data table + a11y --------------------------------------------------
  _esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  _buildTable(type, data, isGauge, isPart) {
    const table = document.createElement('table');
    table.className = 'ds-chart__a11y-table';
    if (isGauge) {
      table.innerHTML = `<caption>Gauge</caption><tbody><tr><th scope="row">${this._esc((data && data.label) || 'Value')}</th><td>${this._esc(data && data.value)}</td></tr></tbody>`;
      return table;
    }
    const categories = (data && data.categories) || [];
    const series = (data && data.series) || [];
    const head = ['<th scope="col">Category</th>', ...series.map((s) => `<th scope="col">${this._esc(s.name)}</th>`)].join('');
    const rows = categories.map((cat, ci) => {
      const cells = series.map((s) => `<td>${this._esc(s.values[ci])}</td>`).join('');
      return `<tr><th scope="row">${this._esc(cat)}</th>${cells}</tr>`;
    }).join('');
    table.innerHTML = `<caption>${this._esc(type)} chart data</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody>`;
    return table;
  }

  _ariaSummary(type, data, isGauge, isPart) {
    if (isGauge) return `gauge chart, value ${data && data.value}${(data && data.label) ? `, ${data.label}` : ''}`;
    const series = (data && data.series) || [];
    const cats = (data && data.categories) || [];
    return `${type} chart, ${series.length} series, categories: ${cats.join(', ')}`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-chart')) {
  customElements.define('ds-chart', DsChart);
}
