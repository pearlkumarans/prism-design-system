/* =============================================================================
   <ds-counter variant="subtle" state="active" size="small" value="142"
               max="99" aria-label="142 unread" rtl></ds-counter>

   Defaults (per spec, differ from Badge): variant=subtle, size=small,
   state=active. `max` caps the display ("99+") while aria-label should carry
   the real count at the consumer level.

   Numeric pill. Simpler sibling of <ds-badge>: no icon, always pill-shaped,
   intended for counts and notification numbers.

   The counter is visually symmetric (centred digit on a pill), but it accepts
   an `rtl` attribute for API consistency. When set, the host reflects
   `dir="rtl"` so the counter inherits the right direction in mixed contexts
   (e.g. inside a row of label + counter, the surrounding flex container will
   reorder correctly).
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const VARIANTS = ['subtle', 'intense'];
const STATES = ['default', 'active', 'critical', 'moderate', 'important', 'success', 'acknowledge'];
const SIZES = ['small', 'medium', 'large'];

export class DsCounter extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'state', 'size', 'value', 'max', 'rtl'];
  }

  connectedCallback() {
    if (!this._mounted) {
      // If consumer wrote text content, capture it as the value. Otherwise
      // use the `value` attribute. Reset the host's content to a single span.
      const textValue = this.textContent.trim();
      this.innerHTML = '';
      const valueSpan = document.createElement('span');
      valueSpan.className = 'ds-counter__value';
      this.appendChild(valueSpan);
      this._valueEl = valueSpan;
      if (textValue && !this.hasAttribute('value')) {
        this.setAttribute('value', textValue);
      }
      this._mounted = true;
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._mounted) this._sync();
  }

  _sync() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'subtle');
    const state   = enumAttr(this, 'state',   STATES,   'active');
    const size    = enumAttr(this, 'size',    SIZES,    'small');
    const value   = this.getAttribute('value') ?? '';

    // Overflow cap: numeric value above `max` renders as "<max>+" (e.g. 99+).
    // The pill stretches via fit-content — never truncate a number.
    const max = parseInt(this.getAttribute('max'), 10);
    const num = parseInt(value, 10);
    const display = (!isNaN(max) && !isNaN(num) && num > max) ? `${max}+` : value;

    // Replace ds-counter modifier classes only; keep consumer classes intact
    [...this.classList].forEach((c) => {
      if (c.startsWith('ds-counter')) this.classList.remove(c);
    });
    this.classList.add(
      'ds-counter',
      `ds-counter--${variant}`,
      `ds-counter--${state}`,
      `ds-counter--${size}`,
    );

    this._valueEl.textContent = display;

    // If the consumer hasn't supplied an aria-label, fall back to the value
    // for screen readers — the visible number is the meaningful content.
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', value);
    }

    /* Reflect rtl as dir="rtl" so the counter contributes correctly to any
       surrounding flex layout that uses CSS direction-based mirroring. */
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');
  }

  get value() { return this.getAttribute('value') ?? ''; }
  set value(v) { this.setAttribute('value', String(v)); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-counter')) {
  customElements.define('ds-counter', DsCounter);
}
