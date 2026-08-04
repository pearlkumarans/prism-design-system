/* =============================================================================
   ds-kpi-breakdown — KPI card with a severity breakdown (UEMS Design System 3.0).
   Spec: design-system/handoff/kpi-card.md  (Figma "Multi / Single / Two").

   A header stat (value + title + subtitle + optional trend) plus a fixed
   4-cell severity grid: Critical / High / Medium / Low. Multi/Single/Two from
   Figma are the same composition at three sizes → the `layout` attribute:

     layout = compact  (Multi  — header on top, compact grid)
            = stacked  (Two    — header on top, roomier grid)
            = wide     (Single — header on the left, grid in a row on the right)

   API:
     <ds-kpi-breakdown
       layout="compact|stacked|wide"
       value="30" title="Devices" subtitle="Connected in the last 24 hours"
       trend="down" trend-value="4" trend-sentiment="positive"
       loading dir="rtl"></ds-kpi-breakdown>

     el.data = { critical: 139, high: 102, medium: 422, low: 123 };
     // optional: el.data = { critical:{value:139, label:'Critical', href:'#'}, ... }

   Event: ds-kpi-breakdown-select { severity, value, href? }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Delta badge renders <ds-icon> (up-trend / down-trend sprites). */
import '../../icons/icon.js';
/* Trend indicator = the shared Badge component (token-driven state colors),
   not a hand-rolled chip. */
import '../badge/badge.js';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-kpi-breakdown-badge-css', '../badge/badge.css');

const LAYOUTS = ['compact', 'stacked', 'wide'];
const TREND_TONES = ['positive', 'negative', 'neutral'];
const SEVERITIES = [
  { key: 'critical', label: 'Critical' },
  { key: 'high',     label: 'High' },
  { key: 'medium',   label: 'Medium' },
  { key: 'low',      label: 'Low' },
];
const SAMPLE = { critical: 139, high: 102, medium: 422, low: 123 };

export class DsKpiBreakdown extends HTMLElement {
  static get observedAttributes() {
    return ['layout', 'state', 'value', 'title', 'subtitle',
            'trend', 'trend-value', 'trend-sentiment', 'loading', 'dir', 'rtl', 'show-filter'];
  }

  connectedCallback() {
    this._mounted = true;
    this._render();
    /* Re-check label truncation on resize — a cell that fits at one width may
       ellipsis at another (e.g. the grid's own horizontal scroll/reflow). */
    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this._updateLabelTooltips());
      this._ro.observe(this);
    }
  }
  disconnectedCallback() { if (this._ro) { this._ro.disconnect(); this._ro = null; } }
  attributeChangedCallback(name, oldVal, newVal) {
    /* `title` collides with the native HTML tooltip attribute — left on the
       host, the browser shows an unwanted hover tooltip over the whole card.
       Capture the text once, then strip the DOM attribute; `_render()` reads
       the cached value instead of the (now absent) attribute. The strip
       re-enters this callback with newVal === null, which falls through to
       the normal re-render below. */
    if (name === 'title' && newVal != null) {
      this._titleText = newVal;
      this.removeAttribute('title');
      return;
    }
    if (this._mounted) this._render();
  }

  get data() { return this._data || SAMPLE; }
  set data(v) { this._data = v && typeof v === 'object' ? v : null; if (this._mounted) this._render(); }

  _parseTrend(raw) {
    if (raw == null) return null;
    const n = Number(String(raw).trim());
    return isFinite(n) ? n : null;
  }

  _renderDelta(num, tone, dir) {
    if (num === null) return '';
    const _dir = (dir === 'up' || dir === 'down') ? dir : (num >= 0 ? 'up' : 'down');
    const _tone = TREND_TONES.includes(tone) ? tone : (_dir === 'up' ? 'positive' : 'negative');
    const state = _tone === 'positive' ? 'success' : _tone === 'negative' ? 'critical' : 'default';
    /* Same up-trend / down-trend sprite icons as the Figma trend badge, now
       rendered via the shared Badge component (token-driven state colors). */
    const icon = _dir === 'up' ? 'up-trend' : 'down-trend';
    return `<ds-badge class="ds-kpi-card__delta" variant="subtle" state="${state}" size="medium" shape="rounded" icon="${icon}" label="${Math.abs(num)}"></ds-badge>`;
  }

  /* Small "redirect" (external/navigate) arrow — same glyph as the existing
     wide-layout "View" link, but shown inline next to EVERY severity label
     (all layouts) as a visual hint that the cell drills into a filtered view. */
  _redirectIcon() {
    return `<svg class="ds-kpi-breakdown__redirect-icon" aria-hidden="true" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l6-6 M5 3h4v4"/></svg>`;
  }

  _cell(sev, layout) {
    const raw = this.data[sev.key];
    const obj = (raw && typeof raw === 'object') ? raw : { value: raw };
    const value = obj.value ?? 0;
    const label = obj.label ?? sev.label;
    const href  = obj.href;
    const link = (layout === 'wide' && href)
      ? `<a class="ds-kpi-card__chip-link" href="${href}"><span>View</span>
           <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l6-6 M5 3h4v4"/></svg></a>`
      : '';
    /* The redirect arrow next to the label is a stand-in for the "View" link
       when there isn't room to show one (compact/stacked, or wide without an
       href) — skip it when the explicit "View ↗" link is already rendered,
       so the same affordance doesn't show twice on one cell. */
    return `
      <button type="button" class="ds-kpi-breakdown__cell ds-kpi-breakdown__cell--${sev.key}" data-sev="${sev.key}">
        <span class="ds-kpi-breakdown__count">${value}</span>
        <span class="ds-kpi-breakdown__label"><span class="ds-kpi-breakdown__label-text">${label}</span>${link ? '' : this._redirectIcon()}</span>
        ${link}
      </button>`;
  }

  _render() {
    const layout = enumAttr(this, 'layout', LAYOUTS, 'compact');
    const state  = this.getAttribute('state') || 'default';
    const value  = this.getAttribute('value') || '';
    const title  = this._titleText || '';
    const sub    = this.getAttribute('subtitle') || '';
    const loading = boolAttr(this, 'loading');
    const rtl    = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';

    const trendValAttr = this.getAttribute('trend-value');
    const trendRaw = this.getAttribute('trend');
    let trendNum, trendDir;
    if (trendValAttr != null && trendValAttr !== '') {
      trendNum = this._parseTrend(trendValAttr);
      trendDir = (trendRaw === 'up' || trendRaw === 'down') ? trendRaw : (trendNum !== null && trendNum < 0 ? 'down' : 'up');
    } else {
      trendNum = this._parseTrend(trendRaw);
      trendDir = (trendNum !== null && trendNum < 0) ? 'down' : 'up';
    }
    const trendTone = this.getAttribute('trend-sentiment') || '';
    const showFilter = boolAttr(this, 'show-filter');

    [...this.classList].forEach((c) => { if (c.startsWith('ds-kpi-breakdown')) this.classList.remove(c); });
    this.classList.add('ds-kpi-breakdown', `ds-kpi-breakdown--${layout}`, `ds-kpi-breakdown--${state}`);
    if (loading) this.classList.add('ds-kpi-breakdown--loading');
    if (rtl) this.setAttribute('dir', 'rtl');

    this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label') && title) this.setAttribute('aria-label', `${title}${value ? ', ' + value : ''}`);

    const header = `
      <div class="ds-kpi-breakdown__header">
        <div class="ds-kpi-breakdown__stat">
          <div class="ds-kpi-breakdown__value-row">
            <div class="ds-kpi-breakdown__value">${loading ? ' ' : value}</div>
            ${this._renderDelta(trendNum, trendTone, trendDir)}
          </div>
          ${title ? `<div class="ds-kpi-breakdown__title-row">
            <span class="ds-kpi-breakdown__title">${title}</span>
            ${showFilter ? `<button type="button" class="ds-kpi-breakdown__filter-btn" data-filter aria-label="Filter"><ds-icon name="filter" size="14"></ds-icon></button>` : ''}
          </div>` : ''}
          ${sub ? `<div class="ds-kpi-breakdown__subtitle">${sub}</div>` : ''}
        </div>
      </div>`;

    const grid = `<div class="ds-kpi-breakdown__grid">${SEVERITIES.map(s => this._cell(s, layout)).join('')}</div>`;

    this.innerHTML = header + grid;

    this.querySelectorAll('[data-sev]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sev');
        const raw = this.data[key];
        const obj = (raw && typeof raw === 'object') ? raw : { value: raw };
        this.dispatchEvent(new CustomEvent('ds-kpi-breakdown-select', {
          bubbles: true, detail: { severity: key, value: obj.value ?? raw, href: obj.href },
        }));
      });
    });

    this.querySelector('[data-filter]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('ds-kpi-breakdown-filter', { bubbles: true, detail: { anchor: e.currentTarget } }));
    });

    this._updateLabelTooltips();
  }

  /* Native `title` tooltip, added only when the label text is actually
     ellipsis-truncated (scrollWidth > clientWidth) — an untruncated label
     gets no tooltip, since the text is already fully visible. */
  _updateLabelTooltips() {
    this.querySelectorAll('.ds-kpi-breakdown__label-text').forEach((el) => {
      if (el.scrollWidth > el.clientWidth) el.setAttribute('title', el.textContent);
      else el.removeAttribute('title');
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-kpi-breakdown')) {
  customElements.define('ds-kpi-breakdown', DsKpiBreakdown);
}
