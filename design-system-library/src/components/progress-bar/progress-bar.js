/* =============================================================================
   <ds-progress-bar variant="default" size="medium" value="42" max="100"
                    label="Uploading" value-label="42%" show-label disabled>
   </ds-progress-bar>

   - variant ∈ default | success | warning | error | indeterminate
   - size ∈ small | medium | large
   - When value-label is omitted it defaults to "{value}%" (or "—" indeterminate)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const VARIANTS = ['default', 'success', 'warning', 'error', 'indeterminate'];
const SIZES = ['small', 'medium', 'large'];

export class DsProgressBar extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'value', 'max', 'label', 'value-label', 'show-label', 'disabled', 'rtl'];
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback() {
    if (this._root) this._render();
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

    this._root.className = `ds-progress-bar ds-progress-bar--${variant} ds-progress-bar--${size}` + (disabled ? ' ds-progress-bar--disabled' : '');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const labelRow = showLabel
      ? `<div class="ds-progress-bar__row">
           <span class="ds-progress-bar__label">${label}</span>
           <span class="ds-progress-bar__value">${valueLabel}</span>
         </div>`
      : '';

    const fillStyle = indeterminate ? '' : `style="width: ${pct}%;"`;

    /* Per spec: indeterminate omits aria-valuenow (its absence signals the value
       is unknown). When a custom value-label is provided that isn't the auto
       generated "{pct}%", expose it via aria-valuetext so screen readers read
       the user-facing label (e.g. "Step 3 of 8") instead of just the percent. */
    const ariaAttrs = indeterminate
      ? `role="progressbar" aria-label="${label}"`
      : `role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"`
        + (customValueLabel ? ` aria-valuetext="${customValueLabel}"` : '');

    this._root.innerHTML = `
      ${labelRow}
      <div class="ds-progress-bar__track" ${ariaAttrs} ${disabled ? 'aria-disabled="true"' : ''}>
        <div class="ds-progress-bar__fill" ${fillStyle}></div>
      </div>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-progress-bar')) {
  customElements.define('ds-progress-bar', DsProgressBar);
}
