/* =============================================================================
   ds-kpi-card — Dashboard metric tile (UEMS Design System 3.0).
   Spec: design-system/handoff/kpi-card.md  (Figma node 19414:1029).

   This is the METRIC family (size = default | wide). The severity-breakdown
   family (Multi / Single / Two) is the separate <ds-kpi-breakdown> element.
   Legacy `variant="multi|single|two"` + `.chips` is still rendered here for
   backwards compatibility, but new code should use <ds-kpi-breakdown>.

   Canonical API (per spec):
     <ds-kpi-card
       size="default|wide"
       type="default|description|date|gauge|desc+date|desc+gauge|date+gauge|desc+link"
       state="default|success|warning|alert"
       value="30" title="Devices" subtitle="Connected in the last 24 hours"
       trend="down" trend-value="4" trend-sentiment="positive|negative|neutral"
       period-label="7 days"
       link-label="Devices List" link-href="/devices"
       gauge-value="86"            <!-- 0–100; drives the arc + centred % -->
       gauge-label="SLA"
       gauge-position="end|bottom"                    <!-- default end -->
       chart-type="gauge|line" sparkline-values="20,35,28,44,38,52,48"
       show-icon show-trend show-subtitle   <!-- default true -->
       loading clickable dir="rtl">
       <ds-icon slot="icon" name="clock"></ds-icon>   <!-- or icon="clock" -->
     </ds-kpi-card>

   chart-type: which chart renders in the gauge/chart slot — the semicircle
   % gauge (default, driven by `gauge-value`) or a line sparkline (set
   chart-type="line" + `sparkline-values`, a comma-separated number list).
   Both share the same slot + `gauge-position` placement.

   Back-compat aliases (deprecated): variant→size, label→title,
   description→subtitle, date→period-label, numeric trend→trend-value,
   trend-tone→trend-sentiment.

   Events:
     - ds-kpi-card-select  { source, label, value, href? }
     - ds-kpi-card-trend   { source: 'pill' }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Trend badge + icon slot render <ds-icon> (up-trend / down-trend sprites). */
import '../../icons/icon.js';
/* Trend indicator = the shared Badge component (token-driven state colors),
   not a hand-rolled chip. */
import '../badge/badge.js';
/* The gauge/chart slot renders the shared Chart component (type="gauge" or
   "line") — no bespoke SVG here. */
import '../chart/chart.js?v=9';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-kpi-card-badge-css', '../badge/badge.css');
_injectCss('ds-kpi-card-chart-css', '../chart/chart.css');

const VARIANTS    = ['default', 'wide', 'multi', 'single', 'two'];
const STATES      = ['default', 'success', 'warning', 'alert'];
const TREND_TONES = ['positive', 'negative', 'neutral'];

export class DsKpiCard extends HTMLElement {
  static get observedAttributes() {
    return [
      // canonical
      'size', 'type', 'state',
      'value', 'title', 'subtitle',
      'trend', 'trend-value', 'trend-sentiment',
      'period-label', 'link-label', 'link-href',
      'gauge-value', 'gauge-label', 'gauge-position',
      'chart-type', 'sparkline-values',
      'show-icon', 'show-trend', 'show-subtitle',
      'icon', 'loading', 'clickable', 'dir', 'rtl',
      // legacy aliases
      'variant', 'label', 'sublabel', 'description', 'date',
      'gauge', 'trend-tone', 'trend-pill',
    ];
  }

  connectedCallback() {
    this._mounted = true;
    this._render();
    /* Re-evaluate the label ellipsis/tooltip when the card is resized (its
       width — hence whether the label overflows — is layout-dependent). */
    if (typeof ResizeObserver !== 'undefined' && !this._labelRO) {
      this._labelRO = new ResizeObserver(() => this._syncLabelTip());
      this._labelRO.observe(this);
    }
  }
  disconnectedCallback() { if (this._labelRO) { this._labelRO.disconnect(); this._labelRO = null; } }

  /* Single-line label: show the full text as a title tooltip only when it's
     actually truncated (scrollWidth exceeds the visible box). */
  _syncLabelTip() {
    const el = this.querySelector('.ds-kpi-card__label');
    if (!el) return;
    const truncated = el.scrollWidth > el.clientWidth + 1;
    let tip = el.parentElement && el.parentElement.matches('ds-tooltip.ds-kpi-card__label-tip')
      ? el.parentElement : null;
    if (truncated) {
      /* Wrap the label in a ds-tooltip ONLY while it's clipped, so the styled
         tooltip appears on hover just for truncated labels. The wrapper is a
         full-width block so the label's ellipsis still resolves inside it. */
      if (!tip) {
        tip = document.createElement('ds-tooltip');
        tip.className = 'ds-kpi-card__label-tip';
        tip.setAttribute('show-icon', 'false');
        tip.setAttribute('position', 'up-center');
        el.parentNode.insertBefore(tip, el);
        tip.appendChild(el);
      }
      tip.setAttribute('text', el.textContent);
    } else if (tip) {
      /* No longer clipped — unwrap so there's no hover tooltip. */
      tip.parentNode.insertBefore(el, tip);
      tip.remove();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    /* `title` collides with the native HTML tooltip attribute — left on the
       host, the browser shows an unwanted hover tooltip over the whole card
       (e.g. the header text popping up as a native tip). Capture the text
       once, then strip the DOM attribute; `_render()` reads the cached value
       instead of the (now absent) attribute. The strip re-enters this
       callback with newVal === null, which just falls through to the normal
       re-render below. */
    if (name === 'title' && newVal != null) {
      this._titleText = newVal;
      this.removeAttribute('title');
      return;
    }
    if (this._mounted) this._render();
  }

  /* Legacy severity chips for multi/single/two. [{value,label,tone,href?}] */
  get chips() { return this._chips || []; }
  set chips(v) { this._chips = Array.isArray(v) ? v.slice() : []; if (this._mounted) this._render(); }

  // ---- value parsing ------------------------------------------------------
  _parseGauge(raw) {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (s.includes('/')) {
      const [a, b] = s.split('/').map(Number);
      if (!isFinite(a) || !isFinite(b) || b <= 0) return null;
      return Math.max(0, Math.min(1, a / b));
    }
    const n = Number(s);
    if (!isFinite(n)) return null;
    return Math.max(0, Math.min(1, n > 1 ? n / 100 : n));   // accept 0–1 or 0–100
  }

  _parseTrend(raw) {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  /* `sparkline-values="20,35,28,44,38,52,48"` → number array (needs ≥2 points
     to draw a line). Non-numeric entries are dropped rather than failing the
     whole attribute. */
  _parseSparkline(raw) {
    if (raw == null) return null;
    const nums = String(raw).split(',').map((s) => Number(s.trim())).filter((n) => isFinite(n));
    return nums.length > 1 ? nums : null;
  }

  // ---- part renderers -----------------------------------------------------
  _renderIconBadge(iconName, state) {
    if (!iconName) return '';
    return `
      <span class="ds-kpi-card__icon-badge ds-kpi-card__icon-badge--${state}" aria-hidden="true">
        <ds-icon name="${iconName}" size="20"></ds-icon>
      </span>`;
  }

  /* The gauge/chart slot is always the shared <ds-chart> — never a bespoke
     SVG. This only emits the placeholder markup (type + wrapper); `.data` is
     assigned after `innerHTML` is set, in the wiring pass at the end of
     `_render()`, since ds-chart takes its data via a JS property. */
  _renderChart(chartType, sparkline) {
    const type = (chartType === 'line' && sparkline) ? 'line' : 'gauge';
    return `
      <span class="ds-kpi-card__gauge">
        <ds-chart class="ds-kpi-card__chart-el" type="${type}" show-legend="false"></ds-chart>
      </span>`;
  }

  /* Trend indicator = <ds-badge>. Direction sets the up/down-trend sprite
     icon, sentiment maps to a badge state (positive→success, negative→
     critical, neutral→default) so the colours stay token-driven. */
  _renderDelta(trendNum, tone, dirOverride) {
    if (trendNum === null) return '';
    const dir = (dirOverride === 'up' || dirOverride === 'down') ? dirOverride : (trendNum >= 0 ? 'up' : 'down');
    const _tone = TREND_TONES.includes(tone) ? tone : (dir === 'up' ? 'positive' : 'negative');
    const state = _tone === 'positive' ? 'success' : _tone === 'negative' ? 'critical' : 'default';
    const abs = Math.abs(trendNum);
    /* Increment/decrement icons = the sprite's up-trend / down-trend (the same
       icons the Figma trend-badge instances, 13824:171/172). */
    const icon = dir === 'up' ? 'up-trend' : 'down-trend';
    return `<ds-badge class="ds-kpi-card__delta" variant="subtle" state="${state}" size="medium" shape="rounded" icon="${icon}" label="${abs}"></ds-badge>`;
  }

  /* Date-range selector (period label + chevron) — replaces the icon slot. */
  _renderSelector(periodLabel) {
    if (!periodLabel) return '';
    return `
      <button type="button" class="ds-kpi-card__selector" data-selector>
        <span>${periodLabel}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
      </button>`;
  }

  _renderTrendPill(text) {
    if (!text) return '';
    return `
      <button type="button" class="ds-kpi-card__trend-pill" data-trend-pill>
        <span>${text}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
      </button>`;
  }

  _renderLink(linkLabel, linkHref) {
    if (!linkLabel) return '';
    return `
      <a class="ds-kpi-card__link" href="${linkHref || '#'}" data-link>
        <span>${linkLabel}</span>
        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l6-6 M5 3h4v4"/></svg>
      </a>`;
  }

  // ---- legacy group (multi/single/two) ------------------------------------
  _renderSeverityChip(c, variant) {
    const tone = ['critical', 'warning', 'info', 'neutral', 'success'].includes(c.tone) ? c.tone : 'neutral';
    const linkLabel = c.linkLabel || (variant === 'single' || variant === 'two' ? 'Across all locations' : '');
    const link = (c.href || linkLabel)
      ? `<a class="ds-kpi-card__chip-link" href="${c.href || '#'}"><span>${linkLabel}</span>
           <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l6-6 M5 3h4v4"/></svg></a>`
      : '';
    return `
      <div class="ds-kpi-card__chip ds-kpi-card__chip--${tone}">
        <span class="ds-kpi-card__chip-value">${c.value ?? ''}</span>
        <span class="ds-kpi-card__chip-label">${c.label ?? ''}</span>
        ${link}
      </div>`;
  }

  _renderGroupHeader({ value, label, description, trendPill, isLarge }) {
    return `
      <div class="ds-kpi-card__group-header">
        <div class="ds-kpi-card__group-text">
          <div class="ds-kpi-card__group-value${isLarge ? ' ds-kpi-card__group-value--large' : ''}">${value || ''}</div>
          ${label ? `<div class="ds-kpi-card__group-label">${label}</div>` : ''}
          ${description ? `<div class="ds-kpi-card__group-description">${description}</div>` : ''}
        </div>
        ${this._renderTrendPill(trendPill)}
      </div>`;
  }

  // ---- render -------------------------------------------------------------
  _render() {
    // size (canonical) ⟶ falls back to legacy `variant`
    const sizeAttr = this.getAttribute('size');
    const variant  = (sizeAttr && VARIANTS.includes(sizeAttr))
      ? sizeAttr : enumAttr(this, 'variant', VARIANTS, 'default');
    const state    = enumAttr(this, 'state', STATES, 'default');

    // content (canonical ⟶ legacy alias)
    const value    = this.getAttribute('value') || '';
    const label    = this._titleText               || this.getAttribute('label')       || '';
    const desc     = this.getAttribute('subtitle') || this.getAttribute('description')  || '';
    const period   = this.getAttribute('period-label') || this.getAttribute('date')     || '';
    const icon     = this.getAttribute('icon') || '';
    const gaugeLbl = this.getAttribute('gauge-label') || '';
    const linkLabel = this.getAttribute('link-label') || '';
    const linkHref  = this.getAttribute('link-href')  || '#';
    const trendPill = this.getAttribute('trend-pill') || '';

    // gauge: canonical `gauge-value` (0–100) or legacy `gauge` (0–1 or a/b)
    const gauge = this._parseGauge(
      this.getAttribute('gauge-value') != null ? this.getAttribute('gauge-value') : this.getAttribute('gauge')
    );
    /* gauge-position: "end" (default — trailing, beside the value) or "bottom"
       (new — the gauge stacks below the value/label/desc column instead of
       sitting to the side). Default/Wide sizes only. */
    const gaugeBelow = enumAttr(this, 'gauge-position', ['end', 'bottom'], 'end') === 'bottom';
    // chart-type: "gauge" (default) or "line" — a sparkline alternative that
    // fills the same slot. Only takes effect with valid sparkline-values.
    const chartType = enumAttr(this, 'chart-type', ['gauge', 'line'], 'gauge');
    const sparkline = chartType === 'line' ? this._parseSparkline(this.getAttribute('sparkline-values')) : null;

    // trend: canonical (value + direction + sentiment) or legacy numeric
    const trendValAttr = this.getAttribute('trend-value');
    const trendRaw     = this.getAttribute('trend');
    let trendNum, trendDir;
    if (trendValAttr != null && trendValAttr !== '') {
      trendNum = this._parseTrend(trendValAttr);
      trendDir = (trendRaw === 'up' || trendRaw === 'down')
        ? trendRaw : (trendNum !== null && trendNum < 0 ? 'down' : 'up');
    } else {
      trendNum = this._parseTrend(trendRaw);
      trendDir = (trendNum !== null && trendNum < 0) ? 'down' : 'up';
    }
    const trendTone = this.getAttribute('trend-sentiment') || this.getAttribute('trend-tone') || '';

    // visibility toggles (default on)
    const showIcon = this.getAttribute('show-icon')     !== 'false';
    const showTrend = this.getAttribute('show-trend')    !== 'false';
    const showSub  = this.getAttribute('show-subtitle') !== 'false';

    const loading   = boolAttr(this, 'loading');
    const clickable = boolAttr(this, 'clickable');
    const rtl       = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';

    // host classes
    [...this.classList].forEach((c) => { if (c.startsWith('ds-kpi-card')) this.classList.remove(c); });
    this.classList.add('ds-kpi-card', `ds-kpi-card--${variant}`, `ds-kpi-card--${state}`);
    if (clickable && !loading) this.classList.add('ds-kpi-card--clickable');
    if (loading) this.classList.add('ds-kpi-card--loading');
    if (rtl) this.setAttribute('dir', 'rtl');

    if (clickable && !loading) {
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      if (!this.hasAttribute('aria-label') && label && value) this.setAttribute('aria-label', `${label}, ${value}`);
    } else {
      this.removeAttribute('role'); this.removeAttribute('tabindex');
    }

    const delta = showTrend ? this._renderDelta(trendNum, trendTone, trendDir) : '';
    const subHTML = (desc && showSub) ? `<p class="ds-kpi-card__description">${desc}</p>` : '';

    /* ── Legacy group variants (Multi / Single / Two) ─────────────────── */
    if (variant === 'multi' || variant === 'single' || variant === 'two') {
      const isLarge = (variant === 'single' || variant === 'two');
      const header = this._renderGroupHeader({ value, label, description: desc, trendPill, isLarge });
      const chips = `<div class="ds-kpi-card__chip-grid">${(this._chips || []).map(c => this._renderSeverityChip(c, variant)).join('')}</div>`;
      this.innerHTML = header + chips;
    }

    /* ── Wide ─────────────────────────────────────────────────────────── */
    else if (variant === 'wide') {
      const isDescLink = !!linkLabel && !!desc;
      const showGauge  = gauge !== null || sparkline !== null;
      const showBadge  = showIcon && !showGauge && !!icon && !isDescLink;

      if (isDescLink) {
        this.innerHTML = `
          <div class="ds-kpi-card__wide ds-kpi-card__wide--desc-link">
            ${showIcon ? this._renderIconBadge(icon, state) : ''}
            <div class="ds-kpi-card__wide-body">
              ${label ? `<h3 class="ds-kpi-card__label">${label}</h3>` : ''}
              ${subHTML}
              ${this._renderLink(linkLabel, linkHref)}
            </div>
            <div class="ds-kpi-card__wide-end">
              <div class="ds-kpi-card__value ds-kpi-card__value--display-sm">${loading ? ' ' : value}</div>
            </div>
          </div>`;
      } else if (showGauge && gaugeBelow) {
        /* gauge-position="bottom" on Wide: value/label/desc stack on top,
           full width; the gauge sits below instead of trailing to the right. */
        this.innerHTML = `
          <div class="ds-kpi-card__wide ds-kpi-card__wide--gauge-bottom">
            <div class="ds-kpi-card__wide-body">
              <div class="ds-kpi-card__value-row">
                <div class="ds-kpi-card__value">${loading ? ' ' : value}</div>${delta}
              </div>
              ${label ? `<h3 class="ds-kpi-card__label">${label}</h3>` : ''}
              ${subHTML}
            </div>
            <div class="ds-kpi-card__wide-end ds-kpi-card__wide-end--bottom">${this._renderChart(chartType, sparkline)}</div>
          </div>`;
      } else {
        this.innerHTML = `
          <div class="ds-kpi-card__wide">
            <div class="ds-kpi-card__wide-body">
              <div class="ds-kpi-card__value-row">
                <div class="ds-kpi-card__value">${loading ? ' ' : value}</div>${delta}
              </div>
              ${label ? `<h3 class="ds-kpi-card__label">${label}</h3>` : ''}
              ${subHTML}
            </div>
            <div class="ds-kpi-card__wide-end">
              ${showGauge ? this._renderChart(chartType, sparkline) : ''}
              ${showBadge ? this._renderIconBadge(icon, state) : ''}
            </div>
          </div>`;
      }
    }

    /* ── Default (metric) ─────────────────────────────────────────────── */
    else {
      const hasGauge    = gauge !== null || sparkline !== null;
      const isDatePlus  = !!period && hasGauge;       // date+gauge
      const showBadge   = showIcon && !!icon && !hasGauge && !period;
      const showSelector = !!period && !isDatePlus;   // date / desc+date

      if (hasGauge && gaugeBelow) {
        /* gauge-position="bottom": value/label/(date)/desc stack on top, full
           width; the gauge sits BELOW that column instead of trailing beside
           it (vs. the default "end" position, which is right/trailing). */
        this.innerHTML = `
          <div class="ds-kpi-card__default ds-kpi-card__default--gauge-bottom">
            <div class="ds-kpi-card__default-body">
              <div class="ds-kpi-card__value-row">
                <div class="ds-kpi-card__value">${loading ? ' ' : value}</div>${delta}
              </div>
              ${label ? `<h3 class="ds-kpi-card__label">${label}</h3>` : ''}
              ${period ? `<div class="ds-kpi-card__date">${period}</div>` : ''}
              ${subHTML}
            </div>
            <div class="ds-kpi-card__default-end ds-kpi-card__default-end--bottom">${this._renderChart(chartType, sparkline)}</div>
          </div>`;
      } else if (isDatePlus) {
        this.innerHTML = `
          <div class="ds-kpi-card__default ds-kpi-card__default--date-gauge">
            <div class="ds-kpi-card__default-body">
              ${label ? `<h3 class="ds-kpi-card__label">${label}</h3>` : ''}
              <div class="ds-kpi-card__date">${period}</div>
              <div class="ds-kpi-card__value-row">
                <div class="ds-kpi-card__value ds-kpi-card__value--display-sm">${loading ? ' ' : value}</div>${delta}
              </div>
              ${subHTML}
            </div>
            <div class="ds-kpi-card__default-end">${this._renderChart(chartType, sparkline)}</div>
          </div>`;
      } else {
        const left = `
          <div class="ds-kpi-card__default-body">
            <div class="ds-kpi-card__value-row">
              <div class="ds-kpi-card__value">${loading ? ' ' : value}</div>${delta}
            </div>
            ${label ? `<h3 class="ds-kpi-card__label">${label}</h3>` : ''}
            ${subHTML}
          </div>`;
        const right = `
          <div class="ds-kpi-card__default-end">
            ${hasGauge ? this._renderChart(chartType, sparkline) : ''}
            ${showSelector ? this._renderSelector(period) : ''}
            ${showBadge ? this._renderIconBadge(icon, state) : ''}
          </div>`;
        this.innerHTML = `<div class="ds-kpi-card__default">${left}${right}</div>`;
      }
    }

    // Chart data is a JS property on <ds-chart>, not an attribute — assign it
    // once the placeholder markup above is in the DOM.
    const chartEl = this.querySelector('.ds-kpi-card__chart-el');
    if (chartEl) {
      if (chartType === 'line' && sparkline) {
        chartEl.data = {
          categories: sparkline.map((_, i) => String(i + 1)),
          series: [{ name: gaugeLbl || 'Trend', values: sparkline }],
        };
      } else {
        chartEl.data = { value: Math.round((gauge ?? 0) * 100), label: gaugeLbl };
      }
    }

    // wire interactions
    this.querySelector('[data-link]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-kpi-card-select', { bubbles: true, detail: { source: 'link', href: linkHref, label, value } }));
    });
    this.querySelector('[data-selector]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('ds-kpi-card-period', { bubbles: true, detail: { source: 'selector', value: period, anchor: e.currentTarget } }));
    });
    this.querySelector('[data-trend-pill]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('ds-kpi-card-trend', { bubbles: true, detail: { source: 'pill', value: trendPill, label, anchor: e.currentTarget } }));
    });

    if (clickable && !loading && !this._clickWired) {
      this.addEventListener('click', (e) => {
        if (e.target.closest('[data-link],[data-selector],[data-trend-pill],.ds-kpi-card__chip-link')) return;
        this.dispatchEvent(new CustomEvent('ds-kpi-card-select', { bubbles: true, detail: { source: 'card', label: this._titleText || this.getAttribute('label'), value: this.getAttribute('value') } }));
      });
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.dispatchEvent(new CustomEvent('ds-kpi-card-select', { bubbles: true, detail: { source: 'keyboard', label: this._titleText || this.getAttribute('label'), value: this.getAttribute('value') } }));
        }
      });
      this._clickWired = true;
    }

    /* Label overflow → title tooltip (measure after layout). */
    requestAnimationFrame(() => this._syncLabelTip());
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-kpi-card')) {
  customElements.define('ds-kpi-card', DsKpiCard);
}

/* =============================================================================
   ds-kpi-group — legacy light-DOM layout helper (row of tiles). Kept for
   backwards compatibility (Online/Offline strips, paired Allocated/Free).
   ============================================================================= */
const GROUP_VARIANTS = ['two', 'multi'];

export class DsKpiGroup extends HTMLElement {
  static get observedAttributes() { return ['variant', 'rtl']; }
  connectedCallback() { this._mounted = true; this._apply(); }
  attributeChangedCallback() { if (this._mounted) this._apply(); }
  _apply() {
    const variant = enumAttr(this, 'variant', GROUP_VARIANTS, 'multi');
    [...this.classList].forEach((c) => { if (c.startsWith('ds-kpi-group')) this.classList.remove(c); });
    this.classList.add('ds-kpi-group', `ds-kpi-group--${variant}`);
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl'); else this.removeAttribute('dir');
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-kpi-group')) {
  customElements.define('ds-kpi-group', DsKpiGroup);
}
