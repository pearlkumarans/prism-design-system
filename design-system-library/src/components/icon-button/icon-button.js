/* =============================================================================
   <ds-icon-button shape="square" type="primary" size="large" icon="trash" label="Delete">
   </ds-icon-button>

   - Renders a real <button> child, so form/keyboard semantics work natively.
   - `label` is required for accessibility (aria-label).
   - `icon` references a sprite symbol via <ds-icon name="...">.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* An icon-only button shows its `label` as a hover/focus tooltip by default, so
   the component depends on <ds-tooltip>. Import it (register the element) and
   auto-load its CSS so the tooltip works on any page that uses ds-icon-button,
   not just full-bundle pages. */
import '../tooltip/tooltip.js';
if (typeof document !== 'undefined') {
  const id = 'ds-icon-button-tooltip-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL('../tooltip/tooltip.css', import.meta.url).href;
    document.head.appendChild(link);
  }
}

const SHAPES = ['square', 'circle'];
const TYPES = ['primary', 'secondary', 'tertiary', 'outline', 'danger', 'tertiary-grey'];
const SIZES = ['xl', 'large', 'small', 'xsmall'];
const ICON_PX = { xl: 20, large: 16, small: 12, xsmall: 8 }; /* FIXED per spec — icon swaps can't resize the button */

export class DsIconButton extends HTMLElement {
  static get observedAttributes() {
    return ['shape', 'type', 'size', 'icon', 'label', 'disabled', 'tooltip-position'];
  }

  connectedCallback() {
    if (!this._btn) {
      this.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'ds-icon-button';
      btn.type = 'button';

      /* An icon-only button has no visible text, so show its `label` as a
         tooltip on hover/focus (the label already drives aria-label). Skip when
         `no-tooltip` is set, when there's no label, or when the caller already
         wrapped this button in a ds-tooltip. */
      const label = this.getAttribute('label') || '';
      const wantTip = label && !this.hasAttribute('no-tooltip') && !this.closest('ds-tooltip');
      if (wantTip) {
        const tip = document.createElement('ds-tooltip');
        tip.className = 'ds-icon-button__tip';
        tip.setAttribute('text', label);
        tip.setAttribute('show-icon', 'false');
        tip.setAttribute('position', this.getAttribute('tooltip-position') || 'up-center');
        tip.appendChild(btn);
        this.appendChild(tip);
        this._tip = tip;
      } else {
        this.appendChild(btn);
      }
      this._btn = btn;
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._btn) this._sync();
  }

  _sync() {
    const btn = this._btn;
    const shape = enumAttr(this, 'shape', SHAPES, 'square');
    const type = enumAttr(this, 'type', TYPES, 'primary');
    const size = enumAttr(this, 'size', SIZES, 'xl'); /* spec default: XL */
    const icon = this.getAttribute('icon') || '';
    const label = this.getAttribute('label') || '';
    const disabled = boolAttr(this, 'disabled');

    btn.className = `ds-icon-button ds-icon-button--${shape} ds-icon-button--${type} ds-icon-button--${size}`;
    btn.disabled = disabled;
    if (label) {
      btn.setAttribute('aria-label', label);
      // Keep the auto-tooltip text in sync with the label.
      if (this._tip) {
        this._tip.setAttribute('text', label);
        this._tip.setAttribute('position', this.getAttribute('tooltip-position') || 'up-center');
      }
    } else {
      btn.removeAttribute('aria-label');
      // Spec: aria-label is required. An icon-only button with no label has
      // no accessible name. Warn once per element so the developer can fix it.
      if (icon && !this._labelWarned) {
        // eslint-disable-next-line no-console
        console.warn('<ds-icon-button> is missing required `label` attribute — the button has no accessible name. Add label="…" describing the action.', this);
        this._labelWarned = true;
      }
    }

    btn.innerHTML = icon
      ? `<ds-icon name="${icon}" size="${ICON_PX[size]}"></ds-icon>`
      : '';
  }

  click() { this._btn?.click(); }
  focus(opts) { this._btn?.focus(opts); }
  blur() { this._btn?.blur(); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-icon-button')) {
  customElements.define('ds-icon-button', DsIconButton);
}
