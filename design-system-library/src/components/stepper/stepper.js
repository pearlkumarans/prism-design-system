/* =============================================================================
   <ds-stepper>

   Progress indicator for a sequence of steps — horizontal or vertical, with the
   connector rendered as part of each step (leading for horizontal, trailing for
   vertical). Data-driven via the `steps` property; captures every state in one
   component:
     · upcoming / active / completed / error / warning / disabled
     · solid connector that fills as progress advances
     · linear (future steps locked) vs non-linear (any visited step clickable)
     · three sizes · RTL · reduced-motion aware

   Steps configured via the `items`/`steps` property:

     stepper.steps = [
       { id: 'account', label: 'Account',  description: 'Sign in', status: 'completed' },
       { id: 'details', label: 'Details',  description: 'Your info' },
       { id: 'plan',    label: 'Plan',     optional: true },
     ];

   Attributes:
     orientation        horizontal (default) | vertical
     size               sm | md (default) | lg
     active             index of the current step (default 0)
     mode               linear (default) | nonlinear
     clickable          make steps interactive (buttons)
     label-placement    below (default) | inline   (horizontal only)
     connector          solid (default) | dashed | none
     hide-numbers       hide the number inside the node
     hide-labels        hide the whole label block (compact / icon-only)
     hide-descriptions  hide the secondary description line
     rtl                mirror (also auto-detected from an ancestor [dir="rtl"])

   Events:
     ds-stepper-select   detail: { id, index, step }   (bubbles + composed)

   Methods:
     next() / prev() / goTo(index) / setStatus(id, status)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../../icons/icon.js';

/* Auto-load this component's stylesheet once (light-DOM). Idempotent. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-stepper-css', './stepper.css');

const ICON_SIZE = { sm: 12, md: 14, lg: 16 };

export class DsStepper extends HTMLElement {
  static get observedAttributes() {
    return ['orientation', 'size', 'active', 'mode', 'clickable', 'label-placement',
      'connector', 'hide-numbers', 'hide-labels', 'hide-descriptions', 'rtl'];
  }

  constructor() {
    super();
    // support `.steps` (or `.items`) set before upgrade
    for (const key of ['steps', 'items']) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const v = this[key]; delete this[key]; this._pending = v;
      }
    }
    this._steps = [];
    this._onClick = this._onClick.bind(this);
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    if (this._pending !== undefined) { this.steps = this._pending; this._pending = undefined; }
    if (!this._wired) {
      this.addEventListener('click', this._onClick);
      this.addEventListener('keydown', this._onKey);
      this._wired = true;
    }
    this._render();
  }

  attributeChangedCallback() { if (this.isConnected) this._render(); }

  /* ── data ──────────────────────────────────────────────────────────────── */
  get steps() { return this._steps; }
  set steps(v) { this._steps = Array.isArray(v) ? v.map((s) => ({ ...s })) : []; if (this.isConnected) this._render(); }
  get items() { return this.steps; }
  set items(v) { this.steps = v; }

  get active() { const n = parseInt(this.getAttribute('active'), 10); return Number.isNaN(n) ? 0 : n; }
  set active(v) { this.setAttribute('active', String(v)); }

  /* ── public methods ────────────────────────────────────────────────────── */
  next() { this.goTo(this.active + 1); }
  prev() { this.goTo(this.active - 1); }
  goTo(i) {
    const max = Math.max(0, this._steps.length - 1);
    this.active = Math.max(0, Math.min(max, i));
  }
  setStatus(id, status) {
    const s = this._steps.find((x) => x.id === id);
    if (s) { s.status = status; this._render(); }
  }

  /* ── internals ─────────────────────────────────────────────────────────── */
  _esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  _isRtl() {
    return boolAttr(this, 'rtl')
      || this.closest('[dir="rtl"]') != null
      || (typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl');
  }

  _statusFor(step, i) {
    if (step.status) return step.status;
    if (step.disabled) return 'disabled';
    const a = this.active;
    if (i < a) return 'completed';
    if (i === a) return 'active';
    return 'upcoming';
  }

  _canClick(status, i, clickable, mode) {
    if (status === 'disabled') return false;
    if (!clickable && mode !== 'nonlinear') return false;
    if (mode === 'linear' && i > this.active) return false;
    return true;
  }

  _render() {
    const orient = enumAttr(this, 'orientation', ['horizontal', 'vertical'], 'horizontal');
    const size = enumAttr(this, 'size', ['sm', 'md', 'lg'], 'md');
    const connector = enumAttr(this, 'connector', ['solid', 'dashed', 'none'], 'solid');
    const inline = enumAttr(this, 'label-placement', ['below', 'inline'], 'below') === 'inline';
    const mode = enumAttr(this, 'mode', ['linear', 'nonlinear'], 'linear');
    const clickable = boolAttr(this, 'clickable');
    const hideNumbers = boolAttr(this, 'hide-numbers');

    this.className = [
      'ds-stepper', `ds-stepper--${orient}`, `ds-stepper--${size}`,
      inline && orient === 'horizontal' ? 'ds-stepper--inline' : '',
      connector === 'dashed' ? 'ds-stepper--dashed' : '',
      connector === 'none' ? 'ds-stepper--no-connector' : '',
      hideNumbers ? 'ds-stepper--hide-numbers' : '',
      boolAttr(this, 'hide-labels') ? 'ds-stepper--hide-labels' : '',
      boolAttr(this, 'hide-descriptions') ? 'ds-stepper--hide-desc' : '',
      this._isRtl() ? 'ds-stepper--rtl' : '',
    ].filter(Boolean).join(' ');

    // Reflect an explicit `rtl` to `dir` so logical properties mirror the layout.
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else if (this.getAttribute('dir') === 'rtl') this.removeAttribute('dir');

    this.setAttribute('role', 'list');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Progress');

    const isz = ICON_SIZE[size];
    const rows = this._steps.map((s, i) => {
      const st = this._statusFor(s, i);
      const canClick = this._canClick(st, i, clickable, mode);
      const tag = canClick ? 'button' : 'span';
      const num = s.number != null ? s.number : (i + 1);
      // Node glyph. Completed always shows a check. Otherwise: in numberless
      // (hide-numbers) mode show the step's own label-based icon; else the number.
      let iconName = null;
      if (st === 'completed') iconName = 'tick';
      else if (hideNumbers && s.icon) iconName = s.icon;
      const glyph = iconName
        ? `<ds-icon class="ds-stepper__glyph" name="${this._esc(iconName)}" size="${isz}"></ds-icon>`
        : `<span class="ds-stepper__num">${this._esc(num)}</span>`;
      const optional = s.optional ? '<span class="ds-stepper__optional">Optional</span>' : '';
      const desc = s.description ? `<span class="ds-stepper__desc">${this._esc(s.description)}</span>` : '';
      const aria = [
        st === 'active' ? ' aria-current="step"' : '',
        st === 'error' ? ' aria-invalid="true"' : '',
      ].join('');
      const disAttr = (clickable || mode === 'nonlinear') && !canClick ? ' aria-disabled="true"' : '';
      const openTag = tag === 'button'
        ? `<button class="ds-stepper__main" type="button" data-idx="${i}"${disAttr}>`
        : `<span class="ds-stepper__main" data-idx="${i}"${disAttr}>`;
      return `<li class="ds-stepper__step ds-stepper__step--${st}" data-id="${this._esc(s.id != null ? s.id : i)}"${aria}>`
        + '<span class="ds-stepper__connector" aria-hidden="true"></span>'
        + openTag
        + `<span class="ds-stepper__node">${glyph}</span>`
        + `<span class="ds-stepper__text"><span class="ds-stepper__title">${this._esc(s.label != null ? s.label : '')}</span>${optional}${desc}</span>`
        + `</${tag}>`
        + '</li>';
    }).join('');

    const total = this._steps.length;
    const cur = this._steps[this.active];
    const summary = total ? `Step ${this.active + 1} of ${total}${cur && cur.label ? ': ' + cur.label : ''}` : '';
    const pct = total ? Math.round(((this.active + 1) / total) * 100) : 0;
    /* Compact summary — shown only when a horizontal stepper is too narrow (see
       the container query in the CSS); hidden from AT since the live region below
       already announces progress. */
    const compact = `<div class="ds-stepper__compact" aria-hidden="true">`
      + `<span class="ds-stepper__compact-label">${this._esc(summary)}</span>`
      + `<span class="ds-stepper__compact-bar"><span class="ds-stepper__compact-fill" style="inline-size:${pct}%"></span></span>`
      + `</div>`;
    this.innerHTML = rows + compact + `<span class="ds-stepper__sr" role="status" aria-live="polite">${this._esc(summary)}</span>`;
  }

  /* ── events ────────────────────────────────────────────────────────────── */
  _onClick(e) {
    const main = e.target.closest('.ds-stepper__main');
    if (!main || main.tagName !== 'BUTTON' || main.hasAttribute('aria-disabled')) return;
    this._select(parseInt(main.dataset.idx, 10));
  }
  _onKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const main = e.target.closest('.ds-stepper__main');
    if (!main || main.tagName !== 'BUTTON' || main.hasAttribute('aria-disabled')) return;
    e.preventDefault();
    this._select(parseInt(main.dataset.idx, 10));
  }
  _select(i) {
    const step = this._steps[i];
    if (!step) return;
    this.active = i;   // triggers re-render
    this.dispatchEvent(new CustomEvent('ds-stepper-select', {
      bubbles: true, composed: true, detail: { id: step.id, index: i, step },
    }));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-stepper')) {
  customElements.define('ds-stepper', DsStepper);
}
