/* =============================================================================
   <ds-progress-bar shape="bar" variant="default" size="medium" value="42"
                    max="100" label="Uploading" value-label="42%" show-label
                    disabled>
   </ds-progress-bar>

   - shape ∈ bar | circle       (bar is the default — `circle` re-dresses the same
                                 progress, it does not change what it means)
   - variant ∈ default | success | warning | error | indeterminate
   - size ∈ small | medium | large
   - When value-label is omitted it defaults to "{value}%" (or "—" indeterminate)

   `circle` is a SHAPE, not a chart. It answers "how far along is this one task",
   which is why it keeps role="progressbar" and the identical ARIA contract. A
   ring showing how a total splits is ds-chart type="donut"; a value against a
   scale is ds-chart type="gauge". Reach for those instead the moment this needs
   segments, threshold zones, a semicircle, or min/max scale labels.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';

const VARIANTS = ['default', 'success', 'warning', 'error', 'indeterminate'];
const SIZES = ['small', 'medium', 'large'];
const SHAPES = ['bar', 'circle'];

/* One fixed geometry in user units; CSS scales the rendered size and sets the
   stroke width in px via vector-effect="non-scaling-stroke". Keeping r constant
   means the dash maths never has to know how big the circle is on screen. */
const R = 45;
const CIRCUMFERENCE = 2 * Math.PI * R;

export class DsProgressBar extends HTMLElement {
  static get observedAttributes() {
    return ['shape', 'variant', 'size', 'value', 'max', 'label', 'value-label', 'show-label', 'disabled', 'rtl'];
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* value/max/label/value-label change only the fill width, aria value, and label
       text — patch them in place so the CSS width transition actually animates. A
       full _render() would recreate the .fill node and the bar would jump instead
       of sliding. Anything that can change structure (variant↔indeterminate,
       show-label, size/disabled/rtl chrome) rebuilds. */
    /* `shape` swaps the whole rendered tree, so it must rebuild — patching would
       leave a bar's fill inside a circle's markup. */
    if (this._fill
        && name !== 'shape'
        && (name === 'value' || name === 'max' || name === 'label' || name === 'value-label')
        && !this._root.classList.contains('ds-progress-bar--indeterminate')) {
      this._paintValue();
    } else {
      this._render();
    }
  }

  _render() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'default');
    const size = enumAttr(this, 'size', SIZES, 'small'); /* spec default: small */
    const max = Math.max(1, Number(this.getAttribute('max') || 100));
    const valueRaw = Number(this.getAttribute('value'));
    const value = Number.isFinite(valueRaw) ? Math.min(max, Math.max(0, valueRaw)) : 0;
    const pct = (value / max) * 100;
    const label = this.getAttribute('label') || 'Progress';
    const customValueLabel = this.getAttribute('value-label');
    const valueLabel = customValueLabel
      ?? (variant === 'indeterminate' ? '—' : `${Math.round(pct)}%`);
    const showLabel = !this.hasAttribute('show-label') || this.getAttribute('show-label') !== 'false';
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');
    const indeterminate = variant === 'indeterminate';
    const shape = enumAttr(this, 'shape', SHAPES, 'bar');

    this._root.className = `ds-progress-bar ds-progress-bar--${variant} ds-progress-bar--${size}`
      + ` ds-progress-bar--${shape}`
      + (disabled ? ' ds-progress-bar--disabled' : '');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const labelRow = showLabel
      ? `<div class="ds-progress-bar__row">
           <span class="ds-progress-bar__label">${escapeHtml(label)}</span>
           <span class="ds-progress-bar__value">${escapeHtml(valueLabel)}</span>
         </div>`
      : '';

    const fillStyle = indeterminate ? '' : `style="width: ${pct}%;"`;
    /* Draw from the top and clockwise: the stroke starts at 3 o'clock, so rotate
       it back a quarter turn. Under RTL it mirrors, so progress still travels in
       the reading direction. */
    const dashOffset = indeterminate ? 0 : CIRCUMFERENCE * (1 - pct / 100);

    /* Per spec: indeterminate omits aria-valuenow (its absence signals the value
       is unknown). When a custom value-label is provided that isn't the auto
       generated "{pct}%", expose it via aria-valuetext so screen readers read
       the user-facing label (e.g. "Step 3 of 8") instead of just the percent. */
    const ariaAttrs = indeterminate
      ? `role="progressbar" aria-label="${escapeHtml(label)}"`
      : `role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"`
        + (customValueLabel ? ` aria-valuetext="${escapeHtml(customValueLabel)}"` : '');

    if (shape === 'circle') {
      /* The SVG is aria-hidden and the ARIA lives on the wrapper: a screen reader
         should hear one progressbar, not a graphic inside one. `show-label` false
         gives a bare ring — no centre value and no caption — matching how it
         removes the whole text row on the bar. */
      this._root.innerHTML = `
        <div class="ds-progress-bar__circle" ${ariaAttrs} ${disabled ? 'aria-disabled="true"' : ''}>
          <svg class="ds-progress-bar__svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <circle class="ds-progress-bar__circle-track" cx="50" cy="50" r="${R}"
                    vector-effect="non-scaling-stroke"></circle>
            <circle class="ds-progress-bar__circle-fill" cx="50" cy="50" r="${R}"
                    vector-effect="non-scaling-stroke"
                    stroke-dasharray="${CIRCUMFERENCE.toFixed(3)}"
                    ${indeterminate ? '' : `stroke-dashoffset="${dashOffset.toFixed(3)}"`}></circle>
          </svg>
          ${showLabel ? `<span class="ds-progress-bar__center">${escapeHtml(valueLabel)}</span>` : ''}
        </div>
        ${showLabel ? `<span class="ds-progress-bar__caption">${escapeHtml(label)}</span>` : ''}
      `;
    } else {
      this._root.innerHTML = `
        ${labelRow}
        <div class="ds-progress-bar__track" ${ariaAttrs} ${disabled ? 'aria-disabled="true"' : ''}>
          <div class="ds-progress-bar__fill" ${fillStyle}></div>
        </div>
      `;
    }

    /* Cache the nodes _paintValue() mutates so a value change never re-parses.
       _fill doubles as the "already rendered" flag in attributeChangedCallback,
       so the circle sets it to its indicator ring. */
    this._shape = shape;
    this._fill = this._root.querySelector('.ds-progress-bar__fill')
      || this._root.querySelector('.ds-progress-bar__circle-fill');
    this._track = this._root.querySelector('.ds-progress-bar__track')
      || this._root.querySelector('.ds-progress-bar__circle');
    this._labelEl = this._root.querySelector('.ds-progress-bar__label')
      || this._root.querySelector('.ds-progress-bar__caption');
    this._valueEl = this._root.querySelector('.ds-progress-bar__value')
      || this._root.querySelector('.ds-progress-bar__center');
  }

  /* In-place update of the fill width + aria value + label text — no innerHTML
     rebuild, so the .ds-progress-bar__fill width transition animates. */
  _paintValue() {
    const max = Math.max(1, Number(this.getAttribute('max') || 100));
    const valueRaw = Number(this.getAttribute('value'));
    const value = Number.isFinite(valueRaw) ? Math.min(max, Math.max(0, valueRaw)) : 0;
    const pct = (value / max) * 100;
    const label = this.getAttribute('label') || 'Progress';
    const customValueLabel = this.getAttribute('value-label');
    const valueLabel = customValueLabel ?? `${Math.round(pct)}%`;

    if (this._fill) {
      if (this._shape === 'circle') {
        /* setAttribute, not style: the CSS transition targets the presentation
           attribute, and a style rule here would win over the stylesheet and
           freeze the animation. */
        this._fill.setAttribute('stroke-dashoffset', (CIRCUMFERENCE * (1 - pct / 100)).toFixed(3));
      } else {
        this._fill.style.width = `${pct}%`;
      }
    }
    if (this._track) {
      this._track.setAttribute('aria-label', label);
      this._track.setAttribute('aria-valuemax', String(max));
      this._track.setAttribute('aria-valuenow', String(value));
      if (customValueLabel) this._track.setAttribute('aria-valuetext', customValueLabel);
      else this._track.removeAttribute('aria-valuetext');
    }
    if (this._labelEl) this._labelEl.textContent = label;
    if (this._valueEl) this._valueEl.textContent = valueLabel;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-progress-bar')) {
  customElements.define('ds-progress-bar', DsProgressBar);
}
